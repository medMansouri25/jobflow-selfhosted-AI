# Task: Alertes et durcissement (T10.2, T10.4)

**Status**: Completed
**Type**: Infra + configuration
**Created**: 2026-10-01

## Problem
Une panne, une sauvegarde ratée ou une carte SD pleine passeraient inaperçues ; les dépendances vieillissent sans qu'on voie leurs failles (SPEC-012).

## Outcome
Alertes ntfy sur l'iPhone (Pi : watchdog, sauvegarde, disque ; PC : récupération), journaux Docker limités, en-têtes de sécurité, `npm audit` en CI, Dependabot mensuel regroupé.

## Constraints / Notes
- Décisions du 2026-10-01 : ntfy (pas Prometheus / Grafana), Dependabot une fois par mois en une PR.
- Envoi ntfy en JSON (les en-têtes HTTP n'acceptent pas les accents) ; sans canal ou sans réseau, l'alerte est journalisée et le script continue.
- Watchdog : alerte après 2 échecs de suite, une seule fois, puis au retour (un `./deploy.sh` ne déclenche rien).
- CSP : `'unsafe-inline'` nécessaire à Next.js sans nonce ; `'unsafe-eval'` et `ws:` en développement seulement ; `X-Powered-By` retiré.
- `npm audit` trouvait 4 failles hautes, toutes dans l'outil Prisma (`mysql2`, `deepmerge-ts`, inutilisés à l'exécution) → `overrides` vers les versions corrigées, aussi appliqués à l'étape `migrate` du Dockerfile ; 0 faille.
- Canal ntfy créé sur la Pi et le PC le 2026-10-01 (nom dans `~/jobflow-prod/.env` et `%USERPROFILE%\JobFlow\ntfy-topic.txt`, jamais dans le dépôt).
- Vérifié : en-têtes présents en production locale, aucune erreur de console sur toutes les pages ni sur une action serveur ; sur la Pi, test, panne / reprise et sauvegarde ratée reçus sur ntfy ; correction du fichier partiel laissé par une sauvegarde ratée.

## Missions
- [x] Mission 1: `notify.sh`, `watchdog.sh`, `daily-check.sh`, alerte de `backup.sh`, alerte du PC ; journaux Docker limités ; procédure `docs/runbooks/alerts.md` ; installation et essais sur la Pi
- [x] Mission 2: En-têtes de sécurité (`security-headers.ts` + tests) ; vérification en production locale
- [x] Mission 3: `npm audit` en CI, `overrides` corrigeant Prisma (+ Dockerfile), Dependabot
