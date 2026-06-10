import { Storage, STORAGE_KEYS } from './storage';
import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type WasteCategory =
  | 'plastic'
  | 'glass'
  | 'paper'
  | 'cardboard'
  | 'metal'
  | 'food'
  | 'electronics'
  | 'unknown';

export type ScanRecord = {
  id: string;
  timestamp: number;
  objectLabel: string;
  category: WasteCategory;
  recyclingAdvice: string;
  upcyclingIdeas: string[];
};

export type CategoryStats = Record<WasteCategory, number>;

export type UseType = 'personal' | 'school';
export type SchoolRole = 'teacher' | 'student';

export type UserProfile = {
  name: string;
  email: string;
  characterIndex: number;
  ecoPoints: number;
  totalScans: number;
  scanStreak: number;         // consecutive scans for bonus tracking
  lastScanDate: string | null; // ISO date string YYYY-MM-DD
  categoryStats: CategoryStats;
  scanHistory: ScanRecord[];
  useType: UseType | null;
  schoolRole: SchoolRole | null;
};

// ─── Level System ─────────────────────────────────────────────────────────────

export type Level = {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
};

export const LEVELS: Level[] = [
  { level: 1, title: 'Eco Beginner',       minPoints: 0,    maxPoints: 99    },
  { level: 2, title: 'Green Scout',        minPoints: 100,  maxPoints: 249   },
  { level: 3, title: 'Eco Warrior',        minPoints: 250,  maxPoints: 499   },
  { level: 4, title: 'Sustainability Pro', minPoints: 500,  maxPoints: 999   },
  { level: 5, title: 'Planet Guardian',    minPoints: 1000, maxPoints: Infinity },
];

export function getLevelForPoints(points: number): Level {
  return (
    [...LEVELS].reverse().find((l) => points >= l.minPoints) ?? LEVELS[0]
  );
}

export function getProgressToNextLevel(points: number): number {
  const current = getLevelForPoints(points);
  if (current.maxPoints === Infinity) return 1;
  const range = current.maxPoints - current.minPoints + 1;
  const progress = points - current.minPoints;
  return Math.min(progress / range, 1);
}

// ─── Points Logic ─────────────────────────────────────────────────────────────

const BASE_SCAN_POINTS = 10;
const NEW_CATEGORY_BONUS = 25;
const STREAK_BONUS = 15;
const STREAK_THRESHOLD = 3;

export function calcPointsForScan(
  category: WasteCategory,
  categoryStats: CategoryStats,
  scanStreak: number,
): number {
  let points = BASE_SCAN_POINTS;
  if (categoryStats[category] === 0) points += NEW_CATEGORY_BONUS;
  if (scanStreak > 0 && scanStreak % STREAK_THRESHOLD === 0) points += STREAK_BONUS;
  return points;
}

// ─── Default values ───────────────────────────────────────────────────────────

export function emptyProfile(): UserProfile {
  return {
    name: '',
    email: '',
    characterIndex: 0,
    ecoPoints: 0,
    totalScans: 0,
    scanStreak: 0,
    lastScanDate: null,
    categoryStats: {
      plastic: 0, glass: 0, paper: 0,
      cardboard: 0, metal: 0, food: 0,
      electronics: 0, unknown: 0,
    },
    scanHistory: [],
    useType: null,
    schoolRole: null,
  };
}

// ─── Persistence ──────────────────────────────────────────────────────────────
// Strategy: AsyncStorage = fast local cache; Supabase = source of truth.
// On load: try remote first, fall back to cache. On save: write both.

export const ProfileService = {
  // ── Load ─────────────────────────────────────────────────────────────────────
  async load(): Promise<UserProfile | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return Storage.get<UserProfile>(STORAGE_KEYS.PROFILE);

      // Fetch profile row
      const { data: row, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !row) {
        // No row yet — fall back to local cache
        return Storage.get<UserProfile>(STORAGE_KEYS.PROFILE);
      }

      // Fetch scan history (latest 100)
      const { data: scans } = await supabase
        .from('scan_history')
        .select('*')
        .eq('profile_id', user.id)
        .order('timestamp_ms', { ascending: false })
        .limit(100);

      const scanHistory: ScanRecord[] = (scans ?? []).map((s) => ({
        id: s.id,
        timestamp: s.timestamp_ms,
        objectLabel: s.object_label,
        category: s.category as WasteCategory,
        recyclingAdvice: s.recycling_advice,
        upcyclingIdeas: s.upcycling_ideas ?? [],
      }));

      const profile: UserProfile = {
        name: row.name,
        email: row.email ?? '',
        characterIndex: row.character_index,
        ecoPoints: row.eco_points,
        totalScans: row.total_scans,
        scanStreak: row.scan_streak,
        lastScanDate: row.last_scan_date ?? null,
        categoryStats: row.category_stats,
        scanHistory,
        useType: row.use_type ?? null,
        schoolRole: row.school_role ?? null,
      };

      // Update local cache
      await Storage.set(STORAGE_KEYS.PROFILE, profile);
      return profile;
    } catch {
      return Storage.get<UserProfile>(STORAGE_KEYS.PROFILE);
    }
  },

  // ── Save ─────────────────────────────────────────────────────────────────────
  async save(profile: UserProfile): Promise<boolean> {
    const trimmed: UserProfile = {
      ...profile,
      scanHistory: profile.scanHistory.slice(0, 100),
    };

    // Always write local cache first (works offline)
    await Storage.set(STORAGE_KEYS.PROFILE, trimmed);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return true;

      // Upsert profile row
      await supabase.from('profiles').upsert({
        id: user.id,
        name: trimmed.name,
        email: trimmed.email || null,
        character_index: trimmed.characterIndex,
        eco_points: trimmed.ecoPoints,
        total_scans: trimmed.totalScans,
        scan_streak: trimmed.scanStreak,
        last_scan_date: trimmed.lastScanDate,
        category_stats: trimmed.categoryStats,
        use_type: trimmed.useType,
        school_role: trimmed.schoolRole,
      }, { onConflict: 'id' });

      // Sync latest scan if there is one
      if (trimmed.scanHistory.length > 0) {
        const latest = trimmed.scanHistory[0];
        await supabase.from('scan_history').upsert({
          id: latest.id,
          profile_id: user.id,
          timestamp_ms: latest.timestamp,
          object_label: latest.objectLabel,
          category: latest.category,
          recycling_advice: latest.recyclingAdvice,
          upcycling_ideas: latest.upcyclingIdeas,
        }, { onConflict: 'id' });
      }
    } catch (e) {
      console.warn('[ProfileService] remote save failed:', e);
    }

    return true;
  },

  // ── Clear ────────────────────────────────────────────────────────────────────
  async clear(): Promise<boolean> {
    await Storage.remove(STORAGE_KEYS.PROFILE);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').delete().eq('id', user.id);
      }
    } catch (e) {
      console.warn('[ProfileService] remote clear failed:', e);
    }

    return true;
  },
};
