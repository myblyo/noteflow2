# Build Android from C:\nf\noteflow2 (real short path — subst/N: breaks Expo autolinking).
# First time: npm run android:setup-win

$ErrorActionPreference = "Stop"
$Target = "C:\nf\noteflow2"
$GradleHome = "C:\gradle"

if (-not (Test-Path $Target)) {
  Write-Host "Short-path copy not found at $Target"
  Write-Host "Run first: npm run android:setup-win"
  exit 1
}

New-Item -ItemType Directory -Force -Path $GradleHome | Out-Null
$env:GRADLE_USER_HOME = $GradleHome

Set-Location $Target
Get-ChildItem -Path . -Recurse -Directory -Filter ".cxx" -ErrorAction SilentlyContinue |
  Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

$env:RCT_METRO_PORT = "8082"
npx expo run:android --port 8082
exit $LASTEXITCODE
