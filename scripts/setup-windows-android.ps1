# One-time Windows setup: short Gradle cache + optional project copy to C:\nf
# Run in PowerShell: powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows-android.ps1

$ErrorActionPreference = "Stop"
$Source = Split-Path $PSScriptRoot -Parent
$Target = "C:\nf\noteflow2"
$GradleHome = "C:\gradle"

New-Item -ItemType Directory -Force -Path $GradleHome | Out-Null
[Environment]::SetEnvironmentVariable("GRADLE_USER_HOME", $GradleHome, "User")
Write-Host "Set GRADLE_USER_HOME=$GradleHome (User env). Restart terminals after this."

if (-not (Test-Path $Target)) {
  Write-Host "Copying project to $Target (excluding node_modules, build caches)..."
  New-Item -ItemType Directory -Force -Path "C:\nf" | Out-Null
  robocopy $Source $Target /E /XD node_modules android\.cxx android\build android\app\build .next noteflow-api\node_modules server\node_modules /NFL /NDL /NJH /NJS /nc /ns /np
  if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }
  if (Test-Path "$Source\.env.local") {
    Copy-Item "$Source\.env.local" "$Target\.env.local" -Force
  }
  Write-Host "Copied to $Target"
  Write-Host "Installing dependencies..."
  Set-Location $Target
  npm install
  npm install --prefix noteflow-api
  Write-Host ""
  Write-Host "Done. Build with:"
  Write-Host "  cd $Target"
  Write-Host "  npm run android"
  Write-Host "Or from anywhere: npm run android:win"
} else {
  Write-Host "Already exists: $Target"
  Write-Host "Build with: npm run android:win"
}
