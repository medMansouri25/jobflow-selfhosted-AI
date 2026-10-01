import type { Metadata } from "next";

import { getCurrentUserId } from "@/lib/current-user";
import { todayInParis } from "@/lib/dates";
import { Agenda } from "@/modules/agenda/components/agenda";
import { monthGrid, parseAgendaParams, weekDays } from "@/modules/agenda/domain/calendar";
import { listInterviewsByDay } from "@/modules/applications/interview-lists";

export const metadata: Metadata = {
  title: "Agenda · JobFlow AI",
};

// Le jour d'aujourd'hui et les Entretiens sont lus à chaque requête.
export const dynamic = "force-dynamic";

/** Agenda des Entretiens (SPEC-004), vue et période lues dans l'URL (FR-004-06). */
export default async function AgendaPage({ searchParams }: PageProps<"/agenda">) {
  const today = todayInParis();
  const { view, date, day } = parseAgendaParams(await searchParams, today);
  const days = view === "semaine" ? weekDays(date) : monthGrid(date).flat();
  const byDay = await listInterviewsByDay(await getCurrentUserId(), days[0], days.at(-1)!);

  return <Agenda view={view} date={date} day={day} today={today} byDay={byDay} />;
}
