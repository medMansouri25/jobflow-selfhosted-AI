# Assistant IA : Google Gemini (offre gratuite), derrière un adaptateur

Les fonctionnalités IA commencent par la lettre de motivation personnalisée (SPEC-008). Le fournisseur retenu est **Google Gemini, offre gratuite d'AI Studio** : une clé d'API sans carte bancaire, un débit limité mais suffisant pour quelques lettres par jour, et une bonne qualité en français. Les abonnements de l'utilisateur (Claude Pro, Gemini Advanced, ChatGPT Plus) n'incluent pas l'accès à l'API ; les alternatives étaient une API payante à l'usage (Anthropic, OpenAI, Mistral payant) ou l'offre gratuite de Mistral (entreprise et serveurs européens, mais vérification par téléphone). L'utilisateur a choisi la gratuité et la simplicité, en connaissant la contrepartie : **sur une offre gratuite, le fournisseur peut utiliser les données envoyées pour améliorer ses modèles**.

## Consequences

- Tout appel passe par un adaptateur (`src/lib/ai.ts`, interface `TextGenerator`) : Gemini en production, un faux dans les tests, qui n'appellent jamais le service. Changer de fournisseur (Mistral, offre payante sans réutilisation des données) ne touche que cet adaptateur et la configuration.
- **Minimisation** : seuls l'Annonce et le Profil utiles à la rédaction partent chez Google ; l'e-mail et le téléphone n'en sortent jamais (JobFlow les ajoute à l'en-tête après la génération). Un rappel est affiché avant chaque génération.
- **Injection de prompt** : la description de l'Annonce est du texte externe ; elle est délimitée et présentée comme une donnée, jamais comme une consigne.
- **Hallucinations** : la consigne interdit d'inventer ce qui n'est pas dans le Profil ou l'Annonce ; la lettre reste un brouillon à relire.
- `GEMINI_API_KEY` est un secret (`.env`, jamais commité ni collé dans une conversation) ; `GEMINI_MODEL` permet de changer de modèle sans toucher au code. Sans clé, l'assistant est simplement indisponible.
- À revoir si le volume dépasse l'offre gratuite ou si la réutilisation des données devient gênante : passer à une offre payante ou à Mistral.
