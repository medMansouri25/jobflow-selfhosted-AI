# Monolithe modulaire, ni serverless ni microservices

JobFlow AI est une seule application Next.js, déployée comme un seul conteneur sur la Raspberry Pi, avec une seule base PostgreSQL. À l'intérieur, le code est découpé par fonctionnalité (`src/modules/applications`, `src/modules/companies`, puis `interviews`…), chaque module exposant une interface étroite aux autres. Les architectures serverless et microservices répondent à des problèmes que ce projet n'a pas — montée en charge, plusieurs équipes livrant indépendamment — et en ajouteraient de réels : ce projet a un seul développeur, un seul utilisateur et un serveur de 4 Go de RAM.

## Considered Options

- **Serverless (AWS Lambda, Vercel Functions, Cloudflare Workers)** — rejeté. Incompatible avec l'auto-hébergement sur la Pi (ADR `0001`) ; l'installer soi-même (OpenFaaS, Knative) exigerait Kubernetes. Ses avantages (absorber des pics, ne rien payer à l'arrêt, pas de serveur à gérer) sont sans objet ici ; ses coûts (démarrages à froid, gestion des connexions à la base, dépendance au fournisseur) sont réels.
- **Microservices** — rejeté. Les invariants de la spec 001 (un changement de statut et sa ligne d'historique, ensemble ou pas du tout) deviendraient des transactions distribuées ; chaque écran demanderait plusieurs appels réseau ; chaque service coûterait une image, un déploiement, de la mémoire (100 à 200 Mo par service Node) et de l'observabilité distribuée. Principe retenu : *Monolith First* — on ne découpe pas un système avant d'en connaître les vraies frontières.

## Consequences

- Les modules ne partagent pas leurs tables librement : un module passe par l'interface (service) d'un autre plutôt que par ses données, pour qu'une extraction future reste possible.
- Extraire un module en service séparé exigera un nouvel ADR, justifié par un besoin mesuré. Le candidat le plus probable est un **worker IA** (appels longs, file d'attente, éventuellement Python), ajouté comme conteneur à côté du monolithe — pas une migration vers les microservices.
- Kubernetes, le serverless ou un découpage en services peuvent être pratiqués comme exercices d'apprentissage séparés, jamais au détriment de la simplicité du produit.
