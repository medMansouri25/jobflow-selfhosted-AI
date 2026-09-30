# Frontend patterns

Conventions de l'interface. L'interface est en français ; le code en anglais.

## Server Components par défaut

- Les pages et composants sont des **Server Components** par défaut : ils lisent les données via les services (voir `backend-patterns.md`).
- `'use client'` uniquement pour ce qui a besoin d'interactivité : formulaires avec état, menus, modales, autocomplétion.
- Un composant client reçoit ses données en props depuis un Server Component ; il n'importe jamais Prisma ni un service.

## Où ranger les composants

| Emplacement | Contenu |
|---|---|
| `src/components/ui/` | Composants shadcn/ui (Button, Input, Label, Select, Dialog, Badge, Command…), ajoutés au fil des besoins |
| `src/modules/<fonctionnalité>/components/` | Composants propres à une fonctionnalité (`ApplicationForm`, `StatusBadge`, `StatusPanel`…) |
| `src/components/` | Composants partagés de l'application (ex. `AppHeader`, en-tête et navigation principale) |
| `src/app/**/page.tsx` | Assemblage de la page, sans logique métier |

- Ligne de tableau cliquable : `RowLink` (`src/components/`) dans la première cellule, `<tr className="relative …">` ; son `after:absolute after:inset-0` étend la zone du lien à toute la ligne (clic, clavier, clic molette, focus visible). Jamais de `onClick` sur `<tr>`.

## shadcn/ui

- Les composants sont **copiés** dans `src/components/ui/` via la CLI shadcn (`npx shadcn@latest add <composant>`, configuration dans `components.json`) : leur code appartient au projet et peut être modifié.
- Installés : Button, Input, Label, Textarea, Select, Badge, Dialog, AlertDialog. La fusion des classes Tailwind passe par `cn` (`@/lib/utils`).
- On n'ajoute un composant que lorsqu'une fonctionnalité en a besoin.
- Le composant `Form` de shadcn/ui **n'est pas utilisé** (il dépend de react-hook-form) ; les formulaires utilisent Input, Label, Select, Textarea… directement.
- Accessibilité : on s'appuie sur Radix UI (focus, clavier, ARIA) plutôt que de réécrire modales, menus et listes déroulantes.

## Formulaires

Formulaires natifs + Server Actions + `useActionState` :

```tsx
'use client'
const [state, formAction, pending] = useActionState(createApplicationAction, initialState)

<form action={formAction}>
  <Input name="jobTitle" required maxLength={200} defaultValue={state.values?.jobTitle} />
  {state.fieldErrors?.jobTitle && <p role="alert">{state.fieldErrors.jobTitle}</p>}
  <Button type="submit" disabled={pending}>Enregistrer</Button>
</form>
```

- **La validation qui fait foi est côté serveur** (Zod, dans l'action). Côté navigateur : seulement les attributs HTML (`required`, `maxLength`, `type="url"`, `type="date"`) pour un retour immédiat.
- L'état renvoyé par l'action contient les erreurs par champ, un éventuel message métier, et les **valeurs saisies** pour ne jamais perdre la saisie.
- Le bouton d'envoi est désactivé pendant l'envoi (`pending`) : pas de double soumission.
- react-hook-form ne sera introduit que pour un formulaire réellement complexe (listes dynamiques, ex. Profil — SPEC-006), avec justification.

## Statuts

- Les codes (`APPLIED`) ne sont jamais affichés : un dictionnaire unique fait correspondre code → libellé français (« Postulée ») → style de badge.
- Le bloc « Statut » de la fiche (`StatusPanel`, client) affiche **un bouton par transition** de `allowedTransitions` (libellés `TRANSITION_LABELS`, ex. « Passer en Entretien ») ; le serveur revérifie de toute façon. Une transition vers un Statut définitif demande d'abord une confirmation (`AlertDialog`) ; chaque bouton envoie `to` en champ caché à `changeStatusAction`. Un Statut définitif affiche « Statut définitif : cette candidature ne change plus de statut. »

## Affichage des contenus saisis

- Description d'Annonce, notes, lettre : rendues en **texte brut** (retours à la ligne conservés via CSS `white-space: pre-wrap`). Jamais de `dangerouslySetInnerHTML`, jamais d'interprétation Markdown.
- Liens externes : `target="_blank"` avec `rel="noopener noreferrer"`.
- Champ facultatif non renseigné : affiché « — » (listes et fiche), jamais vide ni « null ».
- Dates : une date sans heure (date de candidature) est formatée avec `timeZone: "UTC"` pour ne pas glisser d'un jour ; un instant (historique des statuts) est formaté dans le fuseau `Europe/Paris` (« 27 sept. 2026 · 16:21 »).

## États de page

| État | Traitement |
|---|---|
| Chargement | `loading.tsx` de la route si l'attente est perceptible |
| Liste vide | Message et appel à l'action (« Créer ma première candidature ») |
| Ressource introuvable | `notFound()` → `src/app/not-found.tsx` (lien de retour à l'accueil) |
| Erreur inattendue | `src/app/error.tsx` : message générique, **jamais le détail technique**, bouton « Réessayer » qui appelle `retry()` (Next.js 16 ; anciennement `reset`) |

## Tests de composants

- Fichiers `*.test.tsx` à côté du composant, exécutés par le projet Vitest `component` (jsdom).
- Testing Library : on cherche les éléments comme un utilisateur les perçoit (`getByRole`, `getByLabelText`), jamais par classe CSS ou structure interne.

## Structure de l'écran

- **Référence visuelle** : la maquette `JobFlow AI.html` (fichier local, non versionné).
- `AppSidebar` (menu latéral, `src/components/`) : logo, Dashboard et Candidatures actifs (`aria-current="page"` sur la page courante), puis les fonctionnalités à venir **affichées sans lien** avec leur phase (`P3`, `P4`…), et le pied « Mon espace · Privé · Tailscale ».
- `AppTopbar` (barre du haut) : section courante, date du jour calculée **dans le navigateur** (`useSyncExternalStore` : les pages sont pré-rendues au build), recherche (`GET /applications?q=`), bouton « Nouvelle candidature ».
- La création d'une candidature se fait dans une **fenêtre modale** (`NewApplicationDialog`, Dialog shadcn), disponible sur toutes les pages ; `/applications/new` reste accessible par URL.

## Style

- Tailwind CSS, avec les variables de thème de shadcn/ui définies dans `src/app/globals.css` (clair et sombre).
- **Palette de la maquette** : fond `#f5f7fa`, surfaces blanches, texte `#0f172a`, **bleu `#2563eb`** pour l'action (`--primary`, `--ring`), **vert `#16a34a`** en second accent (`--success`), bordures `#dde3ea`. Changer de palette = modifier les variables, pas les composants.
- **Police** : Archivo (`next/font/google`, variable `--font-archivo`) ; titres en graisse 800 (`font-heading font-extrabold`).
- **Couleurs de statut** : pour chaque statut, une couleur pleine (`--status-applied`, barres et pastilles), un fond et un texte de badge (`--status-applied-bg`, `--status-applied-fg`), exposés en classes Tailwind (`bg-status-applied-bg`, `text-status-applied-fg`). La couleur pleine est exposée par `STATUS_DOT_CLASSES` (`status-badge.tsx`), source unique pour barres, pastilles et points de l'historique.
- Rayons : 8 px par défaut (`--radius`), badges en pilule.

## Formulaire de candidature

- `ApplicationForm` reçoit sa Server Action en prop (`action`) et, dans la modale, un `onCancel` ; sans `onCancel`, « Annuler » ramène à la liste.
- **Un seul bouton « Enregistrer »**, sans statut : toute Candidature est créée Postulée côté serveur (ADR 0005). Marque de champ : `*` obligatoire (BR-001-02).
- La date de candidature vaut par défaut la date du jour, **lue dans le navigateur** (`useSyncExternalStore`, instantané serveur `undefined`) : `/applications/new` est pré-rendue au build, une date calculée au rendu y serait figée.
- Pièces jointes : deux `Input type="file"` (`name="cv"`, `name="coverLetter"`, `accept="application/pdf"`) dans le même formulaire, envoyés avec la Server Action. Un fichier choisi ne peut pas être ré-affiché après une erreur (le navigateur l'interdit) : seule la saisie texte est conservée.
- `ApplicationFormDialog` (générique) enveloppe l'action (`saveAndClose`) : la fenêtre se ferme quand l'action renvoie `status: "success"`, et reste ouverte avec la saisie en cas d'erreur **ou d'avertissement** (`status: "warning"` : enregistré, mais le message demande une action). `NewApplicationDialog` (barre du haut) et `EditApplicationDialog` (bouton « Modifier » de la fiche, « Modifier — <Entreprise> ») l'utilisent.
- Modification : `ApplicationForm` reçoit `initialValues` (`toFormValues(application)`, dates en AAAA-MM-JJ) et `attachments` (fichiers actuels) ; chaque pièce jointe enregistrée s'affiche avec une case « Retirer … » (`removeCv`, `removeCoverLetter`) et un champ « Remplacer … par… ». L'action de modification est liée à l'id par la page (`updateApplicationAction.bind(null, id)`).
- La fiche (`ApplicationDetail`) reçoit ses boutons par un emplacement `actions` et son bloc « Statut » par un emplacement `statusPanel` (`<StatusPanel action={changeStatusAction.bind(null, id)} />`), fournis par la page : le composant reste sans dépendance aux actions serveur.
- Composants partagés du module : `FormStateMessage` (message renvoyé par une action : `role="alert"` pour une erreur, `role="status"` pour un avertissement ou un succès, couleurs de statut), utilisé par `ApplicationForm` et `StatusPanel` ; `Section` (carte titrée, `<section aria-labelledby>`) pour les blocs de la fiche.
- Un composant `Field` relie libellé, aide et erreur (`aria-describedby`, `aria-invalid`) ; `SelectField` enveloppe le `Select` shadcn (Radix) avec `name`, soumis nativement, et un `key` dérivé de la valeur renvoyée pour le réinitialiser après une erreur.
