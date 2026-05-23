param(
    [string]$OutputDir = (Join-Path $PSScriptRoot "icons")
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Add-Type -AssemblyName System.Drawing

function New-Color {
    param([int]$A, [int]$R, [int]$G, [int]$B)
    return [System.Drawing.Color]::FromArgb($A, $R, $G, $B)
}

function Write-IcoFromPng {
    param(
        [string]$PngPath,
        [string]$IcoPath
    )

    $pngBytes = [System.IO.File]::ReadAllBytes($PngPath)
    $stream = New-Object System.IO.FileStream($IcoPath, [System.IO.FileMode]::Create, [System.IO.FileAccess]::Write)
    $writer = New-Object System.IO.BinaryWriter($stream)

    try {
        $writer.Write([UInt16]0)
        $writer.Write([UInt16]1)
        $writer.Write([UInt16]1)
        $writer.Write([Byte]0)
        $writer.Write([Byte]0)
        $writer.Write([Byte]0)
        $writer.Write([Byte]0)
        $writer.Write([UInt16]1)
        $writer.Write([UInt16]32)
        $writer.Write([UInt32]$pngBytes.Length)
        $writer.Write([UInt32]22)
        $writer.Write($pngBytes)
    }
    finally {
        $writer.Dispose()
        $stream.Dispose()
    }
}

function New-IconAsset {
    param(
        [string]$Name,
        [string]$Label,
        [string]$Glyph,
        [string]$OutputDir
    )

    $size = 256
    $bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppPArgb)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

    try {
        $canvas = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
        $background = New-Object System.Drawing.Drawing2D.LinearGradientBrush($canvas, (New-Color 255 3 9 13), (New-Color 255 9 26 31), 45)
        $graphics.FillRectangle($background, $canvas)
        $background.Dispose()

        $glowPath = New-Object System.Drawing.Drawing2D.GraphicsPath
        $glowPath.AddEllipse((New-Object System.Drawing.RectangleF(18, 18, 220, 220)))
        $glow = New-Object System.Drawing.Drawing2D.PathGradientBrush($glowPath)
        $glow.CenterColor = New-Color 120 65 236 226
        $glow.SurroundColors = @((New-Color 0 65 236 226))
        $graphics.FillEllipse($glow, 18, 18, 220, 220)
        $glow.Dispose()
        $glowPath.Dispose()

        $borderPen = New-Object System.Drawing.Pen((New-Color 210 65 236 226), 5)
        $innerPen = New-Object System.Drawing.Pen((New-Color 140 84 255 172), 3)
        $graphics.DrawEllipse($borderPen, 34, 34, 188, 188)
        $graphics.DrawRectangle($innerPen, 55, 55, 146, 146)

        $glyphFont = New-Object System.Drawing.Font("Segoe UI Semibold", 64, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
        $labelFont = New-Object System.Drawing.Font("Consolas", 18, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
        $glyphBrush = New-Object System.Drawing.SolidBrush((New-Color 245 214 255 249))
        $labelBrush = New-Object System.Drawing.SolidBrush((New-Color 190 84 255 172))
        $format = New-Object System.Drawing.StringFormat
        $format.Alignment = [System.Drawing.StringAlignment]::Center
        $format.LineAlignment = [System.Drawing.StringAlignment]::Center

        $graphics.DrawString($Glyph, $glyphFont, $glyphBrush, (New-Object System.Drawing.RectangleF(0, 64, 256, 80)), $format)
        $graphics.DrawString($Label, $labelFont, $labelBrush, (New-Object System.Drawing.RectangleF(0, 158, 256, 28)), $format)

        $pngPath = Join-Path $OutputDir "$Name.png"
        $icoPath = Join-Path $OutputDir "$Name.ico"
        $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
        Write-IcoFromPng $pngPath $icoPath
    }
    finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

New-IconAsset -Name "aegis-ai-core" -Label "AI CORE" -Glyph "AI" -OutputDir $OutputDir
New-IconAsset -Name "aegis-terminal" -Label "TERM" -Glyph ">_" -OutputDir $OutputDir
New-IconAsset -Name "aegis-vault" -Label "VAULT" -Glyph "01" -OutputDir $OutputDir
New-IconAsset -Name "aegis-network" -Label "MESH" -Glyph "NX" -OutputDir $OutputDir

Write-Host "Icon pack created: $OutputDir"
