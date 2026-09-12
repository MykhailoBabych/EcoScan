import {
  calcPointsForScan,
  emptyProfile,
  getLevelForPoints,
  getProgressToNextLevel,
  LEVELS,
} from "../profile";

// profile.ts creates a Supabase client and uses AsyncStorage on import.
// The pure scoring helpers under test never touch either of them.
jest.mock("../supabase", () => ({ supabase: {} }));
jest.mock("../storage", () => ({ Storage: {}, STORAGE_KEYS: {} }));

describe("levels", () => {
  it("maps level boundaries to the right level", () => {
    for (const level of LEVELS) {
      expect(getLevelForPoints(level.minPoints).level).toBe(level.level);
    }
    expect(getLevelForPoints(99).level).toBe(1);
    expect(getLevelForPoints(100).level).toBe(2);
  });

  it("falls back to the first level for negative points", () => {
    expect(getLevelForPoints(-5)).toBe(LEVELS[0]);
  });

  it("reports progress toward the next level", () => {
    expect(getProgressToNextLevel(0)).toBe(0);
    expect(getProgressToNextLevel(50)).toBeCloseTo(0.5);
  });

  it("is fully progressed on the top level", () => {
    expect(getProgressToNextLevel(1_000_000)).toBe(1);
  });
});

describe("calcPointsForScan", () => {
  const stats = () => emptyProfile().categoryStats;

  it("awards no points for unknown items", () => {
    expect(calcPointsForScan("unknown", "thing", stats(), 0)).toEqual({
      points: 0,
      awarded: false,
      reason: "unknown",
    });
  });

  it("adds a bonus for a category scanned for the first time", () => {
    expect(calcPointsForScan("glass", "jar", stats(), 0).points).toBe(35);
  });

  it("awards base points for an already seen category", () => {
    const seen = { ...stats(), glass: 2 };
    expect(calcPointsForScan("glass", "jar", seen, 1).points).toBe(10);
  });

  it("adds a streak bonus every third day", () => {
    const seen = { ...stats(), glass: 2 };
    expect(calcPointsForScan("glass", "jar", seen, 3).points).toBe(25);
    expect(calcPointsForScan("glass", "jar", seen, 6).points).toBe(25);
    expect(calcPointsForScan("glass", "jar", seen, 4).points).toBe(10);
  });

  it("rejects the same item scanned twice in a row, ignoring case and spaces", () => {
    expect(calcPointsForScan("plastic", "  Bottle ", stats(), 0, "bottle")).toEqual({
      points: 0,
      awarded: false,
      reason: "duplicate",
    });
  });

  it("does not treat an empty label as a duplicate", () => {
    expect(calcPointsForScan("plastic", "", stats(), 0, "").awarded).toBe(true);
  });
});
