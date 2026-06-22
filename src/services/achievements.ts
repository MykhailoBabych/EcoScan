import { IconName } from "@/components/icon";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  scanGoal: number;
  icon: IconName;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-scan",
    title: "My first scan!",
    description: "Scan an object for the first time",
    scanGoal: 1,
    icon: "qrcode.viewfinder",
  },
  {
    id: "ten-scans",
    title: "Experienced Environmentalist",
    description: "Scan 10 objects",
    scanGoal: 10,
    icon: "leaf.fill",
  },
];

export function getCompletedAchievementIds(totalScans: number): string[] {
  return ACHIEVEMENTS.filter((achievement) => totalScans >= achievement.scanGoal)
    .map((achievement) => achievement.id);
}

export function getNewlyUnlockedAchievements(
  totalScans: number,
  unlockedAchievementIds: string[],
): Achievement[] {
  const unlocked = new Set(unlockedAchievementIds);

  return ACHIEVEMENTS.filter(
    (achievement) =>
      totalScans >= achievement.scanGoal && !unlocked.has(achievement.id),
  );
}
