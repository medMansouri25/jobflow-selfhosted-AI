"use client";

import { useState, type ComponentProps, type ReactNode } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApplicationForm } from "@/modules/applications/components/application-form";

type FormProps = ComponentProps<typeof ApplicationForm>;

/**
 * Formulaire de Candidature dans une fenêtre modale : création comme modification.
 * Après un enregistrement réussi, la fenêtre se ferme ; en cas d'erreur, elle reste ouverte avec la saisie.
 */
export function ApplicationFormDialog({
  trigger,
  title,
  description,
  action,
  ...formProps
}: Omit<FormProps, "onCancel"> & { trigger: ReactNode; title: string; description: string }) {
  const [open, setOpen] = useState(false);

  const saveAndClose: FormProps["action"] = async (state, formData) => {
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
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ApplicationForm {...formProps} action={saveAndClose} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
