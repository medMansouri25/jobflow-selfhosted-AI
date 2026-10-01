"use client";

import { CircleAlert, CircleCheck, Play, RotateCcw, Send } from "lucide-react";
import { useId, useState, useTransition } from "react";

/** Place le focus sur l'élément dès qu'il apparaît : chaque étape de la séance remplace la précédente. */
const focusOnMount = (node: HTMLElement | null) => node?.focus();

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PracticeResult } from "@/modules/applications/practice-actions";
import { MAX_ANSWER, type Exchange, type Feedback } from "@/modules/applications/practice-request";

type Step =
  | { kind: "intro" }
  | { kind: "question"; index: number }
  | { kind: "feedback"; index: number; feedback: Feedback }
  | { kind: "debrief"; points: string[] };

/**
 * Séance d'entraînement (SPEC-009, B) : 5 questions une par une, un retour par réponse, puis un bilan.
 * Tout reste dans la page : rien n'est enregistré (BR-009-04).
 */
export function PracticeSession({
  start,
  feedback,
  debrief,
}: {
  start: () => Promise<PracticeResult<string[]>>;
  feedback: (question: string, answer: string) => Promise<PracticeResult<Feedback>>;
  debrief: (exchanges: Exchange[]) => Promise<PracticeResult<string[]>>;
}) {
  const [step, setStep] = useState<Step>({ kind: "intro" });
  const [questions, setQuestions] = useState<string[]>([]);
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const answerId = useId();

  function run<T>(call: () => Promise<PracticeResult<T>>, then: (data: T) => void) {
    setError(null);
    startTransition(async () => {
      let result: PracticeResult<T>;
      try {
        result = await call();
      } catch {
        // Réseau coupé, Pi redémarrée… : la séance (jamais enregistrée) reste à l'écran, on peut réessayer.
        setError("Connexion perdue avec JobFlow. Vérifie ta connexion et réessaie.");
        return;
      }
      if (result.ok) then(result.data);
      else setError(result.message);
    });
  }

  const begin = () =>
    run(start, (data) => {
      setQuestions(data);
      setExchanges([]);
      setAnswer("");
      setStep({ kind: "question", index: 0 });
    });

  const send = (index: number) =>
    run(
      () => feedback(questions[index], answer),
      (data) => {
        setExchanges((previous) => [...previous, { question: questions[index], answer }]);
        setStep({ kind: "feedback", index, feedback: data });
      },
    );

  const next = (index: number) => {
    if (index + 1 < questions.length) {
      setAnswer("");
      setStep({ kind: "question", index: index + 1 });
    } else {
      run(() => debrief(exchanges), (points) => setStep({ kind: "debrief", points }));
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <p role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      {step.kind === "intro" && (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:p-6">
          <p className="text-sm">
            5 questions, une par une. Réponds par écrit comme tu le ferais à l&apos;oral : après chaque réponse, un
            retour avec ce qui est bien, ce qu&apos;il faut améliorer et une meilleure formulation.
          </p>
          <p className="text-xs text-muted-foreground">
            L&apos;annonce, ton profil (sans e-mail ni téléphone) et tes réponses seront envoyés à Google Gemini, offre
            gratuite. La séance n&apos;est pas enregistrée.
          </p>
          <div>
            <Button onClick={begin} disabled={pending}>
              <Play aria-hidden />
              {pending ? "Préparation des questions…" : "Commencer la séance"}
            </Button>
          </div>
        </div>
      )}

      {(step.kind === "question" || step.kind === "feedback") && (
        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6">
          <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Question {step.index + 1} / {questions.length}
          </p>
          <p className="font-heading text-lg font-bold">{questions[step.index]}</p>

          {step.kind === "question" ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor={answerId} className="text-xs font-medium text-foreground/80">
                Ta réponse
              </Label>
              <Textarea
                ref={focusOnMount}
                id={answerId}
                rows={7}
                maxLength={MAX_ANSWER}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
              />
              <div>
                <Button onClick={() => send(step.index)} disabled={pending || !answer.trim()}>
                  <Send aria-hidden />
                  {pending ? "Analyse de ta réponse…" : "Envoyer ma réponse"}
                </Button>
              </div>
            </div>
          ) : (
            <FeedbackView
              feedback={step.feedback}
              last={step.index + 1 >= questions.length}
              pending={pending}
              onNext={() => next(step.index)}
            />
          )}
        </div>
      )}

      {step.kind === "debrief" && (
        <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 sm:p-6">
          <h2 ref={focusOnMount} tabIndex={-1} className="font-heading text-lg font-bold outline-none">
            Bilan de la séance
          </h2>
          <ol className="flex list-decimal flex-col gap-1.5 pl-5 text-sm">
            {step.points.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ol>
          <div>
            <Button onClick={begin} disabled={pending}>
              <RotateCcw aria-hidden />
              {pending ? "Préparation des questions…" : "Nouvelle séance"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackView({
  feedback,
  last,
  pending,
  onNext,
}: {
  feedback: Feedback;
  last: boolean;
  pending: boolean;
  onNext: () => void;
}) {
  return (
    <div ref={focusOnMount} tabIndex={-1} aria-label="Retour sur ta réponse" className="flex flex-col gap-3 text-sm outline-none">
      <FeedbackList title="Ce qui est bien" items={feedback.good} good />
      <FeedbackList title="À améliorer" items={feedback.improve} />
      <div className="flex flex-col gap-1 rounded-md bg-accent/60 p-3">
        <span className="font-semibold">Une meilleure formulation</span>
        <p className="whitespace-pre-wrap">{feedback.betterAnswer}</p>
      </div>
      <div>
        <Button onClick={onNext} disabled={pending}>
          {pending && last ? "Bilan en cours…" : last ? "Voir le bilan" : "Question suivante"}
        </Button>
      </div>
    </div>
  );
}

function FeedbackList({ title, items, good = false }: { title: string; items: string[]; good?: boolean }) {
  if (items.length === 0) return null;
  const Icon = good ? CircleCheck : CircleAlert;
  return (
    <div className="flex flex-col gap-1">
      <span className="font-semibold">{title}</span>
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <Icon aria-hidden className={good ? "mt-0.5 size-4 shrink-0 text-success" : "mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400"} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
