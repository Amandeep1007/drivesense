export function getApiBaseUrl(configuredUrl: string | undefined): string | null {
  const apiBaseUrl = configuredUrl?.trim().replace(/\/+$/, "");
  return apiBaseUrl || null;
}
