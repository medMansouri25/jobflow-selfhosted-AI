"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-start justify-center gap-4 px-8 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">
        Une erreur est survenue
      </h1>
      <p className="text-muted-foreground">
        L&apos;opération n&apos;a pas pu aboutir. Tu peux réessayer ; si
        l&apos;erreur persiste, consulte les journaux du serveur.
      </p>
      <Button onClick={() => retry()}>Réessayer</Button>
    </main>
  );
}
