import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { createApplicationAction } from "@/modules/applications/actions";

import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JobFlow AI",
  description: "Suivi personnel de recherche d'emploi",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${archivo.variable} h-full antialiased`}
    >
      <body className="flex min-h-full">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppTopbar createApplicationAction={createApplicationAction} />
          {children}
        </div>
      </body>
    </html>
  );
}
