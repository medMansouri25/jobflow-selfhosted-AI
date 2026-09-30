# Préparer la Raspberry Pi

Procédure pour qu'une Raspberry Pi puisse héberger JobFlow (SPEC-010, FR-010-12). Faite une première fois le 2026-09-30 ; à rejouer sur une Pi neuve ou après réinstallation.

Les commandes `sudo` demandent le mot de passe de la Pi : **c'est toi qui les lances**, jamais un script ou un assistant.

## Ce qu'on a

| | |
|---|---|
| Matériel | Raspberry Pi 4, 4 Go de RAM, carte SD de 29 Go (pas de SSD, ADR 0007) |
| Système | Ubuntu 24.04 LTS arm64 — **ne pas** lancer `do-release-upgrade` |
| Docker | paquets Ubuntu `docker.io` 29 + `docker-compose-v2` 2.24 (sans BuildKit) |
| Utilisateur | `mohammed`, connexion SSH par clé depuis le PC |
| Réseau local | `192.168.1.65` (Wi-Fi `wlan0`) |
| Tailscale | nom `jobflow`, `100.76.35.34` |

## 1. Accès SSH par clé (depuis le PC)

Sur le PC, dans PowerShell :

```powershell
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh mohammed@192.168.1.65 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

Vérification : `ssh mohammed@192.168.1.65 hostname` répond sans demander de mot de passe.

## 2. Docker

Sur la Pi, avec les paquets d'Ubuntu :

```bash
sudo apt update && sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker mohammed
```

Se déconnecter puis se reconnecter, puis vérifier : `docker run --rm hello-world` et `docker compose version`.

Sans le paquet `docker-buildx`, `docker build` utilise l'ancien constructeur : le `Dockerfile` du projet n'emploie donc aucune syntaxe réservée à BuildKit. En production, la Pi ne construit rien : elle télécharge l'image publiée par la CI.

## 3. Tailscale

1. Créer le compte sur <https://login.tailscale.com> (connexion GitHub).
2. **PC** : installer Tailscale pour Windows, « Sign in to your network » avec le même compte.
3. **Pi** :
   ```bash
   curl -fsSL https://tailscale.com/install.sh | sh
   sudo tailscale up --hostname=jobflow
   ```
   Ouvrir le lien affiché, cliquer « Connect ». Le terminal affiche `Success.`
4. **Téléphone (iPhone)** : appli **Tailscale** sur l'App Store, « Sign in with GitHub », accepter la configuration VPN, interrupteur sur **Connected** : `jobflow` et le PC apparaissent dans la liste.
5. **HTTPS** : dans la console Tailscale, onglet **DNS**, vérifier que **MagicDNS** est actif et activer **HTTPS Certificates**. Sans cela, l'adresse `https://jobflow.<tailnet>.ts.net` n'a pas de certificat.

Le nom `jobflow` donne l'adresse de l'application : `https://jobflow.<tailnet>.ts.net`.

## 4. Vérifications

Depuis le PC :

```bash
tailscale status              # la Pi « jobflow » et le PC apparaissent
tailscale ping jobflow        # « pong from jobflow »
ssh mohammed@jobflow hostname # SSH par le nom Tailscale : marche aussi hors de la maison
```

Dans la console Tailscale (onglet Machines), chaque appareil est « Connected ».

## Terminal sur le téléphone (facultatif)

Pour lire les journaux de la Pi depuis l'iPhone : une appli SSH (Termius, par exemple), hôte `jobflow`, utilisateur `mohammed`, mot de passe de la Pi. Tailscale doit être actif sur l'iPhone. Avec l'adresse locale `192.168.1.65` (Wi-Fi de la maison seulement), iOS doit autoriser l'appli dans **Réglages → Confidentialité et sécurité → Réseau local**, sinon la connexion échoue sans jamais atteindre la Pi.

Commandes de lecture utiles : `docker ps`, `docker logs -f <conteneur>`. Éviter `sudo` depuis le téléphone.

## En cas de problème

| Symptôme | Cause probable | Remède |
|---|---|---|
| `tailscale status` : `Logged out` | le lien de connexion n'a pas été validé | relancer `sudo tailscale up --hostname=jobflow` et ouvrir le lien |
| `ssh mohammed@jobflow` : `Host key verification failed` | premier accès par ce nom | `ssh mohammed@jobflow` une fois en interactif et accepter l'empreinte |
| `permission denied … docker.sock` | groupe `docker` pas encore pris en compte | se déconnecter / reconnecter |
| L'appli SSH du téléphone : « échec de l'ouverture de la session » | téléphone hors du tailnet, ou accès « Réseau local » refusé par iOS | activer Tailscale sur le téléphone, ou autoriser l'appli dans Réglages → Réseau local |
