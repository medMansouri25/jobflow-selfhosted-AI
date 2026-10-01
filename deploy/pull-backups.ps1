# Récupère sur le PC les sauvegardes de la Pi qu'il n'a pas encore (SPEC-010, FR-010-10).
# Lancé par une tâche planifiée Windows à l'ouverture de session et chaque jour ; passe par Tailscale (hôte « jobflow »).
$ErrorActionPreference = 'Stop'

$destination = Join-Path $env:USERPROFILE 'JobFlow\sauvegardes'
New-Item -ItemType Directory -Force $destination | Out-Null
$journal = Join-Path $destination 'recuperation.log'

try {
    $distantes = ssh -o BatchMode=yes -o ConnectTimeout=15 mohammed@jobflow 'ls -1 ~/jobflow-backups/*.dump 2>/dev/null'
    if ($LASTEXITCODE -ne 0) { throw "Pi injoignable (code $LASTEXITCODE)" }

    $copiees = 0
    foreach ($chemin in $distantes) {
        $nom = Split-Path $chemin -Leaf
        if (-not (Test-Path (Join-Path $destination $nom))) {
            scp -q -o BatchMode=yes "mohammed@jobflow:$chemin" (Join-Path $destination "$nom.partial")
            if ($LASTEXITCODE -ne 0) { throw "Échec de la copie de $nom" }
            Move-Item (Join-Path $destination "$nom.partial") (Join-Path $destination $nom)
            $copiees++
        }
    }
    Add-Content -Encoding UTF8 $journal "$(Get-Date -Format s) $copiees sauvegarde(s) récupérée(s)"
}
catch {
    Add-Content -Encoding UTF8 $journal "$(Get-Date -Format s) ERREUR : $_"
    exit 1
}
