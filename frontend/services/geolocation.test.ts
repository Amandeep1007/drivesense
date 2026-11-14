import { describe, expect, it } from "vitest";

import { getGeolocationIssue } from "./geolocation";

describe("browser location errors", () => {
  it("distinguishes permission denial from a GPS timeout", () => {
    expect(getGeolocationIssue(1).status).toBe("denied");
    expect(getGeolocationIssue(3).status).toBe("timeout");
    expect(getGeolocationIssue(2).status).toBe("unavailable");
  });
});
