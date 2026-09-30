import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { getCurrentUserId } from "@/lib/current-user";
import { createApplicationAction } from "@/modules/applications/actions";
import { listCompanyNames } from "@/modules/companies/service";

import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobFlow AI",
  description: "Suivi personnel de recherche d'emploi",
};

// La barre du haut propose les Entreprises existantes (FR-001-04) : lues à chaque requête, jamais au build.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Simple confort : sans base ou sans utilisateur, pas de suggestions. Le layout ne doit jamais
  // échouer, sinon aucune page n'atteindrait sa propre gestion d'erreur (`error.tsx`).
  const companyNames = await getCurrentUserId()
    .then(listCompanyNames)
    .catch(() => []);
  return (
    <html
      lang="fr"
      className={`${archivo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar
            createApplicationAction={createApplicationAction}
            companyNames={companyNames}
          />
          {children}
        </div>
      </body>
    </html>
  );
}
