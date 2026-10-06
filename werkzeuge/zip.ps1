# Baut das Schüler-Paket verteilen/OSI-Agenten_v<version>.zip (Spiel + Kurzanleitung).
# Ältere ZIPs im Ordner verteilen werden entfernt, damit nie eine veraltete Version verteilt wird.
$ErrorActionPreference = 'Stop'
$root = Split-Path $PSScriptRoot -Parent
$meta = Get-Content "$root\spiel\content\meta.js" -Raw
if ($meta -notmatch "version:\s*'([^']+)'") { throw 'Version in meta.js nicht gefunden' }
$version = $Matches[1]
$dist = "$root\verteilen"
$stage = Join-Path ([IO.Path]::GetTempPath()) 'osi_stage'
Remove-Item -Recurse -Force $stage -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Force "$stage\OSI-Agenten", $dist | Out-Null
Copy-Item -Recurse "$root\spiel" "$stage\OSI-Agenten\spiel"
Copy-Item "$root\lehrkraft\Kurzanleitung_SuS.pdf" "$stage\OSI-Agenten\Kurzanleitung.pdf"
Get-ChildItem $dist -Filter *.zip | Remove-Item
$zip = "$dist\OSI-Agenten_v$version.zip"
Compress-Archive -Path "$stage\OSI-Agenten" -DestinationPath $zip -Force
Remove-Item -Recurse -Force $stage
"✅ $zip ({0:N0} KB)" -f ((Get-Item $zip).Length / 1KB)
