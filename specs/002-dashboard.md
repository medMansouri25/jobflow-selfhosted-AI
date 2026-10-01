# SPEC-002 — Tableau de bord

| | |
|---|---|
| **Statut** | **Validée** le 2026-10-01 |
| **Date** | 2026-10-01 |
| **Phase** | 2 — Dashboard |
| **Vocabulaire** | `CONTEXT.md` fait foi (Taux de réponse, Taux d'entretien) |
| **Dépend de** | [SPEC-000](./000-product-vision.md), [SPEC-001](./001-application-management.md) (statuts et historique) |

---

## 1. Problème

Je vois combien de Candidatures j'ai envoyées et où elles en sont, mais pas si ma recherche avance : est-ce que les entreprises répondent, est-ce que je décroche des entretiens, est-ce que je garde un rythme d'envoi régulier ?

## 2. Objectif

En ouvrant JobFlow, je sais en un coup d'œil où j'en suis : combien de Candidatures, leur répartition par statut, les plus récentes, mon **taux de réponse**, mon **taux d'entretien** et mon **rythme d'envoi** sur les dernières semaines.

## 3. Périmètre

### Inclus

- Indicateurs : nombre total de Candidatures, nombre en Entretien (existants depuis SPEC-001).
- Répartition par statut et Candidatures récentes (existantes depuis SPEC-001).
- **Taux de réponse** et **taux d'entretien**.
- **Candidatures par semaine** sur les 8 dernières semaines.

### Exclus

| Exclu | Où / quand |
|---|---|
| Prochains entretiens | SPEC-003 (le panneau reste avec son message d'attente) |
| Taux de refus, répartition par Entreprise / localisation / type de contrat | Plus tard, si le volume le justifie (décision du 2026-10-01) |
| Délais de réponse | Plus tard |
| Filtre de période sur les statistiques | Non prévu |

## 4. User stories

| ID | En tant qu'utilisateur, je veux… | …afin de… |
|---|---|---|
| US-002-01 | voir le nombre de Candidatures et leur répartition par statut | savoir où en est ma recherche |
| US-002-02 | voir mes Candidatures les plus récentes | reprendre là où je m'étais arrêté |
| US-002-03 | voir mon taux de réponse et mon taux d'entretien | savoir si mes Candidatures portent leurs fruits |
| US-002-04 | voir combien de Candidatures j'ai envoyées chaque semaine | garder un rythme régulier |

## 5. Exigences fonctionnelles

| ID | Exigence |
|---|---|
| FR-002-01 | Afficher le nombre total de Candidatures et le nombre de Candidatures au statut Entretien. _Livré en SPEC-001._ |
| FR-002-02 | Afficher la répartition des Candidatures par statut (nombre et barre proportionnelle). _Livré en SPEC-001._ |
| FR-002-03 | Afficher les 5 Candidatures modifiées le plus récemment, avec un lien vers chacune et vers la liste complète. _Livré en SPEC-001._ |
| FR-002-04 | Afficher le **taux de réponse** : Candidatures qui ne sont plus Postulée / total. |
| FR-002-05 | Afficher le **taux d'entretien** : Candidatures dont l'historique contient un passage au statut Entretien / total. |
| FR-002-06 | Afficher les **Candidatures par semaine** sur les 8 dernières semaines (semaine en cours comprise), en barres, d'après la **date de candidature**. |

## 6. Règles métier

- **BR-002-01** — Les taux portent sur **toutes** les Candidatures, quelle que soit leur date.
- **BR-002-02** — Une Candidature Refusée après un Entretien compte dans le taux de réponse **et** dans le taux d'entretien (l'historique des statuts fait foi, pas le statut actuel).
- **BR-002-03** — Les taux sont des pourcentages arrondis à l'unité la plus proche. Sans aucune Candidature, ils s'affichent « — ».
- **BR-002-04** — Une semaine va du **lundi au dimanche**, en heure de Paris. Une semaine sans Candidature apparaît avec une barre vide (0), pour que le rythme reste lisible.
- **BR-002-05** — Une Candidature sans date de candidature (données anciennes) n'apparaît pas dans les Candidatures par semaine ; elle compte dans les taux.

## 7. Critères d'acceptation

| ID | Étant donné | Quand | Alors |
|---|---|---|---|
| AC-002-01 | aucune Candidature | j'ouvre le tableau de bord | les deux taux affichent « — » et les 8 semaines sont à 0 |
| AC-002-02 | 20 Candidatures : 10 Postulée, 4 Entretien, 6 Refusée directement depuis Postulée | j'ouvre le tableau de bord | taux de réponse **50 %**, taux d'entretien **20 %** |
| AC-002-03 | 1 Candidature passée Postulée → Entretien → Refusée, 1 Postulée | j'ouvre le tableau de bord | taux de réponse **50 %**, taux d'entretien **50 %** |
| AC-002-04 | 3 Candidatures, 1 sur 3 en Entretien | j'ouvre le tableau de bord | taux d'entretien **33 %** |
| AC-002-05 | nous sommes le mercredi 2026-10-07 ; Candidatures datées du lundi 2026-10-05, du dimanche 2026-10-04 et du 2026-08-10 | j'ouvre le tableau de bord | la semaine du 5 oct. compte 1, celle du 28 sept. compte 1, la plus ancienne affichée est celle du 17 août ; la Candidature du 10 août n'apparaît pas |
| AC-002-06 | une Candidature d'un autre utilisateur | j'ouvre le tableau de bord | elle n'entre dans aucun chiffre |

## 8. Plan de test

| Niveau | Outil | Ce qui est testé | Critères couverts |
|---|---|---|---|
| Unitaire | Vitest | Calcul des taux (arrondi, total nul) ; découpage en semaines (lundi, heure de Paris, semaines vides) | AC-002-01 à 05 |
| Intégration | Vitest + PostgreSQL | Lecture des statistiques d'un utilisateur depuis la base, historique compris | AC-002-02, 03, 06 |
| Composant | Vitest + Testing Library | Affichage des taux et des barres, état vide | AC-002-01 |

Chaque test cite l'identifiant du critère qu'il couvre.
