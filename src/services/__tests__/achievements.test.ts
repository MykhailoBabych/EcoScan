import {
  ACHIEVEMENTS,
  getCompletedAchievementIds,
  getNewlyUnlockedAchievements,
} from "../achievements";

describe("achievements", () => {
  it("has unique ids", () => {
    const ids = ACHIEVEMENTS.map((achievement) => achievement.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("completes nothing before the first scan", () => {
    expect(getCompletedAchievementIds(0)).toEqual([]);
  });

  it("completes every achievement whose goal is reached", () => {
    expect(getCompletedAchievementIds(1)).toEqual(["first-scan"]);
    expect(getCompletedAchievementIds(10)).toEqual(["first-scan", "ten-scans"]);
  });

  it("only returns achievements that were not unlocked yet", () => {
    const fresh = getNewlyUnlockedAchievements(10, ["first-scan"]);
    expect(fresh.map((achievement) => achievement.id)).toEqual(["ten-scans"]);
  });

  it("returns nothing when everything reached is already unlocked", () => {
    expect(getNewlyUnlockedAchievements(10, ["first-scan", "ten-scans"])).toEqual([]);
  });
});
