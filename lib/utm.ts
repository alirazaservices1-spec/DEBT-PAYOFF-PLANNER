const UTM_SOURCE = "DebtPath";
const UTM_MEDIUM = "app";

/**
 * Appends UTM parameters to a URL for linkouts (at least app name).
 * Uses utm_source=DebtPath and utm_medium=app.
 */
export function withAppUtmParams(url: string): string {
  try {
    const u = new URL(url);
    u.searchParams.set("utm_source", UTM_SOURCE);
    u.searchParams.set("utm_medium", UTM_MEDIUM);
    return u.toString();
  } catch {
    return url;
  }
}
