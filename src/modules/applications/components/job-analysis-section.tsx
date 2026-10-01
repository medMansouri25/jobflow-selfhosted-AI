"use client";

import { CircleAlert, CircleCheck, ScanSearch } from "lucide-react";
import { useActionState } from "react";

import { FormStateMessage } from "@/components/form-state-message";
import { Button } from "@/components/ui/button";
import { initialFormState, type FormAction } from "@/lib/form-state";
import { cn } from "@/lib/utils";
import { Section } from "@/modules/applications/components/section";
import type { JobAnalysis } from "@/modules/applications/job-analysis-request";

type Skill = JobAnalysis["skills"]["technical"][number];

/** Analyse de l'Annonce de la fiche (SPEC-007) : bouton, rappel, puis les cinq rubriques enregistrées. */
export function JobAnalysisSection({
  action,
  analysis,
  hasPosting,
}: {
  action: FormAction;
  /** Analyse enregistrée avec la Candidature ; la page la relit après chaque analyse. */
  analysis: JobAnalysis | null;
  /** La Candidature a une description d'Annonce (BR-007-01). */
  hasPosting: boolean;
}) {
  const [state, analyze, pending] = useActionState(action, initialFormState);

  return (
    <Section title="Analyse de l'annonce">
      <form action={analyze} aria-label="Analyser l'annonce" className="flex flex-col gap-3">
        <FormStateMessage state={state} />
        <p className="text-xs text-muted-foreground">
          {hasPosting
            ? "L'annonce et ton profil (sans ton e-mail ni ton téléphone) seront envoyés à Google Gemini, offre gratuite : Google peut s'en servir pour améliorer ses modèles."
            : "Colle la description de l'annonce dans la candidature (bouton « Modifier ») pour pouvoir l'analyser."}
        </p>
        <div>
          <Button type="submit" variant={analysis ? "outline" : "default"} disabled={!hasPosting || pending}>
            <ScanSearch aria-hidden />
            {pending ? "Analyse en cours…" : analysis ? "Relancer l'analyse" : "Analyser l'annonce"}
          </Button>
        </div>
      </form>

      {analysis && (
        <div className="flex flex-col gap-5 border-t pt-4 text-sm">
          <Block title="En bref">
            <p className="whitespace-pre-wrap">{analysis.summary}</p>
          </Block>

          <Block title="Compétences demandées pour le poste">
            <div className="grid gap-4 sm:grid-cols-2">
              <SkillList label="Compétences techniques" skills={analysis.skills.technical} />
              <SkillList label="Savoir-être" skills={analysis.skills.soft} />
            </div>
          </Block>

          <Block title="Tes atouts pour ce poste">
            <Bullets items={analysis.strengths} />
          </Block>
          <div className="grid gap-5 sm:grid-cols-2">
            <Block title="Questions à préparer">
              <Bullets items={analysis.questionsToPrepare} />
            </Block>
            <Block title="Questions à poser">
              <Bullets items={analysis.questionsToAsk} />
            </Block>
          </div>
          <p className="text-xs text-muted-foreground">
            Analyse indicative, faite uniquement à partir de l&apos;annonce et de ton profil : à vérifier.
          </p>
        </div>
      )}
    </Section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  return items.length === 0 ? (
    <p className="text-muted-foreground">—</p>
  ) : (
    <ul className="flex list-disc flex-col gap-1 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** Compétences : obligatoire / souhaitée, et ✅ dans le profil ou ⚠️ à renforcer (FR-007-03), en texte lisible. */
function SkillList({ label, skills }: { label: string; skills: Skill[] }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {skills.length === 0 ? (
        <p className="text-muted-foreground">—</p>
      ) : (
        <ul aria-label={label} className="flex flex-col gap-1.5">
          {skills.map((skill) => (
            <li key={skill.name} className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {skill.inProfile ? (
                <CircleCheck aria-hidden className="size-4 shrink-0 text-success" />
              ) : (
                <CircleAlert aria-hidden className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
              )}
              <span className="font-medium">{skill.name}</span>
              <span
                className={cn(
                  "rounded px-1.5 text-[11px] font-semibold",
                  skill.required ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {skill.required ? "Obligatoire" : "Souhaitée"}
              </span>
              <span className={cn("text-xs", skill.inProfile ? "text-success" : "text-amber-600 dark:text-amber-400")}>
                {skill.inProfile ? "Dans ton profil" : "À renforcer"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
