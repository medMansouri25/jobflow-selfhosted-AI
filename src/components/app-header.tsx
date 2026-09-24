import Link from "next/link";

export function AppHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-8 px-6">
        <Link href="/" className="font-semibold tracking-tight">
          JobFlow AI
        </Link>
        <nav aria-label="Navigation principale">
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
      </div>
    </header>
  );
}
