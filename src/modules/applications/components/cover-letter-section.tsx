"use client";

import { Copy, Sparkles } from "lucide-react";
import { useActionState, useId, useRef, useState } from "react";

import { FormStateMessage } from "@/components/form-state-message";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { initialFormState, type FormAction } from "@/lib/form-state";
import { Section } from "@/modules/applications/components/section";

/**
 * Lettre de motivation de la fiche (SPEC-008) : consignes et rappel de ce qui part chez Google,
 * puis le brouillon modifiable, enregistrable et copiable.
 */
export function CoverLetterSection({
  generateAction,
  saveAction,
  draft,
  hasPosting,
}: {
  generateAction: FormAction;
  saveAction: FormAction;
  /** Brouillon enregistré avec la Candidature. */
  draft: string | null;
  /** La Candidature a une description d'Annonce (BR-008-01). */
  hasPosting: boolean;
}) {
  // Le dernier brouillon connu : celui de la base, puis le dernier rédigé ou enregistré avec succès.
  const [latest, setLatest] = useState(draft);
  const keepDraft =
    (action: FormAction): FormAction =>
    async (state, formData) => {
      const next = await action(state, formData);
      if (next.status === "success" && next.values?.draft !== undefined) setLatest(next.values.draft);
      return next;
    };
  const [generated, generate, generating] = useActionState(keepDraft(generateAction), initialFormState);
  const [saved, save, saving] = useActionState(keepDraft(saveAction), initialFormState);
  const instructionsId = useId();
  const draftId = useId();
  const draftRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(draftRef.current?.value ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Section title="Lettre de motivation">
      <form action={generate} aria-label="Rédiger la lettre" className="flex flex-col gap-3">
        <FormStateMessage state={generated} />
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={instructionsId} className="text-xs font-medium text-foreground/80">
            Consignes (facultatif)
          </Label>
          <Textarea
            id={instructionsId}
            name="instructions"
            rows={2}
            maxLength={500}
            placeholder="Ex. : insiste sur mon stage DevOps ; ton plus formel ; disponible dès janvier."
            defaultValue={generated.values?.instructions}
          />
        </div>
        {hasPosting ? (
          <p className="text-xs text-muted-foreground">
            L&apos;annonce et ton profil (sans ton e-mail ni ton téléphone) seront envoyés à Google Gemini, offre
            gratuite : Google peut s&apos;en servir pour améliorer ses modèles. Relis toujours la lettre avant de
            l&apos;envoyer.
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Colle la description de l&apos;annonce dans la candidature (bouton « Modifier ») pour pouvoir rédiger la
            lettre.
          </p>
        )}
        <div>
          <Button type="submit" disabled={!hasPosting || generating}>
            <Sparkles aria-hidden />
            {generating ? "Rédaction en cours…" : latest ? "Régénérer" : "Rédiger la lettre avec l'IA"}
          </Button>
        </div>
      </form>

      {latest !== null && (
        <form action={save} aria-label="Brouillon de lettre" className="flex flex-col gap-3 border-t pt-4">
          <FormStateMessage state={saved} />
          <Label htmlFor={draftId} className="text-xs font-medium text-foreground/80">
            Brouillon
          </Label>
          {/* `key` : un nouveau brouillon rédigé remplace le contenu de la zone de texte. */}
          <Textarea
            key={latest}
            ref={draftRef}
            id={draftId}
            name="draft"
            rows={16}
            maxLength={20_000}
            defaultValue={latest}
            className="font-[inherit] leading-relaxed"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={saving}>
              Enregistrer
            </Button>
            <Button type="button" variant="outline" onClick={copy}>
              <Copy aria-hidden />
              {copied ? "Copié !" : "Copier"}
            </Button>
          </div>
        </form>
      )}
    </Section>
  );
}
