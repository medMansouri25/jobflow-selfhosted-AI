import { describe, expect, it } from "vitest";

import { meetingLink } from "@/modules/applications/meeting-link";

describe("lien de visio d'un Entretien", () => {
  it("FR-004-07 reconnaît Teams, Google Meet et Zoom", () => {
    expect(meetingLink("https://teams.microsoft.com/l/meetup-join/19%3ameeting")).toEqual({
      url: "https://teams.microsoft.com/l/meetup-join/19%3ameeting",
      platform: "Teams",
    });
    expect(meetingLink("https://meet.google.com/abc-defg-hij")?.platform).toBe("Google Meet");
    expect(meetingLink("https://us02web.zoom.us/j/123456789")?.platform).toBe("Zoom");
    expect(meetingLink("https://teams.live.com/meet/9876")?.platform).toBe("Teams");
  });

  it("propose « la visio » pour un autre lien http(s)", () => {
    expect(meetingLink("https://whereby.com/acme")).toEqual({ url: "https://whereby.com/acme", platform: "la visio" });
  });

  it("n'en fait pas un lien pour une adresse postale ou un autre schéma", () => {
    expect(meetingLink("12 rue de la Paix, Paris")).toBeNull();
    expect(meetingLink("javascript:alert(1)")).toBeNull();
    expect(meetingLink(null)).toBeNull();
  });

  it("ne se laisse pas tromper par un nom de plateforme hors du domaine", () => {
    expect(meetingLink("https://evil.example/meet.google.com")?.platform).toBe("la visio");
  });
});
