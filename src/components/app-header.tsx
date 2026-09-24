import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-8 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span
            aria-hidden
            className="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
          >
            J
          </span>
          JobFlow AI
        </Link>
        <nav aria-label="Navigation principale" className="flex-1">
          <ul className="flex gap-6 text-sm">
            <li>
              <Link
                href="/applications"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Candidatures
              </Link>
            </li>
          </ul>
        </nav>
        <Button asChild size="sm">
          <Link href="/applications/new">Nouvelle candidature</Link>
        </Button>
      </div>
    </header>
  );
}
