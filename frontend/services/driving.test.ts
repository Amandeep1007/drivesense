import { describe, expect, it } from "vitest";

import {
  getSpeedLevel,
  haversineDistanceMeters,
  metersPerSecondToKmh,
} from "./driving";

describe("GPS speed conversion", () => {
  it("converts real metres-per-second values and preserves a measured stop", () => {
    expect(metersPerSecondToKmh(10)).toBe(36);
    expect(metersPerSecondToKmh(0)).toBe(0);
    expect(metersPerSecondToKmh(null)).toBeNull();
  });

  it("rejects unavailable and invalid speed values", () => {
    expect(metersPerSecondToKmh(Number.NaN)).toBeNull();
    expect(metersPerSecondToKmh(-1)).toBeNull();
  });
});

describe("application warning levels", () => {
  it("uses the configured default caution and overspeed boundaries", () => {
    expect(getSpeedLevel(79.9)).toBe("normal");
    expect(getSpeedLevel(80)).toBe("caution");
    expect(getSpeedLevel(99.9)).toBe("caution");
    expect(getSpeedLevel(100)).toBe("overspeed");
  });

  it("honours a user threshold and never classifies missing speed as overspeed", () => {
    expect(getSpeedLevel(89, 90)).toBe("caution");
    expect(getSpeedLevel(90, 90)).toBe("overspeed");
    expect(getSpeedLevel(null, 90)).toBe("normal");
  });
});

describe("GPS distance", () => {
  it("returns zero for the same position and a finite distance between positions", () => {
    expect(haversineDistanceMeters(0, 0, 0, 0)).toBe(0);
    expect(haversineDistanceMeters(0, 0, 0, 1)).toBeGreaterThan(111_000);
    expect(haversineDistanceMeters(0, 0, 0, 1)).toBeLessThan(112_000);
  });
});
