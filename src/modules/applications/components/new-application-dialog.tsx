"use client";

import { Plus } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { ApplicationFormDialog } from "@/modules/applications/components/application-form-dialog";

export function NewApplicationDialog({
  action,
  companySuggestions,
}: Pick<ComponentProps<typeof ApplicationFormDialog>, "action" | "companySuggestions">) {
  return (
    <ApplicationFormDialog
      action={action}
      companySuggestions={companySuggestions}
      title="Nouvelle candidature"
      description="Enregistre une candidature envoyée à une entreprise."
      trigger={
        <Button className="font-bold">
          Nouvelle candidature
          <Plus aria-hidden />
        </Button>
      }
    />
  );
}
