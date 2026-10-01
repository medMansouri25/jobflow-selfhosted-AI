import { db } from "@/lib/db";
import { DomainError } from "@/lib/errors";
import { findOwnedApplication } from "@/modules/applications/service";
import { getProfile } from "@/modules/profile/service";

const PROFILE_TEXTS = ["about", "experience", "projects", "skills", "education", "writingSamples"] as const;

/**
 * Candidature et Profil dont l'assistant a besoin (lettre, analyse), ou une `DomainError` claire,
 * avant tout envoi : Annonce sans description (BR-008-01), Profil vide (BR-008-02).
 */
export async function loadAssistantInputs(userId: string, applicationId: string) {
  const application = await findOwnedApplication(db, userId, applicationId, { company: true });
  const jobDescription = application.jobDescription?.trim();
  if (!jobDescription) {
    throw new DomainError(
      "ASSISTANT_NO_POSTING",
      "Colle la description de l'annonce dans la candidature (bouton « Modifier ») : l'assistant en a besoin.",
    );
  }
  const profile = await getProfile(userId);
  if (!profile || PROFILE_TEXTS.every((field) => !profile[field]?.trim())) {
    throw new DomainError(
      "ASSISTANT_NO_PROFILE",
      "Remplis ton profil (parcours, compétences…) : l'assistant s'appuie dessus.",
    );
  }
  return {
    posting: { companyName: application.company.name, jobTitle: application.jobTitle, jobDescription },
    profile,
  };
}
