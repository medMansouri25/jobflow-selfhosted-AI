"use client";

import Link from "next/link";
import { useActionState, useId, useSyncExternalStore, type ReactNode } from "react";

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
import { todayInParis } from "@/lib/dates";
import { cn } from "@/lib/utils";
import {
  APPLICATION_SOURCES,
  CONTRACT_TYPES,
  CURRENCIES,
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
} from "@/modules/applications/labels";

const subscribeNever = () => () => {};

type FormAction = (
  state: ApplicationFormState,
  formData: FormData,
) => Promise<ApplicationFormState>;

export function ApplicationForm({
  action,
  onCancel,
}: {
  action: FormAction;
  /** Fourni par la fenêtre modale ; sinon « Annuler » ramène à la liste. */
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialApplicationFormState,
  );
  const values = state.values ?? {};
  // `/applications/new` est pré-rendue au build : la date du jour est lue dans le navigateur.
  const today = useSyncExternalStore(subscribeNever, todayInParis, () => undefined);
  const errors = state.fieldErrors ?? {};
  const error = (name: string) => errors[name]?.[0];

  return (
    <form
      action={formAction}
      aria-label="Nouvelle candidature"
      noValidate
      className="flex flex-col gap-5"
    >
      {state.status !== "idle" && state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={cn(
            "rounded-md px-4 py-3 text-sm",
            state.status === "error"
              ? "bg-status-rejected-bg text-status-rejected-fg"
              : "bg-status-accepted-bg text-status-accepted-fg",
          )}
        >
          {state.message}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Entreprise"
          required
          hint="Choisis une entreprise existante ou saisis-en une nouvelle."
          error={error("companyName")}
        >
          {(props) => (
            <Input {...props} name="companyName" maxLength={200} defaultValue={values.companyName} />
          )}
        </Field>
        <Field label="Intitulé du poste" required error={error("jobTitle")}>
          {(props) => (
            <Input {...props} name="jobTitle" maxLength={200} defaultValue={values.jobTitle} />
          )}
        </Field>
        <Field label="Localisation" required error={error("location")}>
          {(props) => (
            <Input {...props} name="location" maxLength={200} defaultValue={values.location} />
          )}
        </Field>

        <Field label="Type de contrat" required error={error("contractType")}>
          {(props) => (
            <SelectField
              {...props}
              name="contractType"
              value={values.contractType}
              options={CONTRACT_TYPES.map((v) => [v, CONTRACT_TYPE_LABELS[v]])}
            />
          )}
        </Field>
        <Field label="Source de l'annonce" required error={error("source")}>
          {(props) => (
            <SelectField
              {...props}
              name="source"
              value={values.source}
              options={APPLICATION_SOURCES.map((v) => [v, SOURCE_LABELS[v]])}
            />
          )}
        </Field>
        <Field label="Date de candidature" required error={error("appliedAt")}>
          {(props) => (
            <Input
              {...props}
              name="appliedAt"
              type="date"
              defaultValue={values.appliedAt ?? today}
            />
          )}
        </Field>

        <Field
          label="URL de l'annonce (référence uniquement — pas de récupération automatique)"
          error={error("jobUrl")}
          className="sm:col-span-3"
        >
          {(props) => (
            <Input
              {...props}
              name="jobUrl"
              type="url"
              inputMode="url"
              placeholder="https://"
              defaultValue={values.jobUrl}
            />
          )}
        </Field>
        <Field
          label="Description du poste (copier-coller)"
          error={error("jobDescription")}
          className="sm:col-span-3"
        >
          {(props) => (
            <Textarea
              {...props}
              name="jobDescription"
              rows={5}
              maxLength={50_000}
              defaultValue={values.jobDescription}
            />
          )}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Field label="Salaire min" error={error("salaryMin")}>
          {(props) => (
            <Input {...props} name="salaryMin" inputMode="numeric" defaultValue={values.salaryMin} />
          )}
        </Field>
        <Field label="Salaire max" error={error("salaryMax")}>
          {(props) => (
            <Input {...props} name="salaryMax" inputMode="numeric" defaultValue={values.salaryMax} />
          )}
        </Field>
        <Field label="Devise" error={error("salaryCurrency")}>
          {(props) => (
            <SelectField
              {...props}
              name="salaryCurrency"
              value={values.salaryCurrency ?? "EUR"}
              options={CURRENCIES.map((v) => [v, v])}
            />
          )}
        </Field>
        <Field label="Période" error={error("salaryPeriod")}>
          {(props) => (
            <SelectField
              {...props}
              name="salaryPeriod"
              value={values.salaryPeriod}
              options={SALARY_PERIODS.map((v) => [v, SALARY_PERIOD_LABELS[v]])}
            />
          )}
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Notes personnelles (recruteurs, date limite de réponse…)"
          error={error("notes")}
          className="sm:col-span-2"
        >
          {(props) => (
            <Textarea {...props} name="notes" rows={3} maxLength={20_000} defaultValue={values.notes} />
          )}
        </Field>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          * requis
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {onCancel ? (
            <Button type="button" variant="ghost" onClick={onCancel}>
              Annuler
            </Button>
          ) : (
            <Button asChild variant="ghost">
              <Link href="/applications">Annuler</Link>
            </Button>
          )}
          <Button type="submit" disabled={pending}>
            Enregistrer
          </Button>
        </div>
      </div>
    </form>
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
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id} className="text-xs font-medium text-foreground/80">
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

function SelectField({
  name,
  value,
  options,
  ...triggerProps
}: ControlProps & {
  name: string;
  value?: string;
  options: [value: string, label: string][];
}) {
  return (
    // `key` : remonte la liste avec la valeur renvoyée par le serveur après une erreur.
    <Select key={`${name}-${value ?? ""}`} name={name} defaultValue={value}>
      <SelectTrigger {...triggerProps} className="w-full">
        <SelectValue placeholder="—" />
      </SelectTrigger>
      <SelectContent>
        {options.map(([optionValue, label]) => (
          <SelectItem key={optionValue} value={optionValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
