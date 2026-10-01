// Calendrier de l'Agenda (SPEC-004), en TypeScript pur : des jours AAAA-MM-JJ, semaines du lundi au dimanche.

import { addDays, firstOfMonth, isValidDay, mondayOf } from "@/lib/days";

export const AGENDA_VIEWS = ["semaine", "mois"] as const;
export type AgendaView = (typeof AGENDA_VIEWS)[number];

/** Les 7 jours de la semaine de `day`, du lundi au dimanche. */
export function weekDays(day: string): string[] {
  const monday = mondayOf(day);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** Le mois de `day` en semaines complètes (BR-004-04) : du lundi de son 1ᵉʳ jour au dimanche de son dernier. */
export function monthGrid(day: string): string[][] {
  const lastDay = addDays(firstOfMonth(day, 1), -1);
  const weeks: string[][] = [];
  for (let monday = mondayOf(firstOfMonth(day)); monday <= lastDay; monday = addDays(monday, 7)) {
    weeks.push(weekDays(monday));
  }
  return weeks;
}

/** Période voisine : une semaine plus tôt / plus tard, ou le 1ᵉʳ du mois précédent / suivant. */
export function shiftPeriod(view: AgendaView, day: string, step: 1 | -1): string {
  return view === "semaine" ? addDays(day, 7 * step) : firstOfMonth(day, step);
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Vue, date et jour choisi lus dans l'URL (FR-004-06) ; tout paramètre invalide est ignoré (AC-004-07). */
export function parseAgendaParams(params: SearchParams, today: string) {
  const view = first(params.vue);
  const date = first(params.date);
  const day = first(params.jour);
  return {
    view: AGENDA_VIEWS.find((v) => v === view) ?? "semaine",
    date: date && isValidDay(date) ? date : today,
    day: day && isValidDay(day) ? day : undefined,
  };
}
