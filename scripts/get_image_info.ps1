Add-Type -AssemblyName System.Drawing
$path = 'c:\Users\HP\Documents\dataworld\screen.png'
if (-not (Test-Path $path)) { Write-Error "File not found: $path"; exit 2 }
$img = [System.Drawing.Image]::FromFile($path)
Write-Output "WIDTH:$($img.Width)"
Write-Output "HEIGHT:$($img.Height)"
Write-Output "H_DPI:$([math]::Round($img.HorizontalResolution,2))"
Write-Output "V_DPI:$([math]::Round($img.VerticalResolution,2))"
$img.Dispose()
