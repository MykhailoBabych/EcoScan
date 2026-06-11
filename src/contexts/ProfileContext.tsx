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
  getProgressToNextLevel,
} from "@/services/profile";

type RecordScanResult = {
  pointsEarned: number;
  scanId: string;
  awarded: boolean;
  reason: string;
};

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
  recordScan: (scan: Omit<ScanRecord, "id" | "timestamp">) => Promise<RecordScanResult>;
  updateScanUpcyclingIdeas: (scanId: string, ideas: string[]) => Promise<void>;
  resetProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

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
      const nextStreak = prev.lastScanDate === today ? prev.scanStreak + 1 : 1;
      const result = calcPointsForScan(
        scan.category,
        scan.objectLabel,
        prev.categoryStats,
        nextStreak,
        prev.lastScanLabel,
      );

      const newStreak = result.awarded ? nextStreak : prev.scanStreak;
      const record: ScanRecord = {
        ...scan,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
      };

      await updateProfile((current) => ({
        ...current,
        ecoPoints: current.ecoPoints + result.points,
        totalScans: current.totalScans + 1,
        scanStreak: newStreak,
        lastScanDate: today,
        lastScanLabel: scan.objectLabel,
        categoryStats: result.awarded
          ? {
              ...current.categoryStats,
              [scan.category]: current.categoryStats[scan.category] + 1,
            }
          : current.categoryStats,
        scanHistory: [record, ...current.scanHistory].slice(0, 100),
      }));

      return {
        pointsEarned: result.points,
        scanId: record.id,
        awarded: result.awarded,
        reason: result.reason,
      };
    },
    [updateProfile],
  );

  const updateScanUpcyclingIdeas = useCallback(
    async (scanId: string, ideas: string[]) => {
      await updateProfile((current) => ({
        ...current,
        scanHistory: current.scanHistory.map((scan) =>
          scan.id === scanId ? { ...scan, upcyclingIdeas: ideas } : scan,
        ),
      }));
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
        updateScanUpcyclingIdeas,
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
