import type { Metadata } from "next";
import Link from "next/link";

import { createApplicationAction } from "@/modules/applications/actions";
import { ApplicationForm } from "@/modules/applications/components/application-form";

export const metadata: Metadata = {
  title: "Nouvelle candidature · JobFlow AI",
};

export default function NewApplicationPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <Link
          href="/applications"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Mes candidatures
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight">
          Nouvelle candidature
        </h1>
        <p className="text-muted-foreground">
          Enregistre une Annonce repérée ou une candidature déjà envoyée.
        </p>
      </div>
      <ApplicationForm action={createApplicationAction} />
    </main>
  );
}
