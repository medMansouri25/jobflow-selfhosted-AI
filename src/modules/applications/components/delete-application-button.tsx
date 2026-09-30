"use client";

import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { FormStateMessage } from "@/modules/applications/components/form-state-message";
import {
  initialApplicationFormState,
  type ApplicationFormState,
} from "@/modules/applications/form-state";

type DeleteAction = (state: ApplicationFormState, formData: FormData) => Promise<ApplicationFormState>;

/** Bouton « Supprimer » de la fiche : confirmation rappelant le poste et l'Entreprise (FR-001-07). */
export function DeleteApplicationButton({
  action,
  jobTitle,
  companyName,
}: {
  action: DeleteAction;
  jobTitle: string;
  companyName: string;
}) {
  // Succès : l'action redirige vers la liste. Avertissement : la Candidature est supprimée mais un
  // fichier reste chez le stockage ; la fenêtre reste ouverte pour le dire.
  const [state, formAction, pending] = useActionState(action, initialApplicationFormState);
  const deleted = state.status === "warning";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10">
          <Trash2 aria-hidden />
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Supprimer cette candidature ?</AlertDialogTitle>
        <AlertDialogDescription>
          « {jobTitle} » chez {companyName}. Son historique des statuts et ses pièces jointes seront
          supprimés. Cette action est irréversible.
        </AlertDialogDescription>
        <FormStateMessage state={state} />
        {deleted ? (
          <AlertDialogFooter>
            <Button asChild>
              <Link href="/applications">Retour à la liste</Link>
            </Button>
          </AlertDialogFooter>
        ) : (
          <form action={formAction}>
            <AlertDialogFooter>
              <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
              {/* Pas AlertDialogAction : il fermerait la fenêtre avant la réponse du serveur. */}
              <Button type="submit" variant="destructive" disabled={pending}>
                Supprimer
              </Button>
            </AlertDialogFooter>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
