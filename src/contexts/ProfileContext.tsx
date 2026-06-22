import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { AchievementToast } from "@/components/achievement-toast";
import {
  Achievement,
  getNewlyUnlockedAchievements,
} from "@/services/achievements";
import {
  ProfileService,
  ScanRecord,
  SchoolRole,
  UserProfile,
  UseType,
  calcPointsForScan,
  emptyProfile,
  getLevelForPoints,
  getProgressToNextLevel,
} from "@/services/profile";

const PROFILE_LOAD_TIMEOUT_MS = 2500;

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
  email: string;
  characterIndex: number;
  ecoPoints: number;
  totalScans: number;
  scanHistory: ScanRecord[];
  categoryStats: UserProfile["categoryStats"];
  level: ReturnType<typeof getLevelForPoints>;
  levelProgress: number;
  useType: UseType | null;
  schoolRole: SchoolRole | null;
  completeOnboarding: (
    name: string,
    characterIndex: number,
    useType?: UseType,
    schoolRole?: SchoolRole | null,
    email?: string,
  ) => Promise<void>;
  reloadProfile: () => Promise<void>;
  awardPoints: (points: number) => Promise<void>;
  recordScan: (scan: Omit<ScanRecord, "id" | "timestamp">) => Promise<RecordScanResult>;
  updateScanUpcyclingIdeas: (scanId: string, ideas: string[]) => Promise<void>;
  resetProfile: () => Promise<void>;
  logOut: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile());
  const [isLoading, setIsLoading] = useState(true);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);

  const profileRef = useRef(profile);
  profileRef.current = profile;

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const saved = await Promise.race([
          ProfileService.load(),
          new Promise<null>((resolve) =>
            setTimeout(resolve, PROFILE_LOAD_TIMEOUT_MS),
          ),
        ]);

        if (saved && isMounted) setProfile(saved);
      } catch (error) {
        console.warn("Profile load failed:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
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
    async (
      name: string,
      characterIndex: number,
      useType: UseType = "personal",
      schoolRole: SchoolRole | null = null,
      email = "",
    ) => {
      await updateProfile((prev) => ({
        ...prev,
        name,
        email,
        characterIndex,
        useType,
        schoolRole,
      }));
    },
    [updateProfile],
  );

  const reloadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const saved = await Promise.race([
        ProfileService.load(),
        new Promise<null>((resolve) =>
          setTimeout(resolve, PROFILE_LOAD_TIMEOUT_MS),
        ),
      ]);

      if (saved) setProfile(saved);
    } catch (error) {
      console.warn("Profile reload failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const awardPoints = useCallback(
    async (points: number) => {
      if (points <= 0) return;
      await updateProfile((current) => ({
        ...current,
        ecoPoints: current.ecoPoints + points,
      }));
    },
    [updateProfile],
  );

  const recordScan = useCallback(
    async (scan: Omit<ScanRecord, "id" | "timestamp">) => {
      const prev = profileRef.current;
      const today = new Date().toISOString().slice(0, 10);
      const nextStreak = prev.lastScanDate === today ? prev.scanStreak + 1 : 1;
      const nextTotalScans = prev.totalScans + 1;
      const newAchievements = getNewlyUnlockedAchievements(
        nextTotalScans,
        prev.unlockedAchievementIds,
      );
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
      const newAchievementIds = newAchievements.map(
        (achievement) => achievement.id,
      );

      await updateProfile((current) => ({
        ...current,
        ecoPoints: current.ecoPoints + result.points,
        totalScans: nextTotalScans,
        scanStreak: newStreak,
        lastScanDate: today,
        lastScanLabel: scan.objectLabel,
        unlockedAchievementIds: [
          ...new Set([
            ...(current.unlockedAchievementIds ?? []),
            ...newAchievementIds,
          ]),
        ],
        categoryStats: result.awarded
          ? {
              ...current.categoryStats,
              [scan.category]: current.categoryStats[scan.category] + 1,
            }
          : current.categoryStats,
        scanHistory: [record, ...current.scanHistory].slice(0, 100),
      }));

      if (newAchievements.length > 0) {
        setAchievementQueue((current) => [...current, ...newAchievements]);
      }

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

  const logOut = useCallback(async () => {
    const fresh = emptyProfile();
    setProfile(fresh);
    setAchievementQueue([]);
    await ProfileService.signOut();
  }, []);

  const dismissAchievement = useCallback(() => {
    setAchievementQueue((current) => current.slice(1));
  }, []);

  const value = useMemo<ProfileContextType>(() => {
    const level = getLevelForPoints(profile.ecoPoints);
    const levelProgress = getProgressToNextLevel(profile.ecoPoints);
    const isProfileComplete = !isLoading && profile.name.trim().length > 0;

    return {
      isLoading,
      isProfileComplete,
      name: profile.name,
      email: profile.email,
      characterIndex: profile.characterIndex,
      ecoPoints: profile.ecoPoints,
      totalScans: profile.totalScans,
      scanHistory: profile.scanHistory,
      categoryStats: profile.categoryStats,
      level,
      levelProgress,
      useType: profile.useType,
      schoolRole: profile.schoolRole,
      completeOnboarding,
      reloadProfile,
      awardPoints,
      recordScan,
      updateScanUpcyclingIdeas,
      resetProfile,
      logOut,
    };
  }, [
    profile,
    isLoading,
    completeOnboarding,
    reloadProfile,
    awardPoints,
    recordScan,
    updateScanUpcyclingIdeas,
    resetProfile,
    logOut,
  ]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
      <AchievementToast
        achievement={achievementQueue[0] ?? null}
        onDone={dismissAchievement}
      />
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
