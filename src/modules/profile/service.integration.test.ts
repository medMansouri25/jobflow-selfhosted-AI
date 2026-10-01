import { describe, expect, it } from "vitest";

import { db } from "@/lib/db";
import { profileSchema } from "@/modules/profile/schemas";
import { getProfile, saveProfile } from "@/modules/profile/service";
import { createTestUser } from "@/test/database";

describe("profil", () => {
  it("AC-006-01 n'a pas de profil tant que rien n'est enregistré", async () => {
    const user = await createTestUser();

    expect(await getProfile(user.id)).toBeNull();
  });

  it("AC-006-02 enregistre le profil puis le relit", async () => {
    const user = await createTestUser();

    await saveProfile(user.id, profileSchema.parse({ fullName: "Mohammed M.", experience: "Stage — Airbus" }));

    expect(await getProfile(user.id)).toMatchObject({ fullName: "Mohammed M.", experience: "Stage — Airbus", phone: null });
  });

  it("AC-006-03 remplace le profil : un champ vidé est effacé, un seul profil par utilisateur", async () => {
    const user = await createTestUser();
    await saveProfile(user.id, profileSchema.parse({ fullName: "Mohammed M.", phone: "06 00 00 00 00" }));

    await saveProfile(user.id, profileSchema.parse({ fullName: "Mohammed M.", phone: "" }));

    expect(await getProfile(user.id)).toMatchObject({ fullName: "Mohammed M.", phone: null });
    expect(await db.profile.count({ where: { userId: user.id } })).toBe(1);
  });

  it("AC-006-05 ne lit que le profil de l'utilisateur", async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    await saveProfile(other.id, profileSchema.parse({ fullName: "Quelqu'un d'autre" }));

    expect(await getProfile(user.id)).toBeNull();
  });
});
