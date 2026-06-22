import { Storage } from './storage';
import { supabase } from './supabase';

const LESSONS_KEY       = 'ecoscan:lessons';
const STUDENT_LESSONS_KEY = 'ecoscan:student_lessons';

// ─── Types ────────────────────────────────────────────────────────────────────

export type Lesson = {
  id: string;
  topic: string;
  assignment: string;
  scanTarget: string;      // what the student needs to scan, e.g. "plastic bottle"
  xpReward: number;
  pointsReward: number;
  createdAt: number;
};

export type StudentLesson = {
  id: string;              // student_lessons.id (UUID)
  lessonId: string;
  topic: string;
  assignment: string;
  scanTarget: string;
  xpReward: number;
  pointsReward: number;
  status: 'active' | 'completed';
  acceptedAt: number;
  completedAt: number | null;
};

// ─── Teacher: manage own lessons ──────────────────────────────────────────────

export const LessonsService = {
  async load(): Promise<Lesson[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return (await Storage.get<Lesson[]>(LESSONS_KEY)) ?? [];

      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) return (await Storage.get<Lesson[]>(LESSONS_KEY)) ?? [];

      const lessons: Lesson[] = data.map(rowToLesson);
      await Storage.set(LESSONS_KEY, lessons);
      return lessons;
    } catch {
      return (await Storage.get<Lesson[]>(LESSONS_KEY)) ?? [];
    }
  },

  async add(data: Omit<Lesson, 'id' | 'createdAt'>): Promise<Lesson> {
    const lesson: Lesson = {
      ...data,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      createdAt: Date.now(),
    };

    const existing = (await Storage.get<Lesson[]>(LESSONS_KEY)) ?? [];
    await Storage.set(LESSONS_KEY, [lesson, ...existing]);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('lessons').insert({
          id: lesson.id,
          profile_id: user.id,
          topic: lesson.topic,
          assignment: lesson.assignment,
          scan_target: lesson.scanTarget,
          xp_reward: lesson.xpReward,
          points_reward: lesson.pointsReward,
        });
      }
    } catch (e) {
      console.warn('[LessonsService] remote add failed:', e);
    }

    return lesson;
  },

  async remove(id: string): Promise<void> {
    const existing = (await Storage.get<Lesson[]>(LESSONS_KEY)) ?? [];
    await Storage.set(LESSONS_KEY, existing.filter((l) => l.id !== id));
    try {
      await supabase.from('lessons').delete().eq('id', id);
    } catch (e) {
      console.warn('[LessonsService] remote remove failed:', e);
    }
  },

  /** Send a lesson to a student by their profile ID. */
  async sendToStudentById(
    lessonId: string,
    studentId: string,
  ): Promise<'ok' | 'lesson_not_found' | 'not_owner' | 'student_not_found' | 'error'> {
    try {
      const { data, error } = await supabase.rpc('send_lesson_to_student_by_id', {
        p_lesson_id:  lessonId,
        p_student_id: studentId,
      });
      if (error) {
        console.warn('[LessonsService] sendToStudentById RPC error:', error.message);
        return 'error';
      }
      return data as 'ok' | 'lesson_not_found' | 'not_owner' | 'student_not_found';
    } catch (e) {
      console.warn('[LessonsService] sendToStudentById failed:', e);
      return 'error';
    }
  },
};

// ─── Student: browse + accept + complete lessons ──────────────────────────────

export const StudentLessonsService = {
  /** All published lessons from all teachers (for browsing) */
  async loadAvailable(): Promise<Lesson[]> {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map(rowToLesson);
    } catch {
      return [];
    }
  },

  /** Lessons the student has accepted (active + completed) */
  async loadMine(): Promise<StudentLesson[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return (await Storage.get<StudentLesson[]>(STUDENT_LESSONS_KEY)) ?? [];

      const { data, error } = await supabase
        .from('student_lessons')
        .select(`
          id, status, accepted_at, completed_at,
          lessons ( id, topic, assignment, scan_target, xp_reward, points_reward )
        `)
        .eq('student_id', user.id)
        .order('accepted_at', { ascending: false });

      if (error || !data) return (await Storage.get<StudentLesson[]>(STUDENT_LESSONS_KEY)) ?? [];

      const cached = (await Storage.get<StudentLesson[]>(STUDENT_LESSONS_KEY)) ?? [];
      const completedById = new Map(
        cached
          .filter((lesson) => lesson.status === 'completed')
          .map((lesson) => [lesson.id, lesson] as const),
      );

      const mine: StudentLesson[] = data
        .filter((row: any) => row.lessons)
        .map((row: any) => {
          const cachedCompleted = completedById.get(row.id);

          return {
            id: row.id,
            lessonId: row.lessons.id,
            topic: row.lessons.topic,
            assignment: row.lessons.assignment,
            scanTarget: row.lessons.scan_target,
            xpReward: row.lessons.xp_reward,
            pointsReward: row.lessons.points_reward,
            status: cachedCompleted?.status ?? row.status,
            acceptedAt: new Date(row.accepted_at).getTime(),
            completedAt:
              cachedCompleted?.completedAt ??
              (row.completed_at ? new Date(row.completed_at).getTime() : null),
          };
        });

      await Storage.set(STUDENT_LESSONS_KEY, mine);
      return mine;
    } catch {
      return (await Storage.get<StudentLesson[]>(STUDENT_LESSONS_KEY)) ?? [];
    }
  },

  async accept(lessonId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('student_lessons').upsert({
        student_id: user.id,
        lesson_id: lessonId,
        status: 'active',
      }, { onConflict: 'student_id,lesson_id', ignoreDuplicates: true });
    } catch (e) {
      console.warn('[StudentLessonsService] accept failed:', e);
    }
  },

  /**
   * Called from scanner when scanned labels match lesson scan targets.
   * Returns every completed lesson so caller can award XP/points.
   */
  async tryCompleteAll(scannedLabels: string | string[]): Promise<StudentLesson[]> {
    try {
      const mine = await StudentLessonsService.loadMine();
      const active = mine.filter((l) => l.status === 'active');

      const labelText = (Array.isArray(scannedLabels) ? scannedLabels : [scannedLabels])
        .join(' ')
        .toLowerCase();
      const matched = active.filter((l) =>
        getScanTargetKeywords(l.scanTarget).some((kw) => labelText.includes(kw))
      );

      if (matched.length === 0) return [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const completedAtIso = new Date().toISOString();
      const completedAtMs = Date.now();
      const ids = matched.map((lesson) => lesson.id);

      const { error } = await supabase
        .from('student_lessons')
        .update({ status: 'completed', completed_at: completedAtIso })
        .eq('student_id', user.id)
        .in('id', ids);

      if (error) {
        console.warn('[StudentLessonsService] complete update failed:', error.message);
      }

      // Update local cache
      const cached = (await Storage.get<StudentLesson[]>(STUDENT_LESSONS_KEY)) ?? [];
      await Storage.set(
        STUDENT_LESSONS_KEY,
        cached.map((l) =>
          ids.includes(l.id)
            ? { ...l, status: 'completed', completedAt: completedAtMs }
            : l
        )
      );

      return matched.map((lesson) => ({
        ...lesson,
        status: 'completed',
        completedAt: completedAtMs,
      }));
    } catch (e) {
      console.warn('[StudentLessonsService] tryCompleteAll failed:', e);
      return [];
    }
  },
};

// ─── Leaderboard ─────────────────────────────────────────────────────────────

export type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
};

export const LeaderboardService = {
  async load(limit = 20): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase.rpc('get_leaderboard', { p_limit: limit });
      if (error || !data) return [];
      return (data as any[]).map((row) => ({
        rank: Number(row.rank),
        name: row.name as string,
        score: Number(row.score),
      }));
    } catch {
      return [];
    }
  },
};

// ─── Teacher: load student list ──────────────────────────────────────────────

export type StudentProfile = {
  id: string;
  name: string;
  email: string;
};

export const StudentsService = {
  async loadAll(): Promise<StudentProfile[]> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('school_role', 'student')
        .order('name');
      if (error || !data) return [];
      return data.map((r: any) => ({
        id: r.id,
        name: r.name || 'Unnamed',
        email: r.email || '',
      }));
    } catch {
      return [];
    }
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rowToLesson(row: any): Lesson {
  return {
    id: row.id,
    topic: row.topic,
    assignment: row.assignment,
    scanTarget: row.scan_target ?? '',
    xpReward: row.xp_reward,
    pointsReward: row.points_reward,
    createdAt: new Date(row.created_at).getTime(),
  };
}

function getScanTargetKeywords(scanTarget: string) {
  return scanTarget
    .toLowerCase()
    .split(/[\s,;/|]+/)
    .map((kw) => kw.trim())
    .filter((kw) => kw.length > 2);
}
