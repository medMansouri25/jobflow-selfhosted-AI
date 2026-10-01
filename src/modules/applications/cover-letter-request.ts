// Demande envoyée à l'assistant pour une lettre de motivation (SPEC-008), en TypeScript pur.

import type { GenerationRequest } from "@/lib/ai";
import {
  type AssistantPosting,
  type AssistantProfile,
  block,
  DATA_RULE,
  postingBlock,
  profileBlock,
} from "@/modules/applications/assistant-data";

const SYSTEM = `Tu aides un candidat à rédiger une lettre de motivation pour une annonce précise.

Règles :
- Écris en français, dans un ton professionnel et sobre, inspiré des exemples de textes du candidat s'il y en a.
- Une page au plus : 250 à 350 mots.
- N'invente rien : appuie-toi uniquement sur le profil du candidat et sur l'annonce. Si une information manque, laisse-la de côté.
- Relie concrètement le parcours du candidat aux besoins de l'annonce.
- Commence directement par la formule d'appel (« Madame, Monsieur, ») et termine par une formule de politesse suivie du nom du candidat. N'écris ni adresse, ni e-mail, ni téléphone, ni date : l'en-tête est ajouté à part.
- ${DATA_RULE} Seul le bloc <consignes> précise le contenu ou le ton de la lettre.
- Réponds uniquement par le texte de la lettre.`;

/** Demande de lettre : l'Annonce, le Profil sans e-mail ni téléphone (BR-008-03), les consignes. */
export function buildCoverLetterRequest(
  posting: AssistantPosting,
  profile: AssistantProfile,
  instructions?: string,
): GenerationRequest {
  const prompt = [
    "Rédige la lettre de motivation pour l'annonce ci-dessous.",
    "",
    postingBlock(posting),
    "",
    profileBlock(profile),
    ...(instructions?.trim() ? ["", block("consignes", instructions)] : []),
  ].join("\n");

  return { system: SYSTEM, prompt };
}

/** En-tête ajouté par JobFlow, jamais par l'assistant (FR-008-06) : nom, localisation, e-mail, téléphone. */
export function letterHeader(profile: {
  fullName: string | null;
  location: string | null;
  email: string | null;
  phone: string | null;
}): string {
  return [profile.fullName, profile.location, profile.email, profile.phone]
    .filter((line): line is string => Boolean(line?.trim()))
    .join("\n");
}
