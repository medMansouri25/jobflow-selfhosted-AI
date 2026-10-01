"use client";

import Link from "next/link";
import { useActionState, useId, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { todayInParis } from "@/lib/dates";
import {
  APPLICATION_SOURCES,
  CONTRACT_TYPES,
  CURRENCIES,
  SALARY_PERIODS,
} from "@/modules/applications/domain/application";
import {
  initialFormState,
  type FormAction,
} from "@/lib/form-state";
import type { AttachmentKind } from "@/modules/applications/domain/application";
import { FormStateMessage } from "@/components/form-state-message";
import { Field, SelectField } from "@/components/form-fields";
import { formatFileSize } from "@/modules/applications/format";
import { MAX_ATTACHMENT_LABEL } from "@/modules/applications/schemas";
import {
  ATTACHMENT_KIND_LABELS,
  CONTRACT_TYPE_LABELS,
  SALARY_PERIOD_LABELS,
  SOURCE_LABELS,
} from "@/modules/applications/labels";

const subscribeNever = () => () => {};


export function ApplicationForm({
  action,
  onCancel,
  label = "Nouvelle candidature",
  initialValues = {},
  attachments = [],
  companySuggestions = [],
}: {
  action: FormAction;
  /** Fourni par la fenêtre modale ; sinon « Annuler » ramène à la liste. */
  onCancel?: () => void;
  /** Nom accessible du formulaire. */
  label?: string;
  /** Valeurs de départ (modification) ; après une erreur, la saisie renvoyée par le serveur prime. */
  initialValues?: Partial<Record<string, string>>;
  /** Pièces jointes déjà enregistrées (modification) : à garder, remplacer ou retirer. */
  attachments?: CurrentAttachment[];
  /** Noms des Entreprises existantes, proposés pendant la saisie (FR-001-04). */
  companySuggestions?: string[];
}) {
  const [state, formAction, pending] = useActionState(
    action,
    initialFormState,
  );
  const values = state.values ?? initialValues;
  // Date du jour lue dans le navigateur (fuseau de l'utilisateur), jamais figée dans le HTML du serveur.
  const today = useSyncExternalStore(subscribeNever, todayInParis, () => undefined);
  const companyListId = useId();
  const errors = state.fieldErrors ?? {};
  const error = (name: string) => errors[name]?.[0];

  return (
    <form
      action={formAction}
      aria-label={label}
      noValidate
      className="flex flex-col gap-5"
    >
      <FormStateMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Entreprise"
          required
          hint="Choisis une entreprise existante ou saisis-en une nouvelle."
          error={error("companyName")}
        >
          {(props) => (
            <>
              <Input
                {...props}
                name="companyName"
                maxLength={200}
                defaultValue={values.companyName}
                list={companyListId}
                autoComplete="off"
              />
              {/* Suggestions natives du navigateur (FR-001-04) : un nouveau nom reste possible. */}
              <datalist id={companyListId}>
                {companySuggestions.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </>
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
        {ATTACHMENT_FIELDS.map((field) => (
          <AttachmentField
            key={field.kind}
            field={field}
            current={attachments.find((attachment) => attachment.kind === field.kind)}
            error={error(field.name)}
          />
        ))}
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

type CurrentAttachment = { kind: AttachmentKind; name: string; size: number };

const ATTACHMENT_FIELDS = [
  { kind: "CV", name: "cv", removeName: "removeCv", the: "le CV" },
  {
    kind: "COVER_LETTER",
    name: "coverLetter",
    removeName: "removeCoverLetter",
    the: "la lettre de motivation",
  },
] as const;

/**
 * Pièce jointe du formulaire. Sans fichier enregistré : un champ pour en ajouter un. Avec un fichier
 * enregistré : son nom, une case « Retirer » et un champ « Remplacer par… » (rien choisi = on garde).
 */
function AttachmentField({
  field,
  current,
  error,
}: {
  field: (typeof ATTACHMENT_FIELDS)[number];
  current?: CurrentAttachment;
  error?: string;
}) {
  const label = ATTACHMENT_KIND_LABELS[field.kind];
  const fileLabel = current
    ? `Remplacer ${field.the} par… (PDF, ${MAX_ATTACHMENT_LABEL} max.)`
    : `${label} (PDF, ${MAX_ATTACHMENT_LABEL} max.)`;
  return (
    <div className="flex flex-col gap-2">
      {current && (
        <div className="flex flex-col gap-1 text-sm">
          <p>
            <span className="text-muted-foreground">{label} actuel : </span>
            <span className="font-medium">
              {current.name} ({formatFileSize(current.size)})
            </span>
          </p>
          <label className="flex items-center gap-2">
            <input type="checkbox" name={field.removeName} className="size-4" />
            Retirer {field.the}
          </label>
        </div>
      )}
      <Field label={fileLabel} error={error}>
        {(props) => <Input {...props} name={field.name} type="file" accept="application/pdf" />}
      </Field>
    </div>
  );
}
