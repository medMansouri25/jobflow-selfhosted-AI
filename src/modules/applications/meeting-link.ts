// Lien de visio d'un Entretien (SPEC-004, FR-004-07) : le champ « Lieu ou lien », s'il est un lien http(s).

const PLATFORMS: [domain: RegExp, name: string][] = [
  [/(^|\.)teams\.(microsoft|live)\.com$/, "Teams"],
  [/^meet\.google\.com$/, "Google Meet"],
  [/(^|\.)zoom\.us$/, "Zoom"],
];

/** Le lien et sa plateforme (« Teams », « Google Meet », « Zoom », sinon « la visio ») ; `null` sans lien http(s). */
export function meetingLink(location: string | null): { url: string; platform: string } | null {
  if (!location || !/^https?:\/\//i.test(location)) return null;
  let host: string;
  try {
    host = new URL(location).hostname.toLowerCase();
  } catch {
    return null;
  }
  const platform = PLATFORMS.find(([domain]) => domain.test(host))?.[1] ?? "la visio";
  return { url: location, platform };
}
