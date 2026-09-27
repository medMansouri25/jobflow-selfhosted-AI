"use client";

import { Pencil } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { ApplicationFormDialog } from "@/modules/applications/components/application-form-dialog";

type DialogProps = ComponentProps<typeof ApplicationFormDialog>;

/** Bouton « Modifier » de la fiche : le formulaire pré-rempli, sans le statut (FR-001-02). */
export function EditApplicationDialog({
  action,
  companyName,
  initialValues,
  attachments,
}: Pick<DialogProps, "action" | "initialValues" | "attachments"> & { companyName: string }) {
  return (
    <ApplicationFormDialog
      action={action}
      label="Modifier la candidature"
      initialValues={initialValues}
      attachments={attachments}
      title={`Modifier — ${companyName}`}
      description="Tous les champs se modifient, sauf le statut."
      trigger={
        <Button variant="outline">
          <Pencil aria-hidden />
          Modifier
        </Button>
      }
    />
  );
}
