import { getPlanetHealth, getPlanetStage, PLANET_STAGES } from "../planet";

describe("getPlanetStage", () => {
  it("starts a new profile on the first stage", () => {
    const progress = getPlanetStage(0);

    expect(progress.stage.level).toBe(1);
    expect(progress.nextStage?.level).toBe(2);
    expect(progress.levelProgress).toBe(0);
    expect(progress.itemsToNext).toBe(PLANET_STAGES[1].minRecycled);
  });

  it("unlocks a stage exactly at its threshold", () => {
    for (const stage of PLANET_STAGES) {
      expect(getPlanetStage(stage.minRecycled).stage.level).toBe(stage.level);
    }
  });

  it("stays on the previous stage one item below a threshold", () => {
    expect(getPlanetStage(PLANET_STAGES[2].minRecycled - 1).stage.level).toBe(2);
  });

  it("reports progress within the current stage", () => {
    // Stage 2 spans 5..15 recycled items.
    const progress = getPlanetStage(10);

    expect(progress.stage.level).toBe(2);
    expect(progress.levelProgress).toBeCloseTo(0.5);
    expect(progress.itemsToNext).toBe(5);
  });

  it("caps progress on the final stage", () => {
    const last = PLANET_STAGES[PLANET_STAGES.length - 1];
    const progress = getPlanetStage(last.minRecycled + 1000);

    expect(progress.stage).toBe(last);
    expect(progress.nextStage).toBeNull();
    expect(progress.levelProgress).toBe(1);
    expect(progress.itemsToNext).toBe(0);
  });

  it("keeps stage thresholds strictly increasing", () => {
    for (let i = 1; i < PLANET_STAGES.length; i++) {
      expect(PLANET_STAGES[i].minRecycled).toBeGreaterThan(PLANET_STAGES[i - 1].minRecycled);
    }
  });
});

describe("getPlanetHealth", () => {
  it("is 0 before the first scan", () => {
    expect(getPlanetHealth(0, 0, 0)).toBe(0);
  });

  it("is 0 when nothing was recycled", () => {
    expect(getPlanetHealth(0, 10, 10)).toBe(0);
  });

  it("grows with the number of recycled items", () => {
    expect(getPlanetHealth(20, 0, 20)).toBeGreaterThan(getPlanetHealth(5, 0, 5));
  });

  it("rewards a better recycled-to-wasted ratio", () => {
    expect(getPlanetHealth(10, 0, 10)).toBeGreaterThan(getPlanetHealth(10, 10, 20));
  });

  it("always stays within 0..1", () => {
    for (const [recycled, wasted] of [[0, 0], [1, 0], [1000, 0], [1000, 1000], [3, 97]]) {
      const health = getPlanetHealth(recycled, wasted, recycled + wasted || 1);
      expect(health).toBeGreaterThanOrEqual(0);
      expect(health).toBeLessThanOrEqual(1);
    }
  });
});
