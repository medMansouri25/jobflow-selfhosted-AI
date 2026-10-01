import { db } from "@/lib/db";
import { PROFILE_FIELDS, type ProfileInput } from "@/modules/profile/schemas";

/** Le Profil de l'utilisateur (SPEC-006), ou `null` s'il n'a encore rien enregistré. */
export async function getProfile(userId: string) {
  return db.profile.findUnique({ where: { userId } });
}

/**
 * Enregistre tout le Profil (FR-006-04) : créé la première fois, remplacé ensuite (BR-006-01).
 * Chaque colonne est écrite : un champ vidé devient `null` (BR-006-02).
 */
export async function saveProfile(userId: string, input: ProfileInput) {
  const columns = Object.fromEntries(PROFILE_FIELDS.map((field) => [field, input[field] ?? null]));
  return db.profile.upsert({
    where: { userId },
    create: { userId, ...columns },
    update: columns,
  });
}
