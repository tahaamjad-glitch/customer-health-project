param(
    [switch]$Apply,
    [switch]$ApplyLockScreen,
    [int]$Width = 3840,
    [int]$Height = 2160
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$themeRoot = $PSScriptRoot
$wallpaperDir = Join-Path $themeRoot "wallpaper"
$desktopWallpaperPath = Join-Path $wallpaperDir "codex-aegis-desktop-4k.png"
$lockWallpaperPath = Join-Path $wallpaperDir "codex-aegis-lock-4k.png"
$ultrawideWallpaperPath = Join-Path $wallpaperDir "codex-aegis-ultrawide-3440x1440.png"
$legacyWallpaperPath = Join-Path $wallpaperDir "codex-aegis-4k.png"
$themePath = Join-Path $themeRoot "Codex-Aegis.theme"
$iconDir = Join-Path $themeRoot "icons"

function Set-DwordValue {
    param(
        [string]$Path,
        [string]$Name,
        [int]$Value
    )

    New-Item -Path $Path -Force | Out-Null
    New-ItemProperty -Path $Path -Name $Name -Value $Value -PropertyType DWord -Force | Out-Null
}

function Set-StringValue {
    param(
        [string]$Path,
        [string]$Name,
        [string]$Value
    )

    New-Item -Path $Path -Force | Out-Null
    New-ItemProperty -Path $Path -Name $Name -Value $Value -PropertyType String -Force | Out-Null
}

function Set-DesktopWallpaper {
    param([string]$Path)

    if (-not ("CodexAegisWallpaper" -as [type])) {
        Add-Type @"
using System.Runtime.InteropServices;
public class CodexAegisWallpaper {
    [DllImport("user32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool SystemParametersInfo(int uAction, int uParam, string lpvParam, int fuWinIni);
}
"@
    }

    $setDesktopWallpaper = 20
    $updateIniFile = 0x01
    $sendChange = 0x02
    [CodexAegisWallpaper]::SystemParametersInfo($setDesktopWallpaper, 0, $Path, ($updateIniFile -bor $sendChange)) | Out-Null
}

function Refresh-UserSettings {
    Start-Process -FilePath "rundll32.exe" -ArgumentList "user32.dll,UpdatePerUserSystemParameters" -WindowStyle Hidden
}

New-Item -ItemType Directory -Force -Path $wallpaperDir | Out-Null

& (Join-Path $themeRoot "generate-wallpaper.ps1") -Variant Desktop -Width $Width -Height $Height -OutputPath $desktopWallpaperPath
& (Join-Path $themeRoot "generate-wallpaper.ps1") -Variant Lock -Width $Width -Height $Height -OutputPath $lockWallpaperPath
& (Join-Path $themeRoot "generate-wallpaper.ps1") -Variant Ultrawide -Width 3440 -Height 1440 -OutputPath $ultrawideWallpaperPath
Copy-Item -LiteralPath $desktopWallpaperPath -Destination $legacyWallpaperPath -Force
& (Join-Path $themeRoot "generate-icon-pack.ps1") -OutputDir $iconDir

$themeContent = @"
[Theme]
DisplayName=Codex Aegis Complete

[Control Panel\Colors]
Background=2 7 10
Hilight=65 236 226
HotTrackingColor=84 255 172
Menu=7 15 22
MenuText=214 246 246
Window=8 18 27
WindowText=214 246 246
ButtonFace=9 22 28
ButtonText=214 246 246
InfoWindow=9 22 28
InfoText=214 246 246

[Control Panel\Desktop]
Wallpaper=$desktopWallpaperPath
TileWallpaper=0
WallpaperStyle=10
Pattern=
ScreenSaveActive=0

[VisualStyles]
Path=%SystemRoot%\resources\themes\Aero\Aero.msstyles
ColorStyle=NormalColor
Size=NormalSize
AutoColorization=0
ColorizationColor=0XC841ECE2
VisualStyleVersion=10

[MasterThemeSelector]
MTSM=DABJDKT
"@

Set-Content -Path $themePath -Value $themeContent -Encoding ASCII
Write-Host "Complete theme file created: $themePath"

if ($Apply) {
    & (Join-Path $themeRoot "force-dark-theme.ps1") -WallpaperPath $desktopWallpaperPath
}

if ($ApplyLockScreen) {
    $lockScreenPath = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\PersonalizationCSP"
    Set-StringValue -Path $lockScreenPath -Name "LockScreenImagePath" -Value $lockWallpaperPath
    Set-StringValue -Path $lockScreenPath -Name "LockScreenImageUrl" -Value $lockWallpaperPath
    Set-DwordValue -Path $lockScreenPath -Name "LockScreenImageStatus" -Value 1
    Write-Host "Lock screen policy image set: $lockWallpaperPath"
}
