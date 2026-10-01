"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { useActionState, useState, type ReactNode } from "react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormStateMessage } from "@/components/form-state-message";
import { InterviewForm } from "@/modules/applications/components/interview-form";
import {
  initialFormState,
  type FormState,
  type FormAction,
} from "@/lib/form-state";


/** Fenêtre du formulaire d'Entretien : se ferme après un enregistrement réussi, garde la saisie sinon. */
function InterviewFormDialog({
  trigger,
  title,
  label,
  action,
  initialValues,
}: {
  trigger: ReactNode;
  title: string;
  label: string;
  action: FormAction;
  initialValues?: Partial<Record<string, string>>;
}) {
  const [open, setOpen] = useState(false);

  const saveAndClose: FormAction = async (state, formData) => {
    const next = await action(state, formData);
    if (next.status === "success") setOpen(false);
    return next;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-extrabold">{title}</DialogTitle>
          <DialogDescription>Date et heure à l&apos;heure de Paris.</DialogDescription>
        </DialogHeader>
        <InterviewForm
          action={saveAndClose}
          label={label}
          initialValues={initialValues}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

/** « Ajouter un entretien » (FR-003-01) ; la page ne le fournit pas pour une Candidature Refusée. */
export function AddInterviewDialog({ action }: { action: FormAction }) {
  return (
    <InterviewFormDialog
      action={action}
      title="Ajouter un entretien"
      label="Nouvel entretien"
      trigger={
        <Button size="sm">
          <Plus aria-hidden />
          Ajouter un entretien
        </Button>
      }
    />
  );
}

/** Modification d'un Entretien (FR-003-02), pré-remplie. */
export function EditInterviewDialog({
  action,
  initialValues,
  label,
}: {
  action: FormAction;
  initialValues: Partial<Record<string, string>>;
  /** Décrit l'Entretien (type et date) : nom distinct du bouton quand la fiche en liste plusieurs. */
  label: string;
}) {
  return (
    <InterviewFormDialog
      action={action}
      title="Modifier l'entretien"
      label="Modifier l'entretien"
      initialValues={initialValues}
      trigger={
        <Button variant="ghost" size="icon-sm" aria-label={`Modifier : ${label}`}>
          <Pencil aria-hidden />
        </Button>
      }
    />
  );
}

/** Suppression d'un Entretien après confirmation (FR-003-03) ; `label` le décrit (type et date). */
export function DeleteInterviewButton({ action, label }: { action: FormAction; label: string }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    async (previous, formData) => {
      const next = await action(previous, formData);
      if (next.status === "success") setOpen(false);
      return next;
    },
    initialFormState,
  );

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label={`Supprimer : ${label}`} className="text-destructive">
          <Trash2 aria-hidden />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>Supprimer cet entretien ?</AlertDialogTitle>
        <AlertDialogDescription>
          {label}. Sa préparation et son compte rendu seront supprimés. Le statut de la candidature ne
          change pas.
        </AlertDialogDescription>
        <FormStateMessage state={state} />
        <form action={formAction}>
          <AlertDialogFooter>
            <AlertDialogCancel type="button">Annuler</AlertDialogCancel>
            {/* Pas AlertDialogAction : il fermerait la fenêtre avant la réponse du serveur. */}
            <Button type="submit" variant="destructive" disabled={pending}>
              Supprimer
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
