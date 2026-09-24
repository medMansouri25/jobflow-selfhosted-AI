"use client";

import { useActionState, useId, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  APPLICATION_SOURCES,
  CONTRACT_TYPES,
  INITIAL_STATUSES,
  SALARY_PERIODS,
} from "@/modules/applications/domain/application";
import {
  initialApplicationFormState,
  type ApplicationFormState,
} from "@/modules/applications/form-state";
import {
  CONTRACT_TYPE_LABELS,
  SALARY_PERIOD_LABELS,
  SOURCE_LABELS,
  STATUS_LABELS,
} from "@/modules/applications/labels";

type FormAction = (
  state: ApplicationFormState,
  formData: FormData,
) => Promise<ApplicationFormState>;

const STATUS_HINTS = {
  DRAFT: "Je prépare ma candidature, elle n'est pas encore envoyée.",
  APPLIED: "J'ai déjà envoyé ma candidature.",
} as const;

export function ApplicationForm({ action }: { action: FormAction }) {
  const [state, formAction, pending] = useActionState(
    action,
    initialApplicationFormState,
  );
  const values = state.values ?? {};
  const errors = state.fieldErrors ?? {};
  const error = (name: string) => errors[name]?.[0];

  return (
    <form
      action={formAction}
      aria-label="Nouvelle candidature"
      noValidate
      className="flex flex-col gap-6"
    >
      {state.status !== "idle" && state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={cn(
            "rounded-lg border px-4 py-3 text-sm",
            state.status === "error"
              ? "border-destructive/30 bg-destructive/5 text-destructive"
              : "border-status-accepted/30 bg-status-accepted/10 text-status-accepted",
          )}
        >
          {state.message}
        </p>
      )}

      <Section
        title="Où en es-tu ?"
        description="Une candidature commence en Brouillon ou directement en Postulée."
      >
        <fieldset className="grid gap-3 sm:grid-cols-2">
          <legend className="sr-only">Statut initial</legend>
          {INITIAL_STATUSES.map((status) => (
            <label
              key={status}
              className="flex cursor-pointer items-start gap-3 rounded-lg border bg-background p-4 transition-colors has-checked:border-primary has-checked:bg-accent"
            >
              <input
                type="radio"
                name="status"
                value={status}
                defaultChecked={(values.status ?? "DRAFT") === status}
                className="mt-1 accent-primary"
              />
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{STATUS_LABELS[status]}</span>
                <span className="text-sm text-muted-foreground">
                  {STATUS_HINTS[status]}
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      </Section>

      <Section title="Le poste" description="L'Entreprise et l'intitulé suffisent pour un Brouillon.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Entreprise" required error={error("companyName")}>
            {(props) => (
              <Input
                {...props}
                name="companyName"
                maxLength={200}
                placeholder="Ex. Thales"
                defaultValue={values.companyName}
              />
            )}
          </Field>
          <Field label="Intitulé du poste" required error={error("jobTitle")}>
            {(props) => (
              <Input
                {...props}
                name="jobTitle"
                maxLength={200}
                placeholder="Ex. Développeur backend"
                defaultValue={values.jobTitle}
              />
            )}
          </Field>
          <Field label="Localisation" error={error("location")}>
            {(props) => (
              <Input
                {...props}
                name="location"
                maxLength={200}
                placeholder="Ex. Paris, télétravail partiel"
                defaultValue={values.location}
              />
            )}
          </Field>
          <Field label="Type de contrat" error={error("contractType")}>
            {(props) => (
              <Select
                key={`contract-${values.contractType ?? ""}`}
                name="contractType"
                defaultValue={values.contractType}
              >
                <SelectTrigger {...props} className="w-full">
                  <SelectValue placeholder="Non précisé" />
                </SelectTrigger>
                <SelectContent>
                  {CONTRACT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {CONTRACT_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
        </div>
      </Section>

      <Section
        title="L'Annonce"
        description="Colle la description complète : tu la retrouveras même si l'annonce disparaît en ligne."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="URL de l'Annonce" error={error("jobUrl")}>
            {(props) => (
              <Input
                {...props}
                name="jobUrl"
                type="url"
                inputMode="url"
                placeholder="https://…"
                defaultValue={values.jobUrl}
              />
            )}
          </Field>
          <Field label="Source" error={error("source")}>
            {(props) => (
              <Select
                key={`source-${values.source ?? ""}`}
                name="source"
                defaultValue={values.source}
              >
                <SelectTrigger {...props} className="w-full">
                  <SelectValue placeholder="Non précisée" />
                </SelectTrigger>
                <SelectContent>
                  {APPLICATION_SOURCES.map((source) => (
                    <SelectItem key={source} value={source}>
                      {SOURCE_LABELS[source]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
          <Field
            label="Description du poste"
            error={error("jobDescription")}
            className="sm:col-span-2"
          >
            {(props) => (
              <Textarea
                {...props}
                name="jobDescription"
                rows={8}
                maxLength={50_000}
                placeholder="Colle ici le texte de l'Annonce…"
                defaultValue={values.jobDescription}
              />
            )}
          </Field>
        </div>
      </Section>

      <Section title="Rémunération" description="Facultatif — le salaire annoncé, s'il est indiqué.">
        <div className="grid gap-5 sm:grid-cols-4">
          <Field label="Minimum" error={error("salaryMin")}>
            {(props) => (
              <Input
                {...props}
                name="salaryMin"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                placeholder="40000"
                defaultValue={values.salaryMin}
              />
            )}
          </Field>
          <Field label="Maximum" error={error("salaryMax")}>
            {(props) => (
              <Input
                {...props}
                name="salaryMax"
                type="number"
                min={1}
                step={1}
                inputMode="numeric"
                placeholder="45000"
                defaultValue={values.salaryMax}
              />
            )}
          </Field>
          <Field label="Devise" error={error("salaryCurrency")}>
            {(props) => (
              <Input
                {...props}
                name="salaryCurrency"
                maxLength={3}
                defaultValue={values.salaryCurrency ?? "EUR"}
                className="uppercase"
              />
            )}
          </Field>
          <Field label="Période" error={error("salaryPeriod")}>
            {(props) => (
              <Select
                key={`period-${values.salaryPeriod ?? ""}`}
                name="salaryPeriod"
                defaultValue={values.salaryPeriod}
              >
                <SelectTrigger {...props} className="w-full">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {SALARY_PERIODS.map((period) => (
                    <SelectItem key={period} value={period}>
                      {SALARY_PERIOD_LABELS[period]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Field>
        </div>
      </Section>

      <Section title="Suivi" description="Ce que tu as envoyé, et tes notes personnelles.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Date de candidature"
            hint="Obligatoire pour une candidature Postulée."
            error={error("appliedAt")}
          >
            {(props) => (
              <Input
                {...props}
                name="appliedAt"
                type="date"
                defaultValue={values.appliedAt}
              />
            )}
          </Field>
          <Field
            label="Version du CV envoyée"
            error={error("cvLabel")}
          >
            {(props) => (
              <Input
                {...props}
                name="cvLabel"
                maxLength={200}
                placeholder="Ex. CV_2026_backend_v3"
                defaultValue={values.cvLabel}
              />
            )}
          </Field>
          <Field
            label="Lettre de motivation"
            error={error("coverLetter")}
            className="sm:col-span-2"
          >
            {(props) => (
              <Textarea
                {...props}
                name="coverLetter"
                rows={5}
                maxLength={20_000}
                defaultValue={values.coverLetter}
              />
            )}
          </Field>
          <Field label="Notes" error={error("notes")} className="sm:col-span-2">
            {(props) => (
              <Textarea
                {...props}
                name="notes"
                rows={4}
                maxLength={20_000}
                placeholder="Recruteur, échanges, date limite de réponse…"
                defaultValue={values.notes}
              />
            )}
          </Field>
        </div>
      </Section>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer la candidature"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-6 shadow-xs">
      <header className="mb-5">
        <h2 className="font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      {children}
    </section>
  );
}

type ControlProps = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby"?: string;
};

function Field({
  label,
  required,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: (props: ControlProps) => ReactNode;
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy =
    [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id}>
        {label}
        {required && (
          <span aria-hidden className="text-primary">
            *
          </span>
        )}
      </Label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
