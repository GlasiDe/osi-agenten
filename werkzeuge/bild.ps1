# Erzeugt ein Bild über ein lokales ComfyUI (Flux.2 Klein 9B, 4 Schritte). Optional – die fertigen Bilder liegen im Repo.
# Server: -Server oder $env:COMFYUI_URL (Standard http://localhost:8188).
# Beispiel:
#   .\bild.ps1 -Out ..\quellbilder\neu.png -W 1344 -H 768 -Prompt "$STIL Szene ..."
# Stil-Präfix (immer voranstellen, damit alle Bilder zusammenpassen):
#   Graphic novel noir illustration, bold black ink linework, heavy dramatic shadows, limited color palette of
#   deep teal and dark petrol blue with bright signal orange accents, subtle halftone texture, cinematic composition,
#   no text, no letters, no logos, no watermark.
# Danach mit Pillow als JPG (Qualität 82) nach spiel/img/ verkleinern.
param(
  [Parameter(Mandatory)][string]$Prompt,
  [Parameter(Mandatory)][string]$Out,
  [int]$W = 1344, [int]$H = 768, [long]$Seed = (Get-Random -Maximum 99999), [int]$Steps = 4,
  [string]$Server = $(if ($env:COMFYUI_URL) { $env:COMFYUI_URL } else { 'http://localhost:8188' })
)
$wf = @{
  "1"  = @{ class_type = "UNETLoader"; inputs = @{ unet_name = "flux-2-klein-9b-fp8mixed.safetensors"; weight_dtype = "default" } }
  "2"  = @{ class_type = "CLIPLoader"; inputs = @{ clip_name = "qwen_3_8b_fp8mixed.safetensors"; type = "flux2" } }
  "3"  = @{ class_type = "VAELoader"; inputs = @{ vae_name = "flux2-vae.safetensors" } }
  "4"  = @{ class_type = "CLIPTextEncode"; inputs = @{ text = $Prompt; clip = @("2", 0) } }
  "5"  = @{ class_type = "EmptyFlux2LatentImage"; inputs = @{ width = $W; height = $H; batch_size = 1 } }
  "6"  = @{ class_type = "Flux2Scheduler"; inputs = @{ steps = $Steps; width = $W; height = $H } }
  "7"  = @{ class_type = "KSamplerSelect"; inputs = @{ sampler_name = "euler" } }
  "8"  = @{ class_type = "RandomNoise"; inputs = @{ noise_seed = $Seed } }
  "9"  = @{ class_type = "BasicGuider"; inputs = @{ model = @("1", 0); conditioning = @("4", 0) } }
  "10" = @{ class_type = "SamplerCustomAdvanced"; inputs = @{ noise = @("8", 0); guider = @("9", 0); sampler = @("7", 0); sigmas = @("6", 0); latent_image = @("5", 0) } }
  "11" = @{ class_type = "VAEDecode"; inputs = @{ samples = @("10", 0); vae = @("3", 0) } }
  "12" = @{ class_type = "SaveImage"; inputs = @{ images = @("11", 0); filename_prefix = "osi_agenten" } }
}
# Achtung: PowerShell unterscheidet keine Groß-/Kleinschreibung – $hist statt $h (sonst wird -H überschrieben)
$resp = Invoke-RestMethod -Uri "$Server/prompt" -Method Post -Body (@{ prompt = $wf } | ConvertTo-Json -Depth 10) -ContentType "application/json"
$id = $resp.prompt_id
$deadline = (Get-Date).AddMinutes(10)
while ((Get-Date) -lt $deadline) {
  Start-Sleep -Seconds 2
  $hist = Invoke-RestMethod -Uri "$Server/history/$id"
  if ($hist.$id) {
    $img = $hist.$id.outputs."12".images[0]
    if (-not $img) { throw "Kein Bild: $($hist.$id.status | ConvertTo-Json -Depth 5)" }
    $u = "$Server/view?filename=$([uri]::EscapeDataString($img.filename))&subfolder=$([uri]::EscapeDataString($img.subfolder))&type=$($img.type)"
    New-Item -ItemType Directory -Force (Split-Path $Out) | Out-Null
    Invoke-WebRequest -Uri $u -OutFile $Out -UseBasicParsing
    "✅ $Out (Seed $Seed)"
    return
  }
}
throw "Zeitüberschreitung"
