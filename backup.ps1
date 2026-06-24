# GHR Ruleta Royale - Script de Backup
# Ejecutar: .\backup.ps1

$projectName = "ghr-ruleta-royale"
$backupDir = "C:\Backups\$projectName"
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$zipName = "$projectName-$timestamp.zip"

# Crear directorio de backups si no existe
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force
    Write-Host "📁 Directorio de backups creado: $backupDir"
}

# Crear backup excluyendo node_modules y dist
Write-Host "🔄 Creando backup..."
$excludePatterns = @("node_modules", "dist", ".git")

# Usar git archive si hay git disponible
try {
    git archive --format=zip --output="$backupDir\$zipName" HEAD
    Write-Host "✅ Backup creado con git archive: $backupDir\$zipName"
} catch {
    # Fallback a compresión manual
    $tempDir = "$env:TEMP\$projectName-backup-$timestamp"
    Copy-Item -Path "." -Destination $tempDir -Recurse -Exclude $excludePatterns
    Compress-Archive -Path "$tempDir\*" -DestinationPath "$backupDir\$zipName" -Force
    Remove-Item -Path $tempDir -Recurse -Force
    Write-Host "✅ Backup creado: $backupDir\$zipName"
}

# Mostrar estadísticas
$backupSize = (Get-Item "$backupDir\$zipName").Length / 1MB
Write-Host "📊 Tamaño del backup: $([math]::Round($backupSize, 2)) MB"

# Limpiar backups antiguos (mantener últimos 10)
$backups = Get-ChildItem -Path $backupDir -Filter "*.zip" | Sort-Object LastWriteTime -Descending
if ($backups.Count -gt 10) {
    $backups | Select-Object -Skip 10 | Remove-Item -Force
    Write-Host "🧹 Backups antiguos limpiados (manteniendo últimos 10)"
}

Write-Host "`n🎰 Backup de GHR Ruleta Royale completado!"
