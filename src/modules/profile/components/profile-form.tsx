"use client";

import { useActionState } from "react";

import { Field } from "@/components/form-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormStateMessage } from "@/components/form-state-message";
import { initialFormState, type FormAction } from "@/lib/form-state";

const SHORT_FIELDS = [
  { name: "fullName", label: "Nom complet", maxLength: 200 },
  { name: "targetRole", label: "Poste recherché", maxLength: 200, placeholder: "Ingénieur logiciel, DevOps…" },
  { name: "location", label: "Localisation", maxLength: 200, placeholder: "Paris, mobile en France" },
  { name: "email", label: "E-mail", maxLength: 200, type: "email" },
  { name: "phone", label: "Téléphone", maxLength: 40, type: "tel" },
  { name: "linkedinUrl", label: "Profil LinkedIn", maxLength: 2048, type: "url", placeholder: "https://" },
] as const;

const TEXT_FIELDS = [
  { name: "about", label: "À propos de moi", hint: "Qui tu es, ce que tu cherches, en quelques phrases." },
  { name: "experience", label: "Expériences", hint: "Colle tes expériences : poste, entreprise, dates, missions." },
  { name: "projects", label: "Projets", hint: "Projets personnels, d'école ou open source, avec les technologies." },
  { name: "skills", label: "Compétences", hint: "Langages, outils, méthodes, langues…" },
  { name: "education", label: "Formations", hint: "Diplômes, écoles, certifications." },
  {
    name: "writingSamples",
    label: "Exemples de textes écrits par moi",
    hint: "Une ou deux lettres de motivation que tu as écrites : l'assistant reprendra ton style.",
  },
] as const;

/** Formulaire du Profil (SPEC-006) : champs courts et zones de texte libre, tous facultatifs. */
export function ProfileForm({
  action,
  initialValues = {},
}: {
  action: FormAction;
  /** Profil enregistré ; après un envoi, la saisie renvoyée par le serveur prime. */
  initialValues?: Partial<Record<string, string>>;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const values = state.values ?? initialValues;
  const error = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} aria-label="Profil" noValidate className="flex flex-col gap-6">
      <FormStateMessage state={state} />

      <section className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="font-heading font-bold">Coordonnées</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {SHORT_FIELDS.map((field) => (
            <Field key={field.name} label={field.label} error={error(field.name)}>
              {(props) => (
                <Input
                  {...props}
                  name={field.name}
                  type={"type" in field ? field.type : "text"}
                  maxLength={field.maxLength}
                  placeholder={"placeholder" in field ? field.placeholder : undefined}
                  defaultValue={values[field.name]}
                />
              )}
            </Field>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:p-6">
        <h2 className="font-heading font-bold">Parcours</h2>
        {TEXT_FIELDS.map((field) => (
          <Field key={field.name} label={field.label} hint={field.hint} error={error(field.name)}>
            {(props) => (
              <Textarea
                {...props}
                name={field.name}
                rows={field.name === "experience" || field.name === "writingSamples" ? 10 : 5}
                maxLength={20_000}
                defaultValue={values[field.name]}
              />
            )}
          </Field>
        ))}
      </section>

      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          Enregistrer
        </Button>
      </div>
    </form>
  );
}
