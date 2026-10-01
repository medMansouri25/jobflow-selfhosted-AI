# Récupère sur le PC les sauvegardes de la Pi qu'il n'a pas encore (SPEC-010, FR-010-10).
# Lancé par une tâche planifiée Windows à l'ouverture de session et chaque jour ; passe par Tailscale (hôte « jobflow »).
$ErrorActionPreference = 'Stop'

$destination = Join-Path $env:USERPROFILE 'JobFlow\sauvegardes'
New-Item -ItemType Directory -Force $destination | Out-Null
$journal = Join-Path $destination 'recuperation.log'

try {
    $distantes = ssh -o BatchMode=yes -o ConnectTimeout=15 mohammed@jobflow 'ls -1 ~/jobflow-backups/*.dump 2>/dev/null || true'
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
    # Alerte sur le téléphone (SPEC-012, FR-012-04) si le canal ntfy est configuré ; jamais de donnée personnelle.
    $canal = Join-Path $env:USERPROFILE 'JobFlow\ntfy-topic.txt'
    if (Test-Path $canal) {
        $alerte = @{
            topic    = (Get-Content $canal -TotalCount 1).Trim()
            title    = 'Sauvegardes JobFlow non récupérées'
            message  = "Le PC n'a pas pu récupérer les sauvegardes de la Pi : $_"
            priority = 4
            tags     = @('warning')
        } | ConvertTo-Json -Compress
        try {
            Invoke-RestMethod -Method Post -Uri 'https://ntfy.sh' -ContentType 'application/json; charset=utf-8' `
                -Body ([Text.Encoding]::UTF8.GetBytes($alerte)) -TimeoutSec 15 | Out-Null
        }
        catch {
            Add-Content -Encoding UTF8 $journal "$(Get-Date -Format s) envoi de l'alerte impossible"
        }
    }
    exit 1
}
