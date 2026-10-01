/** État renvoyé par une Server Action de formulaire (compatible `useActionState`). */
export type ApplicationFormState = {
  /** `warning` : enregistré, mais le message demande une action (ex. un fichier à supprimer à la main). */
  status: "idle" | "error" | "success" | "warning";
  message?: string;
  fieldErrors?: Partial<Record<string, string[]>>;
  /** Valeurs saisies, renvoyées pour ne jamais perdre la saisie après une erreur. */
  values?: Partial<Record<string, string>>;
};

export const initialApplicationFormState: ApplicationFormState = {
  status: "idle",
};

/** Server Action de formulaire, telle que la reçoivent les composants (`useActionState`). */
export type FormAction = (state: ApplicationFormState, formData: FormData) => Promise<ApplicationFormState>;
