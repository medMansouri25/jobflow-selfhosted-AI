import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-start justify-center gap-4 px-4 py-24 sm:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Page introuvable</h1>
      <p className="text-muted-foreground">
        Cette page n&apos;existe pas ou a été supprimée.
      </p>
      <Button asChild>
        <Link href="/">Revenir à l&apos;accueil</Link>
      </Button>
    </main>
  );
}
