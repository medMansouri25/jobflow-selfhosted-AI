"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { INTERVIEW_FORMATS, INTERVIEW_TYPES } from "@/modules/applications/domain/application";
import { Field, SelectField } from "@/components/form-fields";
import { FormStateMessage } from "@/modules/applications/components/form-state-message";
import {
  initialApplicationFormState,
  type FormAction,
} from "@/modules/applications/form-state";
import { INTERVIEW_FORMAT_LABELS, INTERVIEW_TYPE_LABELS } from "@/modules/applications/labels";


/** Formulaire d'un Entretien (SPEC-003 §6), à l'ajout comme à la modification. Heures de Paris. */
export function InterviewForm({
  action,
  onCancel,
  label = "Nouvel entretien",
  initialValues = {},
}: {
  action: FormAction;
  onCancel?: () => void;
  label?: string;
  /** Valeurs de départ (modification) ; après une erreur, la saisie renvoyée par le serveur prime. */
  initialValues?: Partial<Record<string, string>>;
}) {
  const [state, formAction, pending] = useActionState(action, initialApplicationFormState);
  const values = state.values ?? initialValues;
  const error = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} aria-label={label} noValidate className="flex flex-col gap-5">
      <FormStateMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date et heure (heure de Paris)" required error={error("scheduledAt")}>
          {(props) => (
            <Input {...props} name="scheduledAt" type="datetime-local" defaultValue={values.scheduledAt} />
          )}
        </Field>
        <Field label="Type" required error={error("type")}>
          {(props) => (
            <SelectField
              {...props}
              name="type"
              value={values.type}
              options={INTERVIEW_TYPES.map((v) => [v, INTERVIEW_TYPE_LABELS[v]])}
            />
          )}
        </Field>
        <Field label="Format" required error={error("format")}>
          {(props) => (
            <SelectField
              {...props}
              name="format"
              value={values.format}
              options={INTERVIEW_FORMATS.map((v) => [v, INTERVIEW_FORMAT_LABELS[v]])}
            />
          )}
        </Field>
        <Field label="Lieu ou lien (adresse, Teams, Meet…)" error={error("location")} className="sm:col-span-2">
          {(props) => <Input {...props} name="location" maxLength={500} defaultValue={values.location} />}
        </Field>
        <Field label="Interlocuteur (nom, fonction)" error={error("interviewer")}>
          {(props) => <Input {...props} name="interviewer" maxLength={200} defaultValue={values.interviewer} />}
        </Field>
        <Field label="Préparation (avant)" error={error("preparation")} className="sm:col-span-3">
          {(props) => (
            <Textarea {...props} name="preparation" rows={3} maxLength={10_000} defaultValue={values.preparation} />
          )}
        </Field>
        <Field label="Compte rendu (après)" error={error("debrief")} className="sm:col-span-3">
          {(props) => (
            <Textarea {...props} name="debrief" rows={3} maxLength={10_000} defaultValue={values.debrief} />
          )}
        </Field>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" disabled={pending}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
