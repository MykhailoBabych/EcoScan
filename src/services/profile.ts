import { Storage, STORAGE_KEYS } from "./storage";
import { supabase } from "./supabase";

export type WasteCategory =
  | "plastic"
  | "glass"
  | "paper"
  | "cardboard"
  | "metal"
  | "food"
  | "electronics"
  | "unknown";

export type ScanRecord = {
  id: string;
  timestamp: number;
  objectLabel: string;
  category: WasteCategory;
  recyclingAdvice: string;
  upcyclingIdeas: string[];
};

export type CategoryStats = Record<WasteCategory, number>;

export type UseType = "personal" | "school";
export type SchoolRole = "teacher" | "student";

export type UserProfile = {
  name: string;
  email: string;
  characterIndex: number;
  ecoPoints: number;
  totalScans: number;
  scanStreak: number;
  lastScanDate: string | null;
  lastScanLabel: string | null;
  categoryStats: CategoryStats;
  scanHistory: ScanRecord[];
  useType: UseType | null;
  schoolRole: SchoolRole | null;
};

export type Level = {
  level: number;
  title: string;
  minPoints: number;
  maxPoints: number;
};

export const LEVELS: Level[] = [
  { level: 1, title: "Eco Beginner", minPoints: 0, maxPoints: 99 },
  { level: 2, title: "Green Scout", minPoints: 100, maxPoints: 249 },
  { level: 3, title: "Eco Warrior", minPoints: 250, maxPoints: 499 },
  { level: 4, title: "Sustainability Pro", minPoints: 500, maxPoints: 999 },
  { level: 5, title: "Planet Guardian", minPoints: 1000, maxPoints: Infinity },
];

export function getLevelForPoints(points: number): Level {
  return [...LEVELS].reverse().find((level) => points >= level.minPoints) ?? LEVELS[0];
}

export function getProgressToNextLevel(points: number): number {
  const current = getLevelForPoints(points);
  if (current.maxPoints === Infinity) return 1;
  const range = current.maxPoints - current.minPoints + 1;
  const progress = points - current.minPoints;
  return Math.min(progress / range, 1);
}

const BASE_SCAN_POINTS = 10;
const NEW_CATEGORY_BONUS = 25;
const STREAK_BONUS = 15;
const STREAK_THRESHOLD = 3;

export type ScanPointsResult = {
  points: number;
  awarded: boolean;
  reason: "awarded" | "duplicate" | "unknown";
};

export function calcPointsForScan(
  category: WasteCategory,
  objectLabel: string,
  categoryStats: CategoryStats,
  scanStreak: number,
  lastScanLabel?: string | null,
): ScanPointsResult {
  if (category === "unknown") {
    return { points: 0, awarded: false, reason: "unknown" };
  }

  const normalizedLabel = objectLabel.trim().toLowerCase();
  const normalizedPrevious = lastScanLabel?.trim().toLowerCase();

  if (normalizedLabel && normalizedPrevious === normalizedLabel) {
    return { points: 0, awarded: false, reason: "duplicate" };
  }

  let points = BASE_SCAN_POINTS;
  if (categoryStats[category] === 0) points += NEW_CATEGORY_BONUS;
  if (scanStreak > 0 && scanStreak % STREAK_THRESHOLD === 0) {
    points += STREAK_BONUS;
  }

  return { points, awarded: true, reason: "awarded" };
}

export function emptyProfile(): UserProfile {
  return {
    name: "",
    email: "",
    characterIndex: 0,
    ecoPoints: 0,
    totalScans: 0,
    scanStreak: 0,
    lastScanDate: null,
    lastScanLabel: null,
    categoryStats: {
      plastic: 0,
      glass: 0,
      paper: 0,
      cardboard: 0,
      metal: 0,
      food: 0,
      electronics: 0,
      unknown: 0,
    },
    scanHistory: [],
    useType: null,
    schoolRole: null,
  };
}

function normalizeProfile(profile: UserProfile): UserProfile {
  const fallback = emptyProfile();

  return {
    ...fallback,
    ...profile,
    email: profile.email ?? "",
    lastScanLabel: profile.lastScanLabel ?? null,
    categoryStats: {
      ...fallback.categoryStats,
      ...profile.categoryStats,
    },
    scanHistory: profile.scanHistory ?? [],
    useType: profile.useType ?? null,
    schoolRole: profile.schoolRole ?? null,
  };
}

export const ProfileService = {
  async load(): Promise<UserProfile | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const profile = await Storage.get<UserProfile>(STORAGE_KEYS.PROFILE);
        return profile ? normalizeProfile(profile) : null;
      }

      const { data: row, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !row) {
        const profile = await Storage.get<UserProfile>(STORAGE_KEYS.PROFILE);
        return profile ? normalizeProfile(profile) : null;
      }

      const { data: scans } = await supabase
        .from("scan_history")
        .select("*")
        .eq("profile_id", user.id)
        .order("timestamp_ms", { ascending: false })
        .limit(100);

      const scanHistory: ScanRecord[] = (scans ?? []).map((scan: any) => ({
        id: scan.id,
        timestamp: scan.timestamp_ms,
        objectLabel: scan.object_label,
        category: scan.category as WasteCategory,
        recyclingAdvice: scan.recycling_advice,
        upcyclingIdeas: scan.upcycling_ideas ?? [],
      }));

      const profile = normalizeProfile({
        name: row.name ?? "",
        email: row.email ?? user.email ?? "",
        characterIndex: row.character_index ?? 0,
        ecoPoints: row.eco_points ?? 0,
        totalScans: row.total_scans ?? 0,
        scanStreak: row.scan_streak ?? 0,
        lastScanDate: row.last_scan_date ?? null,
        lastScanLabel: null,
        categoryStats: row.category_stats ?? emptyProfile().categoryStats,
        scanHistory,
        useType: row.use_type ?? null,
        schoolRole: row.school_role ?? null,
      });

      await Storage.set(STORAGE_KEYS.PROFILE, profile);
      return profile;
    } catch {
      const profile = await Storage.get<UserProfile>(STORAGE_KEYS.PROFILE);
      return profile ? normalizeProfile(profile) : null;
    }
  },

  async save(profile: UserProfile): Promise<boolean> {
    const toSave: UserProfile = {
      ...profile,
      scanHistory: profile.scanHistory.slice(0, 100),
    };
    await Storage.set(STORAGE_KEYS.PROFILE, toSave);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return true;

      await supabase.from("profiles").upsert(
        {
          id: user.id,
          name: toSave.name,
          email: toSave.email || user.email || null,
          character_index: toSave.characterIndex,
          eco_points: toSave.ecoPoints,
          total_scans: toSave.totalScans,
          scan_streak: toSave.scanStreak,
          last_scan_date: toSave.lastScanDate,
          category_stats: toSave.categoryStats,
          use_type: toSave.useType,
          school_role: toSave.schoolRole,
        },
        { onConflict: "id" },
      );

      const latest = toSave.scanHistory[0];
      if (latest) {
        await supabase.from("scan_history").upsert(
          {
            id: latest.id,
            profile_id: user.id,
            timestamp_ms: latest.timestamp,
            object_label: latest.objectLabel,
            category: latest.category,
            recycling_advice: latest.recyclingAdvice,
            upcycling_ideas: latest.upcyclingIdeas,
          },
          { onConflict: "id" },
        );
      }
    } catch (error) {
      console.warn("[ProfileService] remote save failed:", error);
    }

    return true;
  },

  async clear(): Promise<boolean> {
    await Storage.remove(STORAGE_KEYS.PROFILE);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("profiles").delete().eq("id", user.id);
      }
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("[ProfileService] remote clear failed:", error);
    }

    return true;
  },

  async signOut(): Promise<boolean> {
    await Storage.remove(STORAGE_KEYS.PROFILE);

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn("[ProfileService] sign out failed:", error);
    }

    return true;
  },
};
