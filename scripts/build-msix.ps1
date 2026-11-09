# Automated MSIX Packaging Script for VoiceFlow (Microsoft Store)
param (
    [string]$Version = "0.2.4.0"
)

$ErrorActionPreference = "Stop"
$rootDir = (Get-Item -Path $PSScriptRoot).Parent.FullName
$stagingDir = Join-Path $rootDir "release\msix-staging"
$outputFile = Join-Path $rootDir "release\VoiceFlow_$($Version)_x64.msix"
$makeAppx = "C:\Program Files (x86)\Windows Kits\10\bin\10.0.26100.0\x64\makeappx.exe"

Write-Host "`n🚀 [VoiceFlow] Packaging MSIX for Microsoft Store..." -ForegroundColor Cyan

# 1. Prepare clean staging directories
if (Test-Path $stagingDir) { Remove-Item -Recurse -Force $stagingDir }
New-Item -ItemType Directory -Force -Path "$stagingDir\Assets" | Out-Null
New-Item -ItemType Directory -Force -Path "$stagingDir\resources" | Out-Null

# 2. Copy binaries and assets
Write-Host "📦 Copying binaries, runtime resources, and Store assets..."
Copy-Item (Join-Path $rootDir "apps\desktop\src-tauri\target\release\desktop.exe") "$stagingDir\VoiceFlow.exe" -Force
Copy-Item (Join-Path $rootDir "apps\desktop\src-tauri\target\release\resources\*") "$stagingDir\resources\" -Recurse -Force
Copy-Item (Join-Path $rootDir "apps\desktop\src-tauri\icons\*.png") "$stagingDir\Assets\" -Force

# 3. Generate AppxManifest.xml
$manifest = @"
<?xml version="1.0" encoding="utf-8"?>
<Package xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
         xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
         xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities">
  <Identity Name="Utpall.VoiceFlowDesktop"
            Publisher="CN=3C90FDD1-84CC-405D-8308-E0EDB353C527"
            Version="$Version"
            ProcessorArchitecture="x64" />
  <Properties>
    <DisplayName>VoiceFlow Desktop</DisplayName>
    <PublisherDisplayName>Utpall</PublisherDisplayName>
    <Logo>Assets\StoreLogo.png</Logo>
  </Properties>
  <Resources>
    <Resource Language="en-us" />
  </Resources>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.26100.0" />
  </Dependencies>
  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>
  <Applications>
    <Application Id="App" Executable="VoiceFlow.exe" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements DisplayName="VoiceFlow Desktop"
                          Description="Private, offline AI voice dictation for Windows."
                          BackgroundColor="transparent"
                          Square150x150Logo="Assets\Square150x150Logo.png"
                          Square44x44Logo="Assets\Square44x44Logo.png" />
    </Application>
  </Applications>
</Package>
"@

Set-Content -Path "$stagingDir\AppxManifest.xml" -Value $manifest -Encoding UTF8

# 4. Pack MSIX with MakeAppx
Write-Host "⚡ Compiling MSIX package with MakeAppx..."
& $makeAppx pack /d "$stagingDir" /p "$outputFile" /o

Write-Host "`n✅ Successfully generated MSIX at:" -ForegroundColor Green
Write-Host "   $outputFile`n" -ForegroundColor Yellow
