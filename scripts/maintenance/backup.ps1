# GHR Ruleta Royale - Script de Backup Robustez
# Ejecutar: .\backup.ps1

$ErrorActionPreference = "Stop"

$projectName = "ghr-ruleta-royale"
$backupRoot = "C:\Backups"
$backupDir = "$backupRoot\$projectName"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipName = "$projectName-$timestamp.zip"
$zipPath = "$backupDir\$zipName"

# 1. Crear directorio si no existe
if (-not (Test-Path -Path $backupDir)) {
    Write-Host "Creando directorio: $backupDir"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
}

# 2. Definir fuente y exclusiones
$sourceDir = Get-Location
$tempWorkDir = Join-Path $env:TEMP "$projectName-temp-$timestamp"

Write-Host "Iniciando respaldo de: $sourceDir"
Write-Host "Destino: $zipPath"

# 3. Copiar a temporal (para evitar problemas de bloqueo de archivos)
New-Item -ItemType Directory -Path $tempWorkDir -Force | Out-Null

$exclude = @('node_modules', 'dist', '.git', '.venv', 'temp_preview', 'temp_today', 'backup.ps1')

Get-ChildItem -Path $sourceDir -Exclude $exclude | ForEach-Object {
    $target = Join-Path $tempWorkDir $_.Name
    if ($_.PSIsContainer) {
        Copy-Item -Path $_.FullName -Destination $target -Recurse -Force
    } else {
        Copy-Item -Path $_.FullName -Destination $target -Force
    }
}

# 4. Comprimir desde temporal
Write-Host "Comprimiendo archivos..."
Compress-Archive -Path "$tempWorkDir\*" -DestinationPath $zipPath -Force

# 5. Limpieza
Remove-Item -Path $tempWorkDir -Recurse -Force
Write-Host "Limpieza completada."

# 6. Verificación
if (Test-Path $zipPath) {
    $size = (Get-Item $zipPath).Length / 1MB
    Write-Host "✅ BACKUP EXITOSO: $zipPath ($([math]::Round($size, 2)) MB)"
} else {
    Write-Error "❌ FALLO: El archivo zip no se creó."
}
