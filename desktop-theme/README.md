# Codex Aegis Complete Desktop Theme

A professional AI and cyber-operations design package for Windows desktops.

## Included

- `wallpaper/codex-aegis-desktop-4k.png` - main 3840x2160 desktop wallpaper.
- `wallpaper/codex-aegis-lock-4k.png` - matching lock-screen artwork.
- `wallpaper/codex-aegis-ultrawide-3440x1440.png` - ultrawide monitor variant.
- `icons/*.ico` and `icons/*.png` - matching AI/security desktop icon pack.
- `Codex-Aegis.theme` - Windows theme file.
- `WindowsTerminal-Codex-Aegis.json` - matching Windows Terminal color scheme.
- `generate-wallpaper.ps1` - regenerates any wallpaper size or variant.
- `generate-icon-pack.ps1` - regenerates the icon pack.
- `install-theme.ps1` - regenerates and optionally applies the theme.

## Apply

Run this from PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File ".\desktop-theme\install-theme.ps1" -Apply
```

To also apply the lock-screen image, run PowerShell as administrator and add `-ApplyLockScreen`.

## Regenerate A Custom Size

```powershell
powershell -ExecutionPolicy Bypass -File ".\desktop-theme\generate-wallpaper.ps1" -Variant Desktop -Width 2560 -Height 1440
```

## Palette

- Background: `#02070A`
- Panel surface: `#071118`
- AI cyan: `#41ECE2`
- Signal green: `#54FFAC`
- Violet trace: `#8A7CFF`
- Text ice: `#D6F6F6`
