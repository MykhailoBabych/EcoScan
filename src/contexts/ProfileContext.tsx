import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ProfileService,
  ScanRecord,
  UserProfile,
  calcPointsForScan,
  emptyProfile,
  getLevelForPoints,
  getProgressToNextLevel
} from "@/services/profile";

// ─── Context shape ────────────────────────────────────────────────────────────

type ProfileContextType = {
  isLoading: boolean;
  isProfileComplete: boolean;
  name: string;
  characterIndex: number;
  ecoPoints: number;
  totalScans: number;
  scanHistory: ScanRecord[];
  categoryStats: UserProfile["categoryStats"];
  level: ReturnType<typeof getLevelForPoints>;
  levelProgress: number;
  completeOnboarding: (name: string, characterIndex: number) => Promise<void>;
  recordScan: (
    scan: Omit<ScanRecord, "id" | "timestamp">,
  ) => Promise<{ pointsEarned: number; awarded: boolean; reason: string }>;
  resetProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile());
  const [isLoading, setIsLoading] = useState(true);

  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    (async () => {
      const saved = await ProfileService.load();
      if (saved) setProfile(saved);
      setIsLoading(false);
    })();
  }, []);

  const updateProfile = useCallback(
    async (updater: (prev: UserProfile) => UserProfile) => {
      const next = updater(profileRef.current);
      setProfile(next);
      await ProfileService.save(next);
      return next;
    },
    [],
  );

  const completeOnboarding = useCallback(
    async (name: string, characterIndex: number) => {
      await updateProfile((prev) => ({ ...prev, name, characterIndex }));
    },
    [updateProfile],
  );

  const recordScan = useCallback(
    async (scan: Omit<ScanRecord, "id" | "timestamp">) => {
      const prev = profileRef.current;
      const today = new Date().toISOString().slice(0, 10);

      const result = calcPointsForScan(
        scan.category,
        scan.objectLabel,
        prev.categoryStats,
        // Streak only advances when points are actually awarded; compute below
        prev.lastScanDate === today ? prev.scanStreak + 1 : 1,
        prev.lastScanLabel,
      );

      // Streak only counts valid (awarded) scans on the same day
      const newStreak = result.awarded
        ? prev.lastScanDate === today
          ? prev.scanStreak + 1
          : 1
        : prev.scanStreak;

      const record: ScanRecord = {
        ...scan,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
      };

      await updateProfile((p) => ({
        ...p,
        ecoPoints: p.ecoPoints + result.points,
        // totalScans counts every scan attempt that was recorded
        totalScans: p.totalScans + 1,
        scanStreak: newStreak,
        lastScanDate: today,
        lastScanLabel: scan.objectLabel,
        // Only count category stats for awarded scans
        categoryStats: result.awarded
          ? {
              ...p.categoryStats,
              [scan.category]: p.categoryStats[scan.category] + 1,
            }
          : p.categoryStats,
        scanHistory: [record, ...p.scanHistory].slice(0, 100),
      }));

      return {
        pointsEarned: result.points,
        awarded: result.awarded,
        reason: result.reason,
      };
    },
    [updateProfile],
  );

  const resetProfile = useCallback(async () => {
    const fresh = emptyProfile();
    setProfile(fresh);
    await ProfileService.save(fresh);
  }, []);

  const isProfileComplete = !isLoading && profile.name.trim().length > 0;
  const level = getLevelForPoints(profile.ecoPoints);
  const levelProgress = getProgressToNextLevel(profile.ecoPoints);

  return (
    <ProfileContext.Provider
      value={{
        isLoading,
        isProfileComplete,
        name: profile.name,
        characterIndex: profile.characterIndex,
        ecoPoints: profile.ecoPoints,
        totalScans: profile.totalScans,
        scanHistory: profile.scanHistory,
        categoryStats: profile.categoryStats,
        level,
        levelProgress,
        completeOnboarding,
        recordScan,
        resetProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
