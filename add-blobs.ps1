# Run this from inside your FitsAbroad project folder.
# Inserts two decorative blob divs right after the opening tag of
# .hero, .blog-intro, .page-header, and .article-header sections.

$blobMarkup = @"
    <div class="organic-blob organic-blob-clay"></div>
    <div class="organic-blob organic-blob-moss"></div>
"@

$patterns = @(
    '<section class="hero">',
    '<section class="blog-intro">',
    '<section class="page-header">',
    '<section class="article-header">'
)

Get-ChildItem -Filter *.html | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $changed = $false

    foreach ($pattern in $patterns) {
        if ($content -match [regex]::Escape($pattern) -and $content -notmatch "organic-blob") {
            $replacement = $pattern + "`n" + $blobMarkup
            $content = $content -replace [regex]::Escape($pattern), [regex]::Escape($replacement) -replace '\\', ''
            $changed = $true
        }
    }

    if ($changed) {
        Set-Content -Path $_.FullName -Value $content -NoNewline
        Write-Host "Updated: $($_.Name)"
    } else {
        Write-Host "Skipped (no matching section, or already has blobs): $($_.Name)"
    }
}