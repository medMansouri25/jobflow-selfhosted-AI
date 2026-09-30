"use client";

import { useActionState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FormStateMessage } from "@/modules/applications/components/form-state-message";
import { Section } from "@/modules/applications/components/section";
import type { ApplicationStatus } from "@/modules/applications/domain/application";
import { allowedTransitions, isDefinitive } from "@/modules/applications/domain/status";
import {
  initialApplicationFormState,
  type ApplicationFormState,
} from "@/modules/applications/form-state";
import { STATUS_LABELS, TRANSITION_LABELS } from "@/modules/applications/labels";

type StatusAction = (state: ApplicationFormState, formData: FormData) => Promise<ApplicationFormState>;

/** Bloc « Statut » de la fiche : un bouton par transition autorisée (FR-001-05). */
export function StatusPanel({ status, action }: { status: ApplicationStatus; action: StatusAction }) {
  const [state, formAction, pending] = useActionState(action, initialApplicationFormState);

  return (
    <Section title="Statut">
      <FormStateMessage state={state} />
      {isDefinitive(status) && (
        <p className="text-sm text-muted-foreground">
          Statut définitif : cette candidature ne change plus de statut.
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {allowedTransitions(status).map((to) =>
          isDefinitive(to) ? (
            // Vers un Statut définitif : confirmation avant l'envoi (SPEC-001 §8).
            <AlertDialog key={to}>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={pending}>
                  {TRANSITION_LABELS[to]}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>{TRANSITION_LABELS[to]} ?</AlertDialogTitle>
                <AlertDialogDescription>
                  Ce changement est définitif. Marquer la candidature comme {STATUS_LABELS[to]} ?
                </AlertDialogDescription>
                <form action={formAction}>
                  <input type="hidden" name="to" value={to} />
                  <AlertDialogFooter>
                    <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
                    <AlertDialogAction type="submit">Confirmer</AlertDialogAction>
                  </AlertDialogFooter>
                </form>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <form key={to} action={formAction}>
              <input type="hidden" name="to" value={to} />
              <Button type="submit" variant="outline" disabled={pending}>
                {TRANSITION_LABELS[to]}
              </Button>
            </form>
          ),
        )}
      </div>
    </Section>
  );
}
