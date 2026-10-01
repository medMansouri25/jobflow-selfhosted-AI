import { getEnv } from "@/lib/env";
import { DomainError } from "@/lib/errors";

// Seul point de contact avec l'assistant IA (ADR 0008) : Gemini en production, un faux dans les tests.
// Changer de fournisseur ne touche que ce fichier.

export type GenerationRequest = {
  /** Rôle et règles de l'assistant. */
  system: string;
  /** La demande, avec ses données délimitées. */
  prompt: string;
};

export interface TextGenerator {
  generate(request: GenerationRequest): Promise<string>;
}

/** L'assistant n'a pas pu répondre : le message est montré tel quel à l'utilisateur. */
export class AiError extends DomainError {
  constructor(message: string) {
    super("AI_ERROR", message);
    this.name = "AiError";
  }
}

const TIMEOUT_MS = 60_000;

/** Modèle de secours quand le modèle principal est surchargé (503), fréquent sur l'offre gratuite. */
export const GEMINI_FALLBACK_MODEL = "gemini-flash-lite-latest";

export function createGeminiGenerator({
  apiKey,
  model,
  fallbackModel = GEMINI_FALLBACK_MODEL,
  fetch = globalThis.fetch,
}: {
  apiKey: string;
  model: string;
  fallbackModel?: string;
  fetch?: typeof globalThis.fetch;
}): TextGenerator {
  async function call(modelName: string, { system, prompt }: GenerationRequest): Promise<Response> {
    try {
      return await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(modelName)}:generateContent`,
        {
          method: "POST",
          // La clé voyage en en-tête : jamais dans une adresse qui pourrait finir dans un journal.
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: system }] },
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7 },
          }),
          signal: AbortSignal.timeout(TIMEOUT_MS),
        },
      );
    } catch {
      throw new AiError("L'assistant IA ne répond pas. Réessaie dans un instant.");
    }
  }

  return {
    async generate(request) {
      let response = await call(model, request);
      if (response.status === 503 && fallbackModel !== model) response = await call(fallbackModel, request);

      if (response.status === 429) {
        throw new AiError("La limite gratuite de l'assistant IA est atteinte. Réessaie dans une minute.");
      }
      if (response.status === 503) {
        throw new AiError("L'assistant IA est surchargé chez Google. Réessaie dans quelques minutes.");
      }
      if (!response.ok) {
        throw new AiError(`L'assistant IA a renvoyé une erreur (${response.status}). Réessaie plus tard.`);
      }

      let data: { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      try {
        data = await response.json();
      } catch {
        // Corps interrompu (délai dépassé) ou illisible : même message qu'une absence de réponse.
        throw new AiError("L'assistant IA ne répond pas. Réessaie dans un instant.");
      }
      const text = (data.candidates?.[0]?.content?.parts ?? [])
        .map((part) => part.text ?? "")
        .join("")
        .trim();
      if (!text) throw new AiError("L'assistant IA n'a produit aucun texte. Reformule tes consignes et réessaie.");
      return text;
    },
  };
}

/** Le générateur configuré, ou une erreur claire si aucune clé n'est définie (ADR 0008). */
export function getTextGenerator(): TextGenerator {
  const { GEMINI_API_KEY, GEMINI_MODEL } = getEnv();
  if (!GEMINI_API_KEY) {
    throw new AiError("L'assistant IA n'est pas configuré : ajoute GEMINI_API_KEY dans le fichier .env.");
  }
  return createGeminiGenerator({ apiKey: GEMINI_API_KEY, model: GEMINI_MODEL });
}
