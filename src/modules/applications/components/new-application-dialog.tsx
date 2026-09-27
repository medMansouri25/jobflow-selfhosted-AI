"use client";

import { Plus } from "lucide-react";
import type { ComponentProps } from "react";

import { Button } from "@/components/ui/button";
import { ApplicationFormDialog } from "@/modules/applications/components/application-form-dialog";

export function NewApplicationDialog({
  action,
}: Pick<ComponentProps<typeof ApplicationFormDialog>, "action">) {
  return (
    <ApplicationFormDialog
      action={action}
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
