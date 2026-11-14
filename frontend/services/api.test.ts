import { describe, expect, it } from "vitest";

import { getApiBaseUrl } from "./api";

describe("deployed API URL configuration", () => {
  it("does not fall back to a localhost service when no URL is configured", () => {
    expect(getApiBaseUrl(undefined)).toBeNull();
    expect(getApiBaseUrl("  ")).toBeNull();
  });

  it("trims whitespace and trailing slashes from the configured API URL", () => {
    expect(getApiBaseUrl(" https://api.example.com/ ")).toBe(
      "https://api.example.com",
    );
  });
});
