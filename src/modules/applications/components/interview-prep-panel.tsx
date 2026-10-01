"use client";

import { Sparkles } from "lucide-react";
import { useActionState } from "react";

import { FormStateMessage } from "@/components/form-state-message";
import { Button } from "@/components/ui/button";
import { initialFormState, type FormAction } from "@/lib/form-state";
import type { InterviewPrep } from "@/modules/applications/interview-prep-request";

/** Fiche de préparation d'un Entretien (SPEC-009, A) : bouton, puis questions, pistes et points clés. */
export function InterviewPrepPanel({
  action,
  prep,
  label,
}: {
  action: FormAction;
  prep: InterviewPrep | null;
  /** Décrit l'Entretien (type et date) : nom distinct du formulaire quand la fiche en liste plusieurs. */
  label: string;
}) {
  const [state, prepare, pending] = useActionState(action, initialFormState);

  return (
    <div className="flex flex-col gap-2 rounded-md border border-dashed p-3">
      <form action={prepare} aria-label={`Préparer : ${label}`} className="flex flex-col gap-2">
        <FormStateMessage state={state} />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" size="sm" variant={prep ? "outline" : "default"} disabled={pending}>
            <Sparkles aria-hidden />
            {pending ? "Préparation en cours…" : prep ? "Refaire la fiche" : "Préparer avec l'IA"}
          </Button>
          <span className="text-xs text-muted-foreground">
            L&apos;annonce et ton profil (sans e-mail ni téléphone) seront envoyés à Google Gemini, offre gratuite.
          </span>
        </div>
      </form>

      {prep && (
        <details open className="text-sm">
          <summary className="cursor-pointer font-semibold">Fiche de préparation (IA)</summary>
          <div className="mt-2 flex flex-col gap-3">
            <ol className="flex list-decimal flex-col gap-2 pl-5">
              {prep.questions.map((item, i) => (
                <li key={i}>
                  <span className="font-medium">{item.question}</span>
                  {item.hints.length > 0 && (
                    <ul className="mt-1 flex list-disc flex-col gap-0.5 pl-5 text-muted-foreground">
                      {item.hints.map((hint, j) => (
                        <li key={j}>{hint}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
            <PrepList title="À mettre en avant" items={prep.highlights} />
            <PrepList title="Questions à poser" items={prep.questionsToAsk} />
            <p className="text-xs text-muted-foreground">
              Pistes tirées de ton profil et de l&apos;annonce : à reformuler avec tes mots.
            </p>
          </div>
        </details>
      )}
    </div>
  );
}

function PrepList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold">{title}</span>
      <ul className="flex list-disc flex-col gap-0.5 pl-5">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
