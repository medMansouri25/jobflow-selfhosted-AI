# Task: Agenda (T4.3, T4.4)

**Status**: Completed
**Type**: Full-stack
**Created**: 2026-10-01

## Problem
Les Entretiens se listent, mais on ne voit pas leur répartition dans la semaine ou le mois (SPEC-004).

## Outcome
Page « Agenda » (menu) : vue semaine (par défaut) et vue mois (pastilles, jour choisi détaillé), navigation Précédent / Aujourd'hui / Suivant, état dans l'URL. Chaque Entretien avec un lien de visio a un bouton « Rejoindre sur Teams / Google Meet / Zoom / la visio » (demande de l'utilisateur du 2026-10-01, FR-004-07), aussi dans les listes du tableau de bord et de la page Entretiens.

## Constraints / Notes
- Calendrier pur dans `agenda/domain/calendar.ts` ; arithmétique de jours partagée avec SPEC-002 dans `src/lib/days.ts` (sortie de `dashboard/domain/stats.ts`).
- Entretiens d'une période rangés par jour de Paris (`listInterviewsByDay`) : un Entretien à 0 h 30 reste le jour même.
- Plateforme reconnue sur le nom de domaine (`meeting-link.ts`), jamais sur le reste de l'adresse ; lien seulement en http(s), `rel="noopener noreferrer"`.
- Vérifié dans le navigateur (base de dev, lien Teams ajouté à l'Entretien de démonstration) : semaines et mois sur ordinateur et à 375 px, bouton « Rejoindre sur Teams », aucun défilement horizontal.

## Missions
- [x] Mission 1: Calendrier (semaine, grille du mois, période voisine, paramètres d'URL) + tests (AC-004-01, 03, 04, 07)
- [x] Mission 2: `listInterviewsByDay` + tests d'intégration (AC-004-02, 06, 08)
- [x] Mission 3: Lien de visio (`meetingLink`, `JoinButton`) + tests (FR-004-07)
- [x] Mission 4: Vues semaine et mois, page `/agenda`, menu + tests de composant (AC-004-02 à 05)
