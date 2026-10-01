import type { Metadata } from "next";

import { getCurrentUserId } from "@/lib/current-user";
import { saveProfileAction } from "@/modules/profile/actions";
import { ProfileForm } from "@/modules/profile/components/profile-form";
import { PROFILE_FIELDS } from "@/modules/profile/schemas";
import { getProfile } from "@/modules/profile/service";

export const metadata: Metadata = {
  title: "Profil · JobFlow AI",
};

export const dynamic = "force-dynamic";

/** Profil (SPEC-006) : ce que l'assistant saura de moi pour écrire mes lettres de motivation. */
export default async function ProfilePage() {
  const profile = await getProfile(await getCurrentUserId());
  const initialValues = Object.fromEntries(
    PROFILE_FIELDS.map((field) => [field, profile?.[field] ?? undefined]),
  );

  return (
    <main className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Profil</h1>
        <p className="max-w-2xl text-muted-foreground">
          Tout est facultatif. Colle le contenu de ton CV : ces informations restent sur ta Pi et
          serviront plus tard à écrire des lettres de motivation personnalisées.
        </p>
      </div>
      <div className="max-w-4xl">
        <ProfileForm action={saveProfileAction} initialValues={initialValues} />
      </div>
    </main>
  );
}
