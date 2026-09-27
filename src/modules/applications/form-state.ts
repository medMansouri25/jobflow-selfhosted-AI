/** État renvoyé par une Server Action de formulaire (compatible `useActionState`). */
export type ApplicationFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  /** Valeurs saisies, renvoyées pour ne jamais perdre la saisie après une erreur. */
  values?: Partial<Record<string, string>>;
};

export const initialApplicationFormState: ApplicationFormState = {
  status: "idle",
};
