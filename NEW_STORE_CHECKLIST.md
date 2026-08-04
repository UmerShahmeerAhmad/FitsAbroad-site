# FitsAbroad — New Store Checklist

Run through this every time you add a new store to `stores.html`.

## 1. Research keywords (free tools, ~5 minutes)
- [ ] Open `store-keyword-helper.html` locally (double-click it, don't deploy it)
- [ ] Search the **brand name** first (e.g. "TourRadar") — mainly useful in Google Trends
- [ ] Then re-search using the **niche/category instead** (e.g. "tour booking discount") in all 4 tools — this is what actually triggers useful results
- [ ] In Google or Bing results, scroll to the bottom for "related searches" / "People also search for"
- [ ] In Google Trends, note any "Related queries" marked "Breakout" or with high relative interest
- [ ] In Reddit, skim 3-5 post titles/comments for phrases that repeat
- [ ] Pick 2-4 keywords that genuinely describe what the store offers — don't force in anything irrelevant just because it's trending

## 2. Generate the tags
- [ ] Paste your chosen keywords into the helper tool's textarea (one per line)
- [ ] Click "Generate ready-to-paste HTML"
- [ ] Click "Copy to clipboard"

## 3. Add the store card
- [ ] Open `stores.html`
- [ ] Copy an existing `<article class="store-card">` block as a starting point
- [ ] Fill in: 2-letter logo initials, store name, deal count
- [ ] Paste your generated `<div class="store-tags">...</div>` block in, right after the deal count line

## 4. Keep it honest
- [ ] Only add a store here if it has a real, matching entry on `deals.html` — don't list stores with no actual coupon behind them
- [ ] Double-check the keyword tags actually match what the store sells — irrelevant tags stuffed in for SEO can look spammy to both Google and visitors

## 5. Push it live
```powershell
git add .
git commit -m "Add [store name] with researched keyword tags"
git push
```