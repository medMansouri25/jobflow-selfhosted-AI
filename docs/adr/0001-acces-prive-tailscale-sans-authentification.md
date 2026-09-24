# Accès privé via Tailscale, sans authentification applicative

JobFlow AI est un outil single-user hébergé sur une Raspberry Pi à domicile. Plutôt que d'exposer l'application sur Internet et de lui ajouter un système de login, elle n'est joignable que depuis mon réseau Tailscale : c'est Tailscale (authentification des appareils, chiffrement WireGuard) qui constitue la barrière d'accès. Aucune page de connexion n'existe donc dans l'application, et c'est voulu.

## Considered Options

- **Exposition publique + authentification applicative (Auth.js)** — rejetée pour le MVP : surface d'attaque publique et code d'authentification à maintenir pour un seul utilisateur.
- **Exposition publique + `basic_auth` Caddy** — rejetée : protection faible et toujours exposée à Internet.

## Consequences

- Les entités principales portent malgré tout un `userId`, pour qu'une authentification applicative (et le multi-user) puisse être ajoutée sans refonte.
- Si l'application devait un jour être exposée publiquement, cet ADR doit être remplacé **avant** l'exposition : l'absence de login n'est sûre qu'à l'intérieur du tailnet.
- Le HTTPS est assuré par Caddy avec un certificat pour le nom `*.ts.net`.
