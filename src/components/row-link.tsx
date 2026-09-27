import Link from "next/link";
import type { ReactNode } from "react";

/**
 * Lien placé dans une cellule dont la zone cliquable couvre toute la ligne du tableau
 * (la ligne doit être `relative`) : clic, clavier et clic molette fonctionnent.
 */
export function RowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
    >
      {children}
    </Link>
  );
}
