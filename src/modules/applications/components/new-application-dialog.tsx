"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApplicationForm } from "@/modules/applications/components/application-form";
import type { ApplicationFormState } from "@/modules/applications/form-state";

type FormAction = (
  state: ApplicationFormState,
  formData: FormData,
) => Promise<ApplicationFormState>;

export function NewApplicationDialog({ action }: { action: FormAction }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-bold">
          Nouvelle candidature
          <Plus aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl font-extrabold">
            Nouvelle candidature
          </DialogTitle>
          <DialogDescription>
            Enregistre une Annonce repérée ou une candidature déjà envoyée.
          </DialogDescription>
        </DialogHeader>
        <ApplicationForm action={action} onCancel={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
