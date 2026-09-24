# Saisie manuelle des Annonces, pas de scraping

La description d'une Annonce est copiée-collée manuellement dans la Candidature ; l'application ne récupère jamais le contenu d'une Annonce à partir de son URL. Le scraping est fragile (pages dynamiques, structure qui change, contenu derrière authentification) et contraire aux conditions d'utilisation de plusieurs plateformes, notamment LinkedIn. L'URL est conservée uniquement comme référence.

## Consequences

- La description saisie est la source de vérité de l'Annonce : elle reste disponible même si la page d'origine disparaît.
- Les fonctionnalités IA (analyse d'Annonce, lettre, préparation d'entretien) travaillent sur ce texte saisi, jamais sur une page récupérée en ligne.
