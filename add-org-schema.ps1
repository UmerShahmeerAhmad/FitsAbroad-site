$marker = "FitsAbroadOrgSchema"
$schema = @"
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "FitsAbroad",
  "url": "https://fitsabroad.com",
  "description": "Coupon and deals aggregator plus blog covering travel, fashion, and lifestyle brands."
}
</script>
<!-- $marker -->
"@

Get-ChildItem -Path . -Filter *.html -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -notmatch $marker) {
        $newContent = $content -replace "</head>", "$schema`n</head>"
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($_.Name)"
    } else {
        Write-Host "Skipped (already has schema): $($_.Name)"
    }
}