"use client";

import { Menu, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useState } from "react";

import { SidebarContent } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";

/** Bouton « Menu » des petits écrans : ouvre le menu latéral en tiroir, refermé au choix d'une page. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="icon" aria-label="Menu" className="lg:hidden">
          <Menu aria-hidden />
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 lg:hidden" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto border-r bg-card shadow-lg lg:hidden"
        >
          <DialogPrimitive.Title className="sr-only">Menu</DialogPrimitive.Title>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="icon" aria-label="Fermer le menu" className="absolute top-4 right-3">
              <X aria-hidden />
            </Button>
          </DialogPrimitive.Close>
          <SidebarContent onNavigate={() => setOpen(false)} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
