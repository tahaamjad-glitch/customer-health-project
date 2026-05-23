param(
    [string]$WallpaperPath = (Join-Path $PSScriptRoot "wallpaper\codex-aegis-desktop-4k.png")
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

function Invoke-RegAdd {
    param([string[]]$RegArgs)

    & reg.exe @RegArgs | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "reg.exe failed with exit code ${LASTEXITCODE}: $($RegArgs -join ' ')"
    }
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

    [CodexAegisWallpaper]::SystemParametersInfo(20, 0, $Path, 3) | Out-Null
}

if (-not (Test-Path -LiteralPath $WallpaperPath)) {
    throw "Wallpaper not found: $WallpaperPath"
}

Invoke-RegAdd -RegArgs @("add", "HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize", "/v", "AppsUseLightTheme", "/t", "REG_DWORD", "/d", "0", "/f")
Invoke-RegAdd -RegArgs @("add", "HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize", "/v", "SystemUsesLightTheme", "/t", "REG_DWORD", "/d", "0", "/f")
Invoke-RegAdd -RegArgs @("add", "HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize", "/v", "ColorPrevalence", "/t", "REG_DWORD", "/d", "1", "/f")
Invoke-RegAdd -RegArgs @("add", "HKCU\Software\Microsoft\Windows\DWM", "/v", "ColorPrevalence", "/t", "REG_DWORD", "/d", "1", "/f")
Invoke-RegAdd -RegArgs @("add", "HKCU\Software\Microsoft\Windows\DWM", "/v", "ColorizationColor", "/t", "REG_DWORD", "/d", "3359763682", "/f")
Invoke-RegAdd -RegArgs @("add", "HKCU\Control Panel\Desktop", "/v", "Wallpaper", "/t", "REG_SZ", "/d", $WallpaperPath, "/f")
Invoke-RegAdd -RegArgs @("add", "HKCU\Control Panel\Desktop", "/v", "WallpaperStyle", "/t", "REG_SZ", "/d", "10", "/f")
Invoke-RegAdd -RegArgs @("add", "HKCU\Control Panel\Desktop", "/v", "TileWallpaper", "/t", "REG_SZ", "/d", "0", "/f")

Set-DesktopWallpaper -Path $WallpaperPath
Start-Process -FilePath "rundll32.exe" -ArgumentList "user32.dll,UpdatePerUserSystemParameters" -WindowStyle Hidden

Write-Host "Forced dark mode and AI hacking wallpaper applied."
