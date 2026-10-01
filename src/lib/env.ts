import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z
    .string({ error: "DATABASE_URL est obligatoire" })
    .regex(/^postgres(ql)?:\/\//, "DATABASE_URL doit être une URL postgresql://"),
  // Jeton UploadThing (pièces jointes, ADR 0006) : absent en test et en CI, où le stockage est remplacé par un faux.
  UPLOADTHING_TOKEN: z.string().min(1).optional(),
  // Assistant IA (ADR 0008) : sans clé, l'assistant est indisponible ; le modèle se change sans toucher au code.
  GEMINI_API_KEY: z.string().min(1).optional(),
  GEMINI_MODEL: z.string().min(1).default("gemini-flash-latest"),
});

export type Env = z.infer<typeof envSchema>;

/** Valide la configuration ; lève une erreur lisible qui nomme chaque variable invalide. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  const result = envSchema.safeParse(source);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join(".")} : ${issue.message}`)
      .join("\n");
    throw new Error(`Configuration invalide :\n${details}`);
  }
  return result.data;
}

let cached: Env | undefined;

/** Configuration du serveur, validée au premier accès. */
export function getEnv(): Env {
  cached ??= parseEnv(process.env);
  return cached;
}
