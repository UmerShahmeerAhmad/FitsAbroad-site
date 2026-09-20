$path = "stores.html"
$content = Get-Content $path -Raw

function Get-Slug($text) {
    $slug = $text.Trim().ToLower()
    $slug = $slug -replace "&", "and"
    $slug = $slug -replace "[’'\.]", ""
    $slug = $slug -replace "[^a-z0-9]+", "-"
    $slug = $slug.Trim('-')
    return $slug
}

$pattern = '(?s)(<article class="store-card"[^>]*data-store-id="([^"]+)".*?<a href=")([^"]*)("[^>]*>View coupons)'

$newContent = [regex]::Replace($content, $pattern, {
    param($m)
    $storeId = $m.Groups[2].Value
    $slug = Get-Slug $storeId
    return $m.Groups[1].Value + "deals.html?store=$slug" + $m.Groups[4].Value
})

Set-Content -Path $path -Value $newContent -NoNewline
Write-Host "Done. Store links updated."