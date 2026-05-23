param(
    [int]$Width = 3840,
    [int]$Height = 2160,
    [ValidateSet("Desktop", "Lock", "Ultrawide")]
    [string]$Variant = "Desktop",
    [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

Add-Type -AssemblyName System.Drawing

if ([string]::IsNullOrWhiteSpace($OutputPath)) {
    $fileName = "codex-aegis-$($Variant.ToLowerInvariant())-$Width`x$Height.png"
    $OutputPath = Join-Path $PSScriptRoot (Join-Path "wallpaper" $fileName)
}

function New-Color {
    param([int]$A, [int]$R, [int]$G, [int]$B)
    return [System.Drawing.Color]::FromArgb($A, $R, $G, $B)
}

function New-Point {
    param([double]$X, [double]$Y)
    return New-Object System.Drawing.PointF([single]$X, [single]$Y)
}

function Get-PolygonPoints {
    param(
        [double]$CenterX,
        [double]$CenterY,
        [double]$Radius,
        [int]$Sides,
        [double]$RotationDegrees = -90
    )

    $points = New-Object "System.Drawing.PointF[]" $Sides
    for ($i = 0; $i -lt $Sides; $i++) {
        $angle = (($RotationDegrees + (360 / $Sides) * $i) * [Math]::PI) / 180
        $points[$i] = New-Point ($CenterX + [Math]::Cos($angle) * $Radius) ($CenterY + [Math]::Sin($angle) * $Radius)
    }

    return $points
}

function Draw-SoftEllipse {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Drawing.RectangleF]$Bounds,
        [System.Drawing.Color]$CenterColor,
        [System.Drawing.Color]$EdgeColor
    )

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse($Bounds)
    $brush = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
    $brush.CenterColor = $CenterColor
    $brush.SurroundColors = @($EdgeColor)
    $Graphics.FillEllipse($brush, $Bounds)
    $brush.Dispose()
    $path.Dispose()
}

function Draw-Polyline {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Drawing.Pen]$Pen,
        [System.Drawing.PointF[]]$Points
    )

    if ($Points.Length -gt 1) {
        $Graphics.DrawLines($Pen, $Points)
    }
}

function Draw-Panel {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Drawing.RectangleF]$Rect,
        [System.Drawing.Brush]$FillBrush,
        [System.Drawing.Pen]$BorderPen,
        [System.Drawing.Pen]$AccentPen
    )

    $Graphics.FillRectangle($FillBrush, $Rect)
    $Graphics.DrawRectangle($BorderPen, $Rect.X, $Rect.Y, $Rect.Width, $Rect.Height)

    $corner = [single]([Math]::Min($Rect.Width, $Rect.Height) * 0.1)
    $Graphics.DrawLine($AccentPen, $Rect.X, $Rect.Y, [single]($Rect.X + $corner), $Rect.Y)
    $Graphics.DrawLine($AccentPen, $Rect.X, $Rect.Y, $Rect.X, [single]($Rect.Y + $corner))
    $Graphics.DrawLine($AccentPen, [single]($Rect.Right - $corner), $Rect.Bottom, $Rect.Right, $Rect.Bottom)
    $Graphics.DrawLine($AccentPen, $Rect.Right, [single]($Rect.Bottom - $corner), $Rect.Right, $Rect.Bottom)
}

function Draw-CodeBlock {
    param(
        [System.Drawing.Graphics]$Graphics,
        [string[]]$Lines,
        [single]$X,
        [single]$Y,
        [single]$LineGap,
        [System.Drawing.Font]$Font,
        [System.Drawing.Brush]$PrimaryBrush,
        [System.Drawing.Brush]$SecondaryBrush,
        [System.Drawing.Brush]$MutedBrush
    )

    for ($i = 0; $i -lt $Lines.Count; $i++) {
        $brush = $PrimaryBrush
        if ($i % 4 -eq 1) {
            $brush = $SecondaryBrush
        }
        elseif ($i % 4 -eq 3) {
            $brush = $MutedBrush
        }

        $Graphics.DrawString($Lines[$i], $Font, $brush, $X, [single]($Y + $i * $LineGap))
    }
}

function Draw-MatrixColumns {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Random]$Random,
        [int]$Width,
        [int]$Height,
        [System.Drawing.Font]$Font,
        [System.Drawing.Brush]$Brush
    )

    $symbols = @('0', '1', 'AI', 'NN', 'SIG', 'DEL', '01', 'IX', '7', '>', '$', '#')
    for ($column = 0; $column -lt 32; $column++) {
        $x = [single]($Random.NextDouble() * $Width)
        $y = [single]($Random.NextDouble() * $Height * 0.18)
        $steps = 10 + $Random.Next(0, 18)

        for ($step = 0; $step -lt $steps; $step++) {
            $symbol = $symbols[$Random.Next(0, $symbols.Count)]
            $Graphics.DrawString($symbol, $Font, $Brush, $x, [single]($y + $step * 30))
        }
    }
}

function Draw-BarGraph {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Random]$Random,
        [System.Drawing.RectangleF]$Rect,
        [System.Drawing.Brush]$BarBrush,
        [System.Drawing.Pen]$RulePen
    )

    $Graphics.DrawLine($RulePen, $Rect.X, $Rect.Bottom, $Rect.Right, $Rect.Bottom)
    $barCount = 16
    $gap = $Rect.Width / ($barCount * 1.65)
    $barWidth = $gap * 0.65
    for ($i = 0; $i -lt $barCount; $i++) {
        $value = 0.22 + $Random.NextDouble() * 0.76
        $barHeight = $Rect.Height * $value
        $x = $Rect.X + $i * ($barWidth + $gap)
        $Graphics.FillRectangle($BarBrush, [single]$x, [single]($Rect.Bottom - $barHeight), [single]$barWidth, [single]$barHeight)
    }
}

function Draw-Crosshair {
    param(
        [System.Drawing.Graphics]$Graphics,
        [single]$CenterX,
        [single]$CenterY,
        [single]$Radius,
        [System.Drawing.Pen]$Pen,
        [System.Drawing.Pen]$SoftPen
    )

    $Graphics.DrawEllipse($SoftPen, [single]($CenterX - $Radius), [single]($CenterY - $Radius), [single]($Radius * 2), [single]($Radius * 2))
    $Graphics.DrawEllipse($Pen, [single]($CenterX - $Radius * 0.58), [single]($CenterY - $Radius * 0.58), [single]($Radius * 1.16), [single]($Radius * 1.16))
    $Graphics.DrawLine($Pen, [single]($CenterX - $Radius * 1.25), $CenterY, [single]($CenterX - $Radius * 0.72), $CenterY)
    $Graphics.DrawLine($Pen, [single]($CenterX + $Radius * 0.72), $CenterY, [single]($CenterX + $Radius * 1.25), $CenterY)
    $Graphics.DrawLine($Pen, $CenterX, [single]($CenterY - $Radius * 1.25), $CenterX, [single]($CenterY - $Radius * 0.72))
    $Graphics.DrawLine($Pen, $CenterX, [single]($CenterY + $Radius * 0.72), $CenterX, [single]($CenterY + $Radius * 1.25))
}

function Convert-MapPoints {
    param(
        [System.Drawing.RectangleF]$Bounds,
        [double[]]$Coords
    )

    $pointCount = [int]($Coords.Length / 2)
    $points = New-Object "System.Drawing.PointF[]" $pointCount
    for ($i = 0; $i -lt $pointCount; $i++) {
        $x = $Bounds.X + ($Coords[$i * 2] * $Bounds.Width)
        $y = $Bounds.Y + ($Coords[$i * 2 + 1] * $Bounds.Height)
        $points[$i] = New-Point $x $y
    }

    return $points
}

function Draw-MapPolygon {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Drawing.RectangleF]$Bounds,
        [double[]]$Coords,
        [System.Drawing.Brush]$FillBrush,
        [System.Drawing.Pen]$StrokePen
    )

    $points = [System.Drawing.PointF[]](Convert-MapPoints $Bounds $Coords)
    $Graphics.FillPolygon($FillBrush, $points)
    $Graphics.DrawPolygon($StrokePen, $points)
}

function Draw-MapEvent {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Drawing.RectangleF]$Bounds,
        [double]$X,
        [double]$Y,
        [string]$Label,
        [System.Drawing.Brush]$FillBrush,
        [System.Drawing.Brush]$TextBrush,
        [System.Drawing.Pen]$RingPen,
        [System.Drawing.Font]$Font
    )

    $px = [single]($Bounds.X + $X * $Bounds.Width)
    $py = [single]($Bounds.Y + $Y * $Bounds.Height)

    $Graphics.DrawEllipse($RingPen, [single]($px - 16), [single]($py - 16), 32, 32)
    $Graphics.DrawEllipse($RingPen, [single]($px - 27), [single]($py - 27), 54, 54)
    $Graphics.FillEllipse($FillBrush, [single]($px - 5), [single]($py - 5), 10, 10)
    $Graphics.DrawLine($RingPen, [single]($px + 7), $py, [single]($px + 58), [single]($py - 18))
    $Graphics.DrawString($Label, $Font, $TextBrush, [single]($px + 64), [single]($py - 30))
}

function Draw-LayerRail {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Drawing.RectangleF]$Rect,
        [System.Drawing.Font]$HeaderFont,
        [System.Drawing.Font]$RowFont,
        [System.Drawing.Brush]$PanelBrush,
        [System.Drawing.Brush]$PrimaryBrush,
        [System.Drawing.Brush]$MutedBrush,
        [System.Drawing.Pen]$BorderPen,
        [System.Drawing.Pen]$AccentPen
    )

    Draw-Panel $Graphics $Rect $PanelBrush $BorderPen $AccentPen
    $Graphics.DrawString("GLOBAL LAYERS", $HeaderFont, $PrimaryBrush, [single]($Rect.X + 24), [single]($Rect.Y + 24))

    $layers = @(
        "CONFLICTS", "BASES", "HOTSPOTS", "NUCLEAR", "SANCTIONS",
        "WEATHER", "ECONOMIC", "WATERWAYS", "OUTAGES", "MILITARY", "NATURAL"
    )

    for ($i = 0; $i -lt $layers.Count; $i++) {
        $rowY = [single]($Rect.Y + 72 + $i * 31)
        $Graphics.DrawRectangle($AccentPen, [single]($Rect.X + 24), [single]($rowY + 6), 10, 10)
        $Graphics.DrawString($layers[$i], $RowFont, $MutedBrush, [single]($Rect.X + 46), $rowY)
    }
}

function Draw-WorldMonitorMap {
    param(
        [System.Drawing.Graphics]$Graphics,
        [int]$Width,
        [int]$Height,
        [System.Drawing.Font]$TinyFont,
        [System.Drawing.Font]$MicroFont,
        [System.Drawing.Brush]$PanelBrush,
        [System.Drawing.Brush]$CyanBrush,
        [System.Drawing.Brush]$GreenBrush,
        [System.Drawing.Brush]$MutedBrush,
        [System.Drawing.Pen]$BorderPen,
        [System.Drawing.Pen]$AccentPen
    )

    $mapBounds = New-Object System.Drawing.RectangleF([single]($Width * 0.10), [single]($Height * 0.18), [single]($Width * 0.80), [single]($Height * 0.47))
    $landBrush = New-Object System.Drawing.SolidBrush((New-Color 44 29 96 100))
    $landStroke = New-Object System.Drawing.Pen((New-Color 88 69 234 219), 1.4)
    $routePen = New-Object System.Drawing.Pen((New-Color 62 88 239 221), 1.5)
    $amberBrush = New-Object System.Drawing.SolidBrush((New-Color 230 245 188 87))
    $redBrush = New-Object System.Drawing.SolidBrush((New-Color 230 255 95 115))
    $violetBrush = New-Object System.Drawing.SolidBrush((New-Color 220 138 124 255))
    $eventRingPen = New-Object System.Drawing.Pen((New-Color 120 92 239 255), 1.6)

    try {
        Draw-MapPolygon $Graphics $mapBounds @(0.07,0.26, 0.12,0.18, 0.22,0.17, 0.30,0.24, 0.32,0.33, 0.27,0.40, 0.21,0.36, 0.16,0.43, 0.10,0.39) $landBrush $landStroke
        Draw-MapPolygon $Graphics $mapBounds @(0.30,0.46, 0.35,0.53, 0.37,0.64, 0.34,0.79, 0.30,0.91, 0.27,0.74, 0.23,0.62, 0.25,0.50) $landBrush $landStroke
        Draw-MapPolygon $Graphics $mapBounds @(0.42,0.28, 0.50,0.20, 0.59,0.23, 0.69,0.22, 0.83,0.32, 0.88,0.43, 0.80,0.51, 0.70,0.47, 0.64,0.55, 0.56,0.49, 0.49,0.56, 0.42,0.49, 0.38,0.39) $landBrush $landStroke
        Draw-MapPolygon $Graphics $mapBounds @(0.50,0.46, 0.58,0.50, 0.61,0.64, 0.56,0.83, 0.49,0.77, 0.45,0.63) $landBrush $landStroke
        Draw-MapPolygon $Graphics $mapBounds @(0.78,0.70, 0.87,0.68, 0.92,0.75, 0.88,0.84, 0.78,0.81) $landBrush $landStroke
        Draw-MapPolygon $Graphics $mapBounds @(0.33,0.18, 0.39,0.14, 0.43,0.20, 0.38,0.25) $landBrush $landStroke

        $routes = @(
            @((New-Point ($mapBounds.X + $mapBounds.Width * 0.18) ($mapBounds.Y + $mapBounds.Height * 0.34)), (New-Point ($mapBounds.X + $mapBounds.Width * 0.48) ($mapBounds.Y + $mapBounds.Height * 0.36)), (New-Point ($mapBounds.X + $mapBounds.Width * 0.70) ($mapBounds.Y + $mapBounds.Height * 0.34))),
            @((New-Point ($mapBounds.X + $mapBounds.Width * 0.32) ($mapBounds.Y + $mapBounds.Height * 0.62)), (New-Point ($mapBounds.X + $mapBounds.Width * 0.56) ($mapBounds.Y + $mapBounds.Height * 0.54)), (New-Point ($mapBounds.X + $mapBounds.Width * 0.82) ($mapBounds.Y + $mapBounds.Height * 0.72))),
            @((New-Point ($mapBounds.X + $mapBounds.Width * 0.51) ($mapBounds.Y + $mapBounds.Height * 0.29)), (New-Point ($mapBounds.X + $mapBounds.Width * 0.58) ($mapBounds.Y + $mapBounds.Height * 0.48)), (New-Point ($mapBounds.X + $mapBounds.Width * 0.54) ($mapBounds.Y + $mapBounds.Height * 0.72)))
        )
        foreach ($route in $routes) {
            Draw-Polyline $Graphics $routePen ([System.Drawing.PointF[]]$route)
        }

        Draw-MapEvent $Graphics $mapBounds 0.23 0.35 "NODE-17" $amberBrush $CyanBrush $eventRingPen $TinyFont
        Draw-MapEvent $Graphics $mapBounds 0.50 0.31 "CII-82" $redBrush $CyanBrush $eventRingPen $TinyFont
        Draw-MapEvent $Graphics $mapBounds 0.61 0.51 "MESH-04" $GreenBrush $CyanBrush $eventRingPen $TinyFont
        Draw-MapEvent $Graphics $mapBounds 0.78 0.44 "AIR-09" $violetBrush $CyanBrush $eventRingPen $TinyFont
        Draw-MapEvent $Graphics $mapBounds 0.84 0.75 "SEA-21" $GreenBrush $CyanBrush $eventRingPen $TinyFont

        $Graphics.DrawString("7D GLOBAL SIGNAL MAP", $MicroFont, $CyanBrush, [single]($Width * 0.36), [single]($Height * 0.135))
        $Graphics.DrawString("SYNTHETIC INTELLIGENCE VIEW", $TinyFont, $MutedBrush, [single]($Width * 0.36), [single]($Height * 0.162))

        $railRect = New-Object System.Drawing.RectangleF([single]($Width * 0.055), [single]($Height * 0.50), [single]($Width * 0.19), [single]($Height * 0.29))
        Draw-LayerRail $Graphics $railRect $MicroFont $TinyFont $PanelBrush $CyanBrush $MutedBrush $BorderPen $AccentPen
    }
    finally {
        $landBrush.Dispose()
        $landStroke.Dispose()
        $routePen.Dispose()
        $amberBrush.Dispose()
        $redBrush.Dispose()
        $violetBrush.Dispose()
        $eventRingPen.Dispose()
    }
}

function Draw-AICore {
    param(
        [System.Drawing.Graphics]$Graphics,
        [System.Random]$Random,
        [int]$Width,
        [int]$Height,
        [double]$CenterX,
        [double]$CenterY,
        [double]$CoreRadius,
        [System.Drawing.Brush]$NodeBrush,
        [System.Drawing.Brush]$NodeBrushHot,
        [System.Drawing.Brush]$CoreDotBrush,
        [System.Drawing.Pen]$HexPenOuter,
        [System.Drawing.Pen]$HexPenMid,
        [System.Drawing.Pen]$HexPenInner,
        [System.Drawing.Pen]$LinkPen,
        [System.Drawing.Pen]$LinkPenHot
    )

    Draw-SoftEllipse $Graphics `
        (New-Object System.Drawing.RectangleF([single]($CenterX - $CoreRadius * 1.45), [single]($CenterY - $CoreRadius * 1.45), [single]($CoreRadius * 2.9), [single]($CoreRadius * 2.9))) `
        (New-Color 130 30 228 208) `
        (New-Color 0 30 228 208)

    $hexOuter = Get-PolygonPoints $CenterX $CenterY ($CoreRadius * 1.03) 6 -90
    $hexMid = Get-PolygonPoints $CenterX $CenterY ($CoreRadius * 0.76) 6 -90
    $hexInner = Get-PolygonPoints $CenterX $CenterY ($CoreRadius * 0.45) 6 -90

    $hexFill = New-Object System.Drawing.SolidBrush((New-Color 66 5 20 25))
    $Graphics.FillPolygon($hexFill, $hexOuter)
    $Graphics.DrawPolygon($HexPenOuter, $hexOuter)
    $Graphics.DrawPolygon($HexPenMid, $hexMid)
    $Graphics.DrawPolygon($HexPenInner, $hexInner)
    $hexFill.Dispose()

    $arcPenCyan = New-Object System.Drawing.Pen((New-Color 174 103 244 255), 3.2)
    $arcPenGreen = New-Object System.Drawing.Pen((New-Color 152 85 255 164), 2.5)
    for ($i = 0; $i -lt 10; $i++) {
        $size = $CoreRadius * (0.28 + $i * 0.069)
        $rect = New-Object System.Drawing.RectangleF([single]($CenterX - $size), [single]($CenterY - $size), [single]($size * 2), [single]($size * 2))
        $start = -55 + $i * 21
        $sweep = 93 + (($i % 4) * 24)
        $arcPen = $arcPenGreen
        if ($i % 2 -eq 0) {
            $arcPen = $arcPenCyan
        }
        $Graphics.DrawArc($arcPen, $rect, [single]$start, [single]$sweep)
    }
    $arcPenCyan.Dispose()
    $arcPenGreen.Dispose()

    $nodes = New-Object System.Collections.Generic.List[System.Drawing.PointF]
    for ($i = 0; $i -lt 76; $i++) {
        $angle = ($Random.NextDouble() * 2 * [Math]::PI)
        $radius = $CoreRadius * (0.14 + $Random.NextDouble() * 0.82)
        $x = $CenterX + [Math]::Cos($angle) * $radius
        $y = $CenterY + [Math]::Sin($angle) * $radius * 0.82
        $nodes.Add((New-Point $x $y))
    }

    for ($i = 0; $i -lt $nodes.Count; $i++) {
        for ($j = $i + 1; $j -lt $nodes.Count; $j++) {
            $dx = $nodes[$i].X - $nodes[$j].X
            $dy = $nodes[$i].Y - $nodes[$j].Y
            $dist = [Math]::Sqrt($dx * $dx + $dy * $dy)
            if ($dist -lt ($CoreRadius * 0.25) -and $Random.NextDouble() -gt 0.48) {
                $activeLinkPen = $LinkPen
                if ($Random.NextDouble() -gt 0.78) {
                    $activeLinkPen = $LinkPenHot
                }
                $Graphics.DrawLine($activeLinkPen, $nodes[$i], $nodes[$j])
            }
        }
    }

    $nodePen = New-Object System.Drawing.Pen((New-Color 105 125 255 228), 1.3)
    foreach ($node in $nodes) {
        $size = 4.5 + $Random.NextDouble() * 6.5
        $brush = $NodeBrush
        if ($Random.NextDouble() -gt 0.82) {
            $brush = $NodeBrushHot
        }
        $Graphics.FillEllipse($brush, [single]($node.X - $size / 2), [single]($node.Y - $size / 2), [single]$size, [single]$size)
        $Graphics.DrawEllipse($nodePen, [single]($node.X - $size / 2), [single]($node.Y - $size / 2), [single]$size, [single]$size)
    }
    $nodePen.Dispose()

    $Graphics.FillEllipse($CoreDotBrush, [single]($CenterX - 19), [single]($CenterY - 19), 38, 38)
    $Graphics.DrawEllipse($HexPenInner, [single]($CenterX - 64), [single]($CenterY - 64), 128, 128)
}

$outputDir = Split-Path -Parent $OutputPath
if (-not [string]::IsNullOrWhiteSpace($outputDir)) {
    New-Item -ItemType Directory -Force -Path $outputDir | Out-Null
}

$bitmap = New-Object System.Drawing.Bitmap($Width, $Height, [System.Drawing.Imaging.PixelFormat]::Format32bppPArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit

try {
    $canvas = New-Object System.Drawing.Rectangle(0, 0, $Width, $Height)
    $baseBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $canvas,
        (New-Color 255 2 7 10),
        (New-Color 255 9 18 27),
        22
    )
    $graphics.FillRectangle($baseBrush, $canvas)
    $baseBrush.Dispose()

    Draw-SoftEllipse $graphics `
        (New-Object System.Drawing.RectangleF([single]($Width * -0.14), [single]($Height * -0.2), [single]($Width * 0.76), [single]($Height * 0.86))) `
        (New-Color 118 0 130 151) `
        (New-Color 0 0 130 151)
    Draw-SoftEllipse $graphics `
        (New-Object System.Drawing.RectangleF([single]($Width * 0.50), [single]($Height * 0.16), [single]($Width * 0.65), [single]($Height * 0.72))) `
        (New-Color 98 12 120 72) `
        (New-Color 0 12 120 72)

    $seed = 2147
    if ($Variant -eq "Lock") {
        $seed = 2718
    }
    elseif ($Variant -eq "Ultrawide") {
        $seed = 3141
    }
    $random = New-Object System.Random $seed

    $gridPen = New-Object System.Drawing.Pen((New-Color 26 64 226 214), 1)
    $gridPen2 = New-Object System.Drawing.Pen((New-Color 21 80 255 159), 1)
    $majorGridPen = New-Object System.Drawing.Pen((New-Color 42 79 237 217), 1.4)
    $gridStep = [Math]::Max(64, [int]($Width / 48))

    for ($x = 0; $x -le $Width; $x += $gridStep) {
        $pen = $gridPen
        if (($x / $gridStep) % 5 -eq 0) {
            $pen = $majorGridPen
        }
        $graphics.DrawLine($pen, $x, 0, $x, $Height)
    }
    for ($y = 0; $y -le $Height; $y += $gridStep) {
        $pen = $gridPen2
        if (($y / $gridStep) % 5 -eq 0) {
            $pen = $majorGridPen
        }
        $graphics.DrawLine($pen, 0, $y, $Width, $y)
    }

    $scanlinePen = New-Object System.Drawing.Pen((New-Color 10 210 255 234), 1)
    for ($y = 0; $y -le $Height; $y += 9) {
        $graphics.DrawLine($scanlinePen, 0, $y, $Width, $y)
    }

    $fontSmall = New-Object System.Drawing.Font("Consolas", [single]([Math]::Max(17, $Height * 0.0106)), [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $fontTiny = New-Object System.Drawing.Font("Consolas", [single]([Math]::Max(14, $Height * 0.0083)), [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $fontMatrix = New-Object System.Drawing.Font("Consolas", [single]([Math]::Max(13, $Height * 0.0081)), [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $fontLabel = New-Object System.Drawing.Font("Segoe UI Semibold", [single]([Math]::Max(28, $Height * 0.018)), [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $fontHero = New-Object System.Drawing.Font("Segoe UI Semibold", [single]([Math]::Max(42, $Height * 0.033)), [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $fontMicro = New-Object System.Drawing.Font("Segoe UI", [single]([Math]::Max(15, $Height * 0.0084)), [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
    $fontMicroBold = New-Object System.Drawing.Font("Segoe UI Semibold", [single]([Math]::Max(15, $Height * 0.0088)), [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

    $greenTextBrush = New-Object System.Drawing.SolidBrush((New-Color 168 84 255 172))
    $cyanTextBrush = New-Object System.Drawing.SolidBrush((New-Color 178 92 239 255))
    $hotTextBrush = New-Object System.Drawing.SolidBrush((New-Color 195 180 255 247))
    $mutedTextBrush = New-Object System.Drawing.SolidBrush((New-Color 128 158 181 187))
    $matrixBrush = New-Object System.Drawing.SolidBrush((New-Color 30 84 255 172))
    $panelBrush = New-Object System.Drawing.SolidBrush((New-Color 76 4 15 20))
    $panelBorderPen = New-Object System.Drawing.Pen((New-Color 74 72 240 221), 1.5)
    $panelAccentPen = New-Object System.Drawing.Pen((New-Color 132 91 255 220), 2.2)
    $barBrush = New-Object System.Drawing.SolidBrush((New-Color 118 70 239 219))

    Draw-MatrixColumns $graphics $random $Width $Height $fontMatrix $matrixBrush
    if ($Variant -ne "Lock") {
        Draw-WorldMonitorMap $graphics $Width $Height $fontTiny $fontMicroBold $panelBrush $cyanTextBrush $greenTextBrush $mutedTextBrush $panelBorderPen $panelAccentPen
    }

    $centerX = $Width * 0.52
    $centerY = $Height * 0.48
    if ($Variant -eq "Lock") {
        $centerX = $Width * 0.50
        $centerY = $Height * 0.43
    }
    elseif ($Variant -eq "Ultrawide") {
        $centerX = $Width * 0.50
        $centerY = $Height * 0.50
    }
    $coreRadius = [Math]::Min($Width, $Height) * 0.225

    $nodeBrush = New-Object System.Drawing.SolidBrush((New-Color 230 105 255 222))
    $nodeBrushHot = New-Object System.Drawing.SolidBrush((New-Color 235 169 255 246))
    $coreDotBrush = New-Object System.Drawing.SolidBrush((New-Color 248 215 255 249))
    $hexPenOuter = New-Object System.Drawing.Pen((New-Color 198 65 236 226), 4)
    $hexPenMid = New-Object System.Drawing.Pen((New-Color 155 86 255 174), 2.6)
    $hexPenInner = New-Object System.Drawing.Pen((New-Color 180 164 239 255), 2.2)
    $linkPen = New-Object System.Drawing.Pen((New-Color 62 100 239 222), 1.2)
    $linkPenHot = New-Object System.Drawing.Pen((New-Color 80 92 255 160), 1.5)

    Draw-AICore $graphics $random $Width $Height $centerX $centerY $coreRadius $nodeBrush $nodeBrushHot $coreDotBrush $hexPenOuter $hexPenMid $hexPenInner $linkPen $linkPenHot

    $circuitPen = New-Object System.Drawing.Pen((New-Color 105 68 230 214), 2.2)
    $circuitPen2 = New-Object System.Drawing.Pen((New-Color 94 84 255 154), 2)
    $routes = @(
        @((New-Point ($centerX - $coreRadius * 0.98) ($centerY - $coreRadius * 0.31)), (New-Point ($Width * 0.35) ($Height * 0.32)), (New-Point ($Width * 0.26) ($Height * 0.32)), (New-Point ($Width * 0.20) ($Height * 0.26))),
        @((New-Point ($centerX + $coreRadius * 0.90) ($centerY + $coreRadius * 0.12)), (New-Point ($Width * 0.70) ($Height * 0.50)), (New-Point ($Width * 0.80) ($Height * 0.50)), (New-Point ($Width * 0.87) ($Height * 0.45))),
        @((New-Point ($centerX - $coreRadius * 0.2) ($centerY + $coreRadius * 0.92)), (New-Point ($Width * 0.48) ($Height * 0.76)), (New-Point ($Width * 0.36) ($Height * 0.76)), (New-Point ($Width * 0.28) ($Height * 0.82))),
        @((New-Point ($centerX + $coreRadius * 0.22) ($centerY - $coreRadius * 0.96)), (New-Point ($Width * 0.59) ($Height * 0.22)), (New-Point ($Width * 0.68) ($Height * 0.22)), (New-Point ($Width * 0.75) ($Height * 0.17))),
        @((New-Point ($centerX - $coreRadius * 1.0) ($centerY + $coreRadius * 0.24)), (New-Point ($Width * 0.31) ($Height * 0.58)), (New-Point ($Width * 0.18) ($Height * 0.58)), (New-Point ($Width * 0.12) ($Height * 0.65)))
    )
    foreach ($route in $routes) {
        $routePen = $circuitPen2
        if ($random.NextDouble() -gt 0.45) {
            $routePen = $circuitPen
        }
        Draw-Polyline $graphics $routePen ([System.Drawing.PointF[]]$route)
        foreach ($point in $route) {
            $graphics.FillEllipse($nodeBrush, [single]($point.X - 5), [single]($point.Y - 5), 10, 10)
        }
    }

    for ($i = 0; $i -lt 36; $i++) {
        $x = [single]($Width * (0.08 + $random.NextDouble() * 0.84))
        $y = [single]($Height * (0.10 + $random.NextDouble() * 0.80))
        $w = [single](60 + $random.NextDouble() * ($Width * 0.075))
        $pen = $circuitPen
        if ($i % 2 -ne 0) {
            $pen = $circuitPen2
        }
        $graphics.DrawLine($pen, $x, $y, [single]($x + $w), $y)
        $graphics.FillEllipse($nodeBrush, [single]($x + $w - 4), [single]($y - 4), 8, 8)
    }

    if ($Variant -ne "Lock") {
        $leftPanel = New-Object System.Drawing.RectangleF([single]($Width * 0.055), [single]($Height * 0.12), [single]($Width * 0.27), [single]($Height * 0.34))
        $rightPanel = New-Object System.Drawing.RectangleF([single]($Width * 0.68), [single]($Height * 0.53), [single]($Width * 0.25), [single]($Height * 0.31))
        $topPanel = New-Object System.Drawing.RectangleF([single]($Width * 0.70), [single]($Height * 0.12), [single]($Width * 0.22), [single]($Height * 0.12))

        Draw-Panel $graphics $leftPanel $panelBrush $panelBorderPen $panelAccentPen
        Draw-Panel $graphics $rightPanel $panelBrush $panelBorderPen $panelAccentPen
        Draw-Panel $graphics $topPanel $panelBrush $panelBorderPen $panelAccentPen

        $leftCode = @(
            "global.feed ingest --range 7d",
            "conflict stream: normalized",
            "military ads-b: watched",
            "maritime ais: scanned",
            "sanctions graph: active",
            "weather hazard: fused",
            "outage net: correlating",
            "economic pulse: sampled",
            "nuclear watch: guarded",
            "ai brief: synthesizing"
        )

        $rightCode = @(
            "map.kernel/global",
            "instability index: 82",
            "layer stack: 12 active",
            "hotspots clustered",
            "intel confidence: high",
            "waterways monitored",
            "dark vessels flagged",
            "daily brief ready"
        )

        Draw-CodeBlock $graphics $leftCode ([single]($leftPanel.X + $Width * 0.025)) ([single]($leftPanel.Y + $Height * 0.055)) ([single]($Height * 0.0215)) $fontSmall $greenTextBrush $cyanTextBrush $mutedTextBrush
        Draw-CodeBlock $graphics $rightCode ([single]($rightPanel.X + $Width * 0.028)) ([single]($rightPanel.Y + $Height * 0.07)) ([single]($Height * 0.021)) $fontSmall $greenTextBrush $cyanTextBrush $mutedTextBrush

        $graphics.DrawString("STATUS", $fontMicro, $mutedTextBrush, [single]($topPanel.X + $Width * 0.025), [single]($topPanel.Y + $Height * 0.025))
        $graphics.DrawString("ENCRYPTED  |  MONITORED  |  READY", $fontTiny, $greenTextBrush, [single]($topPanel.X + $Width * 0.025), [single]($topPanel.Y + $Height * 0.052))

        Draw-BarGraph $graphics $random (New-Object System.Drawing.RectangleF([single]($rightPanel.X + $Width * 0.035), [single]($rightPanel.Y + $Height * 0.2), [single]($rightPanel.Width * 0.72), [single]($rightPanel.Height * 0.18))) $barBrush $panelBorderPen
        Draw-Crosshair $graphics ([single]($Width * 0.83)) ([single]($Height * 0.34)) ([single]($Height * 0.047)) $hexPenInner $linkPen
    }
    else {
        $lockPanel = New-Object System.Drawing.RectangleF([single]($Width * 0.33), [single]($Height * 0.73), [single]($Width * 0.34), [single]($Height * 0.13))
        Draw-Panel $graphics $lockPanel $panelBrush $panelBorderPen $panelAccentPen
        $graphics.DrawString("AEGIS AI", $fontHero, $hotTextBrush, [single]($lockPanel.X + $Width * 0.035), [single]($lockPanel.Y + $Height * 0.025))
        $graphics.DrawString("SECURE ACCESS ENVIRONMENT", $fontMicroBold, $greenTextBrush, [single]($lockPanel.X + $Width * 0.037), [single]($lockPanel.Y + $Height * 0.083))
    }

    $title = "AEGIS WORLD MONITOR"
    $subtitle = "AI GLOBAL INTELLIGENCE DESKTOP"
    if ($Variant -eq "Lock") {
        $title = "AUTHENTICATED INTELLIGENCE"
        $subtitle = "PRIVATE MACHINE // SECURE SESSION"
    }
    elseif ($Variant -eq "Ultrawide") {
        $subtitle = "WIDE-SCREEN GLOBAL INTELLIGENCE SURFACE"
    }

    if ($Variant -ne "Lock") {
        $graphics.DrawString($title, $fontLabel, $cyanTextBrush, [single]($Width * 0.074), [single]($Height * 0.80))
        $graphics.DrawString($subtitle, $fontMicro, $mutedTextBrush, [single]($Width * 0.076), [single]($Height * 0.842))
    }

    $signature = "LOCAL AI DEFENSE INTERFACE  //  GLOBAL WATCHBOARD THEME"
    $graphics.DrawString($signature, $fontTiny, $mutedTextBrush, [single]($Width * 0.64), [single]($Height * 0.925))

    $vignette = New-Object System.Drawing.Drawing2D.GraphicsPath
    $vignette.AddEllipse((New-Object System.Drawing.RectangleF([single](-$Width * 0.2), [single](-$Height * 0.25), [single]($Width * 1.4), [single]($Height * 1.5))))
    $vignetteBrush = New-Object System.Drawing.Drawing2D.PathGradientBrush($vignette)
    $vignetteBrush.CenterColor = New-Color 0 0 0 0
    $vignetteBrush.SurroundColors = @((New-Color 178 0 0 0))
    $graphics.FillRectangle($vignetteBrush, $canvas)
    $vignetteBrush.Dispose()
    $vignette.Dispose()

    $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Host "$Variant wallpaper created: $OutputPath"
}
finally {
    $graphics.Dispose()
    $bitmap.Dispose()
}
