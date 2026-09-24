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
| `src/modules/<fonctionnalité>/components/` | Composants propres à une fonctionnalité (`ApplicationForm`, `StatusBadge`, `StatusMenu`…) |
| `src/components/` | Composants partagés de l'application (ex. `AppHeader`, en-tête et navigation principale) |
| `src/app/**/page.tsx` | Assemblage de la page, sans logique métier |

## shadcn/ui

- Les composants sont **copiés** dans `src/components/ui/` via la CLI shadcn (`npx shadcn@latest add <composant>`, configuration dans `components.json`) : leur code appartient au projet et peut être modifié.
- Installés : Button, Input, Label, Textarea, Select, Badge, Dialog. La fusion des classes Tailwind passe par `cn` (`@/lib/utils`).
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
- Le menu de changement de statut n'affiche que les transitions renvoyées par la fonction du domaine `allowedTransitions` ; le serveur revérifie de toute façon.

## Affichage des contenus saisis

- Description d'Annonce, notes, lettre : rendues en **texte brut** (retours à la ligne conservés via CSS `white-space: pre-wrap`). Jamais de `dangerouslySetInnerHTML`, jamais d'interprétation Markdown.
- Liens externes : `target="_blank"` avec `rel="noopener noreferrer"`.

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

## Style

- Tailwind CSS, avec les variables de thème de shadcn/ui définies dans `src/app/globals.css` (clair et sombre, en `oklch`).
- **Palette** : fond gris bleuté très clair, cartes blanches, **indigo** comme couleur d'action (`--primary`, `--ring`). Choisie par défaut faute de proposition de design ; la changer = modifier les variables, pas les composants.
- **Couleurs de statut** : `--status-draft` (gris), `--status-applied` (bleu), `--status-interview` (ambre), `--status-accepted` (vert), `--status-rejected` (rouge), `--status-archived` (gris neutre), exposées en classes Tailwind (`bg-status-applied/12`, `text-status-applied`). Seul `StatusBadge` les utilise pour les badges.
- Mise en page : contenu centré (`max-w-5xl`, formulaires `max-w-3xl`), sections en cartes (`rounded-xl border bg-card`), en-tête collant.

## Formulaire de candidature

- `ApplicationForm` reçoit sa Server Action en prop (`action`) : la page lui passe `createApplicationAction`, les tests une fonction factice.
- Découpé en sections (statut initial, poste, Annonce, rémunération, suivi) ; un composant `Field` relie libellé, aide et erreur (`aria-describedby`, `aria-invalid`).
- Les listes (contrat, source, période) utilisent le `Select` shadcn (Radix) avec `name`, soumis nativement avec le formulaire ; un `key` dérivé de la valeur renvoyée le réinitialise après une erreur.
