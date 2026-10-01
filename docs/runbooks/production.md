# Installer la production sur la Pi

Installation de JobFlow en production (SPEC-010). À faire une fois, après la préparation de la Pi (`pi-setup.md`). Les mises à jour se font ensuite avec `./deploy.sh` (tâche `deploy`).

## Ce qui tourne

| Conteneur | Rôle | Réseau |
|---|---|---|
| `jobflow-prod-app-1` | l'application (image `ghcr.io/medmansouri25/jobflow-selfhosted-ai`) | `127.0.0.1:3000` seulement |
| `jobflow-prod-db-1` | PostgreSQL de production, volume `jobflow-prod_db-data` | aucun port publié |

`tailscale serve` publie `127.0.0.1:3000` en HTTPS sur le tailnet : `https://jobflow.<tailnet>.ts.net`. Depuis le Wi-Fi de la maison, `192.168.1.65:3000` ne répond pas : c'est voulu (ADR 0001).

La base de développement (`~/jobflow-db`, `jobflow_dev` / `jobflow_test`) est un autre conteneur, avec un autre volume : la production démarre vide (ADR 0007).

## 1. Fichiers

Sur la Pi, dans `~/jobflow-prod/` :

- `docker-compose.yml` : copie de [`deploy/docker-compose.prod.yml`](../../deploy/docker-compose.prod.yml) ;
- `.env` : à partir de [`deploy/.env.example`](../../deploy/.env.example), droits `600` (`chmod 600 .env`). `POSTGRES_PASSWORD` est généré par `openssl rand -hex 24` ; `UPLOADTHING_TOKEN` est celui du `.env` de développement (même app, BR-010-04).

## 2. Démarrer

```bash
cd ~/jobflow-prod
docker compose up -d
docker compose ps        # app et db « healthy »
curl http://127.0.0.1:3000/api/health
```

Au premier démarrage, l'application applique les migrations et crée l'utilisateur unique. Les deux conteneurs redémarrent seuls après une coupure de courant (`restart: unless-stopped`).

## 3. HTTPS par Tailscale

Prérequis : console Tailscale → **DNS** → **HTTPS Certificates** activé.

Sur la Pi (mot de passe `sudo`, lancé par l'utilisateur) :

```bash
sudo tailscale serve --bg 3000
tailscale serve status
```

L'adresse affichée (`https://jobflow.<tailnet>.ts.net`) s'ouvre depuis le PC et le téléphone connectés à Tailscale. La configuration survit aux redémarrages ; pour l'enlever : `sudo tailscale serve reset`.

## Vérifications

| Vérification | Attendu |
|---|---|
| `https://jobflow.<tailnet>.ts.net` depuis le téléphone en 4G (Tailscale actif) | le tableau de bord, cadenas valide (AC-010-02) |
| `curl -m 5 http://192.168.1.65:3000` depuis le PC | aucune réponse (AC-010-03) |
| liste des Candidatures juste après l'installation | vide (AC-010-04) |
