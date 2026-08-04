# Run this from inside your fitsabroad-site folder.
# It inserts the Consent Mode default snippet right before the
# "<!-- Google Analytics 4 -->" comment in every .html file, skipping
# any file that already has it (safe to re-run).

$snippet = @"
  <!-- Google Consent Mode: default state (must load BEFORE GA4/AdSense) -->
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('consent', 'default', {
      'ad_storage': 'denied',
      'ad_user_data': 'denied',
      'ad_personalization': 'denied',
      'analytics_storage': 'denied'
    });
  </script>

"@

Get-ChildItem -Filter *.html | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -notmatch "consent', 'default") {
        $newContent = $content -replace '(\s*<!-- Google Analytics 4 -->)', ($snippet + '$1')
        Set-Content -Path $_.FullName -Value $newContent -NoNewline
        Write-Host "Updated: $($_.Name)"
    } else {
        Write-Host "Skipped (already has it): $($_.Name)"
    }
}