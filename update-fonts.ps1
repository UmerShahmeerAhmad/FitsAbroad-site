# Run this from inside your FitsAbroad project folder.
# Swaps the Poppins/Inter font link for Fraunces/Nunito across every .html file.

$oldLink = '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">'
$newLink = '<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600..800&family=Nunito:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">'

Get-ChildItem -Filter *.html | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match [regex]::Escape($oldLink)) {
        $updated = $content -replace [regex]::Escape($oldLink), $newLink
        Set-Content -Path $_.FullName -Value $updated -NoNewline
        Write-Host "Updated: $($_.Name)"
    } else {
        Write-Host "Skipped (pattern not found, check manually): $($_.Name)"
    }
}