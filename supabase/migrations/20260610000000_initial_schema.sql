-- EcoScan database schema.
--
-- Reconstructed from how the app uses Supabase (src/services/profile.ts and
-- src/services/lessons.ts). Apply it to a new Supabase project with
-- `supabase db push`, or paste it into the SQL Editor.

-- ─── Tables ──────────────────────────────────────────────────────────────────

create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  name            text not null default '',
  email           text,
  character_index integer not null default 0,
  eco_points      integer not null default 0 check (eco_points >= 0),
  total_scans     integer not null default 0 check (total_scans >= 0),
  scan_streak     integer not null default 0 check (scan_streak >= 0),
  last_scan_date  date,
  category_stats  jsonb not null default '{}'::jsonb,
  use_type        text check (use_type in ('personal', 'school')),
  school_role     text check (school_role in ('teacher', 'student')),
  created_at      timestamptz not null default now()
);

-- Scan ids are generated on the device ("<timestamp>-<random>"), so they are text.
create table public.scan_history (
  id               text primary key,
  profile_id       uuid not null references public.profiles (id) on delete cascade,
  timestamp_ms     bigint not null,
  object_label     text not null,
  category         text not null,
  recycling_advice text,
  upcycling_ideas  text[] not null default '{}'
);

create index scan_history_profile_time_idx
  on public.scan_history (profile_id, timestamp_ms desc);

-- Lesson ids are also generated on the device.
create table public.lessons (
  id            text primary key,
  profile_id    uuid not null references public.profiles (id) on delete cascade,
  topic         text not null,
  assignment    text not null,
  scan_target   text not null default '',
  xp_reward     integer not null default 0,
  points_reward integer not null default 0,
  created_at    timestamptz not null default now()
);

create index lessons_profile_idx on public.lessons (profile_id, created_at desc);

create table public.student_lessons (
  id           uuid primary key default gen_random_uuid(),
  student_id   uuid not null references public.profiles (id) on delete cascade,
  lesson_id    text not null references public.lessons (id) on delete cascade,
  status       text not null default 'active' check (status in ('active', 'completed')),
  accepted_at  timestamptz not null default now(),
  completed_at timestamptz,
  unique (student_id, lesson_id)
);

-- ─── Helpers ─────────────────────────────────────────────────────────────────

-- Runs as the owner so that policies on `profiles` can check the caller's role
-- without querying `profiles` recursively.
create function public.is_teacher()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and school_role = 'teacher'
  );
$$;

-- ─── Row Level Security ──────────────────────────────────────────────────────

alter table public.profiles        enable row level security;
alter table public.scan_history    enable row level security;
alter table public.lessons         enable row level security;
alter table public.student_lessons enable row level security;

-- profiles: users manage their own row; teachers can see students to send lessons.
create policy "Users read own profile"
  on public.profiles for select to authenticated
  using (id = auth.uid());

create policy "Teachers read student profiles"
  on public.profiles for select to authenticated
  using (school_role = 'student' and public.is_teacher());

create policy "Users create own profile"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

create policy "Users update own profile"
  on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

create policy "Users delete own profile"
  on public.profiles for delete to authenticated
  using (id = auth.uid());

-- scan_history: private to its owner.
create policy "Users manage own scans"
  on public.scan_history for all to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- lessons: every signed-in user can browse; only the author can change them.
create policy "Signed-in users read lessons"
  on public.lessons for select to authenticated
  using (true);

create policy "Teachers create own lessons"
  on public.lessons for insert to authenticated
  with check (profile_id = auth.uid() and public.is_teacher());

create policy "Authors update own lessons"
  on public.lessons for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "Authors delete own lessons"
  on public.lessons for delete to authenticated
  using (profile_id = auth.uid());

-- student_lessons: students see and update their own; teachers see progress on their lessons.
create policy "Students read own lessons"
  on public.student_lessons for select to authenticated
  using (student_id = auth.uid());

create policy "Teachers read progress on own lessons"
  on public.student_lessons for select to authenticated
  using (exists (
    select 1 from public.lessons l
    where l.id = lesson_id and l.profile_id = auth.uid()
  ));

create policy "Students accept lessons"
  on public.student_lessons for insert to authenticated
  with check (student_id = auth.uid() and status = 'active');

create policy "Students update own lessons"
  on public.student_lessons for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());

-- ─── RPC functions ───────────────────────────────────────────────────────────

-- Public leaderboard: exposes only display name and points, never emails.
create function public.get_leaderboard(p_limit integer default 20)
returns table (rank bigint, name text, score integer)
language sql
stable
security definer
set search_path = public
as $$
  select
    rank() over (order by p.eco_points desc) as rank,
    coalesce(nullif(trim(p.name), ''), 'Eco friend') as name,
    p.eco_points as score
  from public.profiles p
  where p.eco_points > 0
  order by p.eco_points desc
  limit least(greatest(p_limit, 1), 100);
$$;

-- Lets a teacher assign one of their lessons to a student.
create function public.send_lesson_to_student_by_id(
  p_lesson_id  text,
  p_student_id uuid
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  select profile_id into v_owner from public.lessons where id = p_lesson_id;
  if not found then
    return 'lesson_not_found';
  end if;

  if v_owner is distinct from auth.uid() then
    return 'not_owner';
  end if;

  if not exists (
    select 1 from public.profiles
    where id = p_student_id and school_role = 'student'
  ) then
    return 'student_not_found';
  end if;

  insert into public.student_lessons (student_id, lesson_id, status)
  values (p_student_id, p_lesson_id, 'active')
  on conflict (student_id, lesson_id) do nothing;

  return 'ok';
end;
$$;

revoke all on function public.get_leaderboard(integer) from public, anon;
revoke all on function public.send_lesson_to_student_by_id(text, uuid) from public, anon;
revoke all on function public.is_teacher() from public, anon;
grant execute on function public.get_leaderboard(integer) to anon, authenticated;
grant execute on function public.send_lesson_to_student_by_id(text, uuid) to authenticated;
grant execute on function public.is_teacher() to authenticated;
