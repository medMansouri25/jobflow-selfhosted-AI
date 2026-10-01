# SPEC-004 — Agenda

| | |
|---|---|
| **Statut** | **Validée** le 2026-10-01 |
| **Date** | 2026-10-01 |
| **Phase** | 4 — Agenda |
| **Vocabulaire** | `CONTEXT.md` fait foi (Entretien en tant que rendez-vous) |
| **Dépend de** | [SPEC-003](./003-interviews.md) (Entretiens) |

---

## 1. Problème

La page « Entretiens » liste mes rendez-vous, mais je ne vois pas d'un coup d'œil comment ils se répartissent dans ma semaine ou dans mon mois.

## 2. Objectif

Une page **Agenda** qui montre mes Entretiens dans une vue **semaine** ou **mois**, et qui se parcourt dans le temps.

## 3. Périmètre

### Inclus

- Page « Agenda » (menu), vue semaine et vue mois, navigation précédent / aujourd'hui / suivant.
- Seuls les **Entretiens** y figurent.

### Exclus

| Exclu | Où / quand |
|---|---|
| Autres événements (dates de candidature, relances) | Non prévu |
| Synchronisation Google Calendar / Outlook, export .ics | Hors MVP (SPEC-000) |
| Ajout d'un Entretien depuis l'agenda | Non prévu : il s'ajoute depuis la fiche de sa Candidature |

## 4. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-004-01 | La page « Agenda » s'ouvre sur la **semaine en cours**. |
| FR-004-02 | **Vue semaine** : les 7 jours du lundi au dimanche, avec pour chaque jour ses Entretiens (heure, Entreprise, type) par heure croissante. |
| FR-004-03 | **Vue mois** : la grille du mois (semaines du lundi au dimanche) ; un jour qui a des Entretiens porte une pastille avec leur nombre ; choisir un jour affiche ses Entretiens sous la grille. |
| FR-004-04 | Boutons « Précédent », « Aujourd'hui », « Suivant » (d'une semaine ou d'un mois selon la vue) et choix de la vue. |
| FR-004-05 | Chaque Entretien mène à la fiche de sa Candidature. |
| FR-004-06 | La vue, la période et le jour choisi sont dans l'URL (`/agenda?vue=mois&date=2026-10-01&jour=2026-10-14`) : un lien ou un rechargement garde l'affichage ; un paramètre invalide revient à la semaine en cours. |

## 5. Règles

- **BR-004-01** — Les jours sont ceux de Paris : un Entretien à 0 h 30 heure de Paris est rangé ce jour-là, pas la veille (stocké la veille en UTC).
- **BR-004-02** — La semaine commence le lundi (comme SPEC-002).
- **BR-004-03** — Le jour d'aujourd'hui est mis en évidence dans les deux vues.
- **BR-004-04** — La vue mois montre les jours des mois voisins qui complètent ses semaines, en grisé, avec leurs pastilles.

## 6. Critères d'acceptation

| ID | Étant donné | Quand | Alors |
|---|---|---|---|
| AC-004-01 | nous sommes le mercredi 2026-10-14 | j'ouvre l'Agenda | la vue semaine du lundi 12 au dimanche 18 octobre s'affiche |
| AC-004-02 | deux Entretiens le 14 oct. à 14 h et à 9 h | je regarde la semaine | ils sont sous le mercredi 14, 9 h avant 14 h, avec l'Entreprise et le type |
| AC-004-03 | la vue semaine du 12 oct. | je clique « Suivant », puis « Aujourd'hui » | la semaine du 19 oct. s'affiche, puis de nouveau celle du 12 |
| AC-004-04 | octobre 2026 en vue mois | je l'affiche | la grille va du lundi 28 sept. au dimanche 1ᵉʳ nov. ; le 14 porte une pastille « 2 » |
| AC-004-05 | la vue mois | je choisis le 14 | ses Entretiens s'affichent sous la grille |
| AC-004-06 | un Entretien le 15 oct. à 0 h 30 (heure de Paris) | je regarde la semaine | il est sous le jeudi 15 |
| AC-004-07 | `/agenda?vue=nimporte&date=pas-une-date` | j'ouvre l'adresse | la semaine en cours s'affiche |
| AC-004-08 | un Entretien d'un autre utilisateur | j'ouvre l'Agenda | il n'apparaît pas |

## 7. Plan de test

| Niveau | Outil | Ce qui est testé | Critères |
|---|---|---|---|
| Unitaire | Vitest | Jours d'une semaine, grille d'un mois, période précédente / suivante, lecture des paramètres d'URL | AC-004-01, 03, 04, 07 |
| Intégration | Vitest + PostgreSQL | Entretiens d'une période, rangés par jour de Paris, filtrés par utilisateur | AC-004-02, 06, 08 |
| Composant | Vitest + Testing Library | Vues semaine et mois, pastilles, jour choisi, liens | AC-004-02, 04, 05 |

Chaque test cite l'identifiant du critère qu'il couvre.
