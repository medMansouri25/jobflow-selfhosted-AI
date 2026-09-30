# Base de production sur la Raspberry Pi, sauvegardée sur le PC

La base PostgreSQL de production tourne sur la **Raspberry Pi**, dans un conteneur distinct de la base de développement, sur la **carte SD** (29 Go, pas de SSD pour l'instant). Les alternatives étaient un SSD USB (plus fiable, mais à acheter avant de commencer) et **Neon** (géré, mais les données quittent la maison et l'accès dépend d'un service tiers). L'utilisateur a choisi de démarrer tout de suite, sans achat, en compensant l'usure possible de la carte SD par une **sauvegarde `pg_dump` chaque nuit**, gardée environ 7 jours sur la Pi et **récupérée par le PC Windows dès qu'il est allumé** (via Tailscale). La production démarre **vide** : les données de test restent en développement.

## Consequences

- Une panne de la carte SD fait perdre au pire les saisies depuis la dernière récupération par le PC (un ou deux jours) ; la restauration doit être **testée**, pas seulement documentée.
- Base de développement et base de production sont séparées (conteneurs, volumes et identifiants distincts), même si elles partagent la Pi.
- À revoir si la carte SD montre des signes de faiblesse ou si la base grossit : passer à un SSD USB ne change que l'emplacement du volume ; une copie en ligne (Google Drive…) peut s'ajouter à la récupération par le PC.
- Tranche la question **Q6** du plan.
