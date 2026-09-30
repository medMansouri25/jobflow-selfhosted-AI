import { cn } from "@/lib/utils";
import type { ApplicationFormState } from "@/modules/applications/form-state";

/** Message renvoyé par une action : erreur (alerte), avertissement ou succès (statut). */
export function FormStateMessage({ state }: { state: ApplicationFormState }) {
  if (state.status === "idle" || !state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={cn(
        "rounded-md px-4 py-3 text-sm",
        state.status === "error" && "bg-status-rejected-bg text-status-rejected-fg",
        state.status === "warning" && "bg-status-interview-bg text-status-interview-fg",
        state.status === "success" && "bg-status-accepted-bg text-status-accepted-fg",
      )}
    >
      {state.message}
    </p>
  );
}
