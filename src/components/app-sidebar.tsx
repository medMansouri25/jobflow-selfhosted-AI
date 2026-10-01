"use client";

import {
  Briefcase,
  Building2,
  CalendarDays,
  LayoutDashboard,
  MessagesSquare,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type NavLink = {
  label: string;
  href: string;
  icon: LucideIcon;
  isActive: (pathname: string) => boolean;
};

const MAIN_LINKS: NavLink[] = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === "/",
  },
  {
    label: "Candidatures",
    href: "/applications",
    icon: Briefcase,
    isActive: (pathname) => pathname.startsWith("/applications"),
  },
  {
    label: "Entreprises",
    href: "/companies",
    icon: Building2,
    isActive: (pathname) => pathname.startsWith("/companies"),
  },
  {
    label: "Entretiens",
    href: "/interviews",
    icon: MessagesSquare,
    isActive: (pathname) => pathname.startsWith("/interviews"),
  },
  {
    label: "Agenda",
    href: "/agenda",
    icon: CalendarDays,
    isActive: (pathname) => pathname.startsWith("/agenda"),
  },
  {
    label: "Profil",
    href: "/profile",
    icon: UserRound,
    isActive: (pathname) => pathname.startsWith("/profile"),
  },
];

/** Menu latéral des grands écrans ; sur téléphone, le même contenu s'ouvre depuis `MobileNav`. */
export function AppSidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-card lg:flex">
      <SidebarContent />
    </aside>
  );
}

/** Logo, navigation et pied du menu. `onNavigate` : appelé au choix d'une page (ferme le menu sur téléphone). */
export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <Link
        href="/"
        onClick={onNavigate}
        aria-label="JobFlow AI — accueil"
        className="flex items-center gap-3 px-5 py-5"
      >
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-lg bg-linear-to-br from-primary to-success text-primary-foreground"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 12.5l4 4 8-9" />
          </svg>
        </span>
        <span className="flex flex-col leading-tight">
          <span className="font-heading text-lg font-extrabold">JobFlow</span>
          <span className="text-xs text-muted-foreground">
            Suivi de recherche d&apos;emploi
          </span>
        </span>
      </Link>

      <nav aria-label="Navigation principale" className="flex flex-1 flex-col gap-6 px-3">
        <ul className="flex flex-col gap-1">
          {MAIN_LINKS.map(({ label, href, icon: Icon, isActive }) => {
            const active = isActive(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-accent font-semibold text-accent-foreground"
                      : "text-foreground/80 hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon aria-hidden className="size-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="flex items-center gap-3 border-t px-5 py-4">
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-accent-foreground"
        >
          MM
        </span>
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-semibold">Mon espace</span>
          <span className="text-xs text-muted-foreground">Privé · Tailscale</span>
        </span>
      </div>
    </>
  );
}
