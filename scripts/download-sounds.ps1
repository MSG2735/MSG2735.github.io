# Download win sound
$winUrl = "https://freesound.org/data/previews/276/276403_5324223-lq.mp3"
$winPath = "..\public\sounds\win-casino.mp3"
Invoke-WebRequest -Uri $winUrl -OutFile $winPath

# Download lose sound
$loseUrl = "https://freesound.org/data/previews/131/131660_2398403-lq.mp3"
$losePath = "..\public\sounds\lose-casino.mp3"
Invoke-WebRequest -Uri $loseUrl -OutFile $losePath

Write-Host "Sound files downloaded successfully!"