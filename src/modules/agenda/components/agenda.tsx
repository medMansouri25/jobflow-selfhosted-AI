import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { monthGrid, shiftPeriod, weekDays, type AgendaView } from "@/modules/agenda/domain/calendar";
import {
  InterviewList,
  JoinButton,
  type InterviewListEntry,
} from "@/modules/applications/components/interview-list";
import { INTERVIEW_TYPE_LABELS } from "@/modules/applications/labels";

type ByDay = Record<string, InterviewListEntry[]>;

// Les jours sont des chaînes AAAA-MM-JJ : formatés en UTC pour ne jamais changer de jour.
const format = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("fr-FR", { ...options, timeZone: "UTC" });
const dayShort = format({ weekday: "short", day: "numeric", month: "short" });
const dayLong = format({ weekday: "long", day: "numeric", month: "long" });
const monthTitle = format({ month: "long", year: "numeric" });
const dayNumber = format({ day: "numeric" });
const timeFormat = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Paris",
});

const asDate = (day: string) => new Date(`${day}T00:00:00Z`);
const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);
const countLabel = (n: number) => (n === 0 ? "aucun entretien" : `${n} entretien${n > 1 ? "s" : ""}`);

/** Adresse de l'Agenda (FR-004-06) ; la semaine en cours est `/agenda`. */
export function agendaHref({ view, date, day }: { view: AgendaView; date?: string; day?: string }): string {
  const params = new URLSearchParams();
  if (view !== "semaine" || date) params.set("vue", view);
  if (date) params.set("date", date);
  if (day) params.set("jour", day);
  const query = params.toString();
  return query ? `/agenda?${query}` : "/agenda";
}

/** Agenda des Entretiens (SPEC-004) : vue semaine ou mois autour de `date`, jours de Paris. */
export function Agenda({
  view,
  date,
  day,
  today,
  byDay,
}: {
  view: AgendaView;
  date: string;
  /** Jour choisi dans la vue mois (FR-004-03). */
  day?: string;
  today: string;
  byDay: ByDay;
}) {
  const days = weekDays(date);
  const title =
    view === "semaine"
      ? `Semaine du ${dayShort.format(asDate(days[0]))} au ${dayShort.format(asDate(days[6]))}`
      : capitalize(monthTitle.format(asDate(date)));

  return (
    <main className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-3xl font-extrabold tracking-tight sm:text-4xl">Agenda</h1>
          <p className="text-muted-foreground">{title}</p>
        </div>
        <nav aria-label="Période" className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border bg-card p-0.5 text-sm">
            {(["semaine", "mois"] as const).map((v) => (
              <Link
                key={v}
                href={agendaHref({ view: v, date })}
                aria-current={v === view ? "page" : undefined}
                className={cn(
                  "rounded px-3 py-1 font-medium",
                  v === view ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-muted",
                )}
              >
                {v === "semaine" ? "Semaine" : "Mois"}
              </Link>
            ))}
          </div>
          <NavLink href={agendaHref({ view, date: shiftPeriod(view, date, -1) })}>
            <ChevronLeft aria-hidden className="size-4" />
            Précédent
          </NavLink>
          <NavLink href={agendaHref({ view })}>Aujourd&apos;hui</NavLink>
          <NavLink href={agendaHref({ view, date: shiftPeriod(view, date, 1) })}>
            Suivant
            <ChevronRight aria-hidden className="size-4" />
          </NavLink>
        </nav>
      </div>

      {view === "semaine" ? (
        <WeekView days={days} today={today} byDay={byDay} />
      ) : (
        <MonthView date={date} day={day} today={today} byDay={byDay} />
      )}
    </main>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 rounded-md border bg-card px-3 py-1.5 text-sm font-medium hover:bg-muted"
    >
      {children}
    </Link>
  );
}

/** Les 7 jours (FR-004-02) : côte à côte sur grand écran, les uns sous les autres sur téléphone. */
function WeekView({ days, today, byDay }: { days: string[]; today: string; byDay: ByDay }) {
  return (
    <ul className="grid gap-3 lg:grid-cols-7">
      {days.map((day) => {
        const interviews = byDay[day] ?? [];
        return (
          <li
            key={day}
            data-day={day}
            aria-current={day === today ? "date" : undefined}
            className={cn(
              "flex flex-col gap-2 rounded-lg border bg-card p-3 lg:min-h-40",
              day === today && "border-primary ring-1 ring-primary",
            )}
          >
            <span className={cn("text-sm font-semibold", day === today && "text-primary")}>
              {capitalize(dayShort.format(asDate(day)))}
            </span>
            {interviews.length === 0 ? (
              <span className="text-xs text-muted-foreground">—</span>
            ) : (
              <ul className="flex flex-col gap-2">
                {interviews.map((interview) => (
                  <li key={interview.id} className="flex flex-col gap-1 rounded-md bg-accent/60 p-2 text-xs">
                    <span className="font-semibold">{timeFormat.format(interview.scheduledAt)}</span>
                    <Link
                      href={`/applications/${interview.application.id}`}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      {interview.application.company.name}
                    </Link>
                    <span className="text-muted-foreground">{INTERVIEW_TYPE_LABELS[interview.type]}</span>
                    <JoinButton location={interview.location} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

const WEEKDAY_HEADERS = ["L", "M", "M", "J", "V", "S", "D"];

/** Grille du mois (FR-004-03) : pastilles par jour, jour choisi détaillé sous la grille. */
function MonthView({ date, day, today, byDay }: { date: string; day?: string; today: string; byDay: ByDay }) {
  const month = date.slice(0, 7);
  const title = capitalize(monthTitle.format(asDate(date)));

  return (
    <div className="flex flex-col gap-6">
      {/* Tableau, pas « grid » : pas de navigation au clavier par flèches, chaque jour est un lien. */}
      <div role="table" aria-label={title} className="overflow-hidden rounded-lg border bg-card">
        <div role="row" className="grid grid-cols-7 border-b bg-muted text-center text-xs font-bold text-foreground/60">
          {WEEKDAY_HEADERS.map((label, i) => (
            <span key={i} role="columnheader" className="py-2">
              {label}
            </span>
          ))}
        </div>
        {monthGrid(date).map((week) => (
          <div key={week[0]} role="row" className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((cell) => {
              const count = byDay[cell]?.length ?? 0;
              return (
                <div key={cell} role="cell" className="border-r last:border-r-0">
                  <Link
                    href={agendaHref({ view: "mois", date, day: cell })}
                    aria-label={`${dayShort.format(asDate(cell))} : ${countLabel(count)}`}
                    // « date » = aujourd'hui (comme la vue semaine) ; le jour choisi est « true ».
                    aria-current={cell === today ? "date" : cell === day ? "true" : undefined}
                    className={cn(
                      "flex h-14 flex-col items-center justify-center gap-1 text-sm hover:bg-muted sm:h-20",
                      !cell.startsWith(month) && "text-muted-foreground/60",
                      cell === day && "bg-accent",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full",
                        cell === today && "bg-primary font-bold text-primary-foreground",
                      )}
                    >
                      {dayNumber.format(asDate(cell))}
                    </span>
                    {count > 0 && (
                      <span className="rounded-full bg-primary/15 px-1.5 text-[10px] font-bold text-primary">
                        {count}
                      </span>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {day && (
        <section aria-label={dayLong.format(asDate(day))} className="flex flex-col gap-3">
          <h2 className="font-heading font-bold">{capitalize(dayLong.format(asDate(day)))}</h2>
          <div className="rounded-lg border bg-card">
            <InterviewList interviews={byDay[day] ?? []} empty="Aucun entretien ce jour-là." />
          </div>
        </section>
      )}
    </div>
  );
}
