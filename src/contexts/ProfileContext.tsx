import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  WasteCategory,
  ScanRecord,
  UserProfile,
  ProfileService,
  calcPointsForScan,
  emptyProfile,
  getLevelForPoints,
  getProgressToNextLevel,
} from '@/services/profile';

// ─── Context shape ────────────────────────────────────────────────────────────

type ProfileContextType = {
  isLoading: boolean;
  isProfileComplete: boolean;
  name: string;
  characterIndex: number;
  ecoPoints: number;
  totalScans: number;
  scanHistory: ScanRecord[];
  categoryStats: UserProfile['categoryStats'];
  level: ReturnType<typeof getLevelForPoints>;
  levelProgress: number;
  completeOnboarding: (name: string, characterIndex: number) => Promise<void>;
  recordScan: (
    scan: Omit<ScanRecord, 'id' | 'timestamp'>
  ) => Promise<{ pointsEarned: number }>;
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
    []
  );

  const completeOnboarding = useCallback(
    async (name: string, characterIndex: number) => {
      await updateProfile((prev) => ({ ...prev, name, characterIndex }));
    },
    [updateProfile]
  );

  const recordScan = useCallback(
    async (scan: Omit<ScanRecord, 'id' | 'timestamp'>) => {
      const prev = profileRef.current;
      const today = new Date().toISOString().slice(0, 10);
      const newStreak =
        prev.lastScanDate === today ? prev.scanStreak + 1 : 1;
      const pointsEarned = calcPointsForScan(
        scan.category,
        prev.categoryStats,
        newStreak
      );
      const record: ScanRecord = {
        ...scan,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        timestamp: Date.now(),
      };
      await updateProfile((p) => ({
        ...p,
        ecoPoints: p.ecoPoints + pointsEarned,
        totalScans: p.totalScans + 1,
        scanStreak: newStreak,
        lastScanDate: today,
        categoryStats: {
          ...p.categoryStats,
          [scan.category]: p.categoryStats[scan.category] + 1,
        },
        scanHistory: [record, ...p.scanHistory].slice(0, 100),
      }));
      return { pointsEarned };
    },
    [updateProfile]
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
  if (!ctx) throw new Error('useProfile must be used within a ProfileProvider');
  return ctx;
}
