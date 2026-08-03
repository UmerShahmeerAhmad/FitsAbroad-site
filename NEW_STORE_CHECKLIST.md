# FitsAbroad — New Store Checklist

Run through this every time you add a new store to `stores.html`.

## 1. Research keywords (free tools, ~5 minutes)
- [ ] Open `store-keyword-helper.html` locally (double-click it, don't deploy it)
- [ ] Type the store name or its niche (e.g. "TourRadar" or just "travel booking")
- [ ] Click all 4 buttons — this opens Google Trends, Google Search, AnswerThePublic, and Ubersuggest, each pre-filled
- [ ] In Google Search results, note anything under "People also search for" and "People also ask"
- [ ] In Google Trends, note any "Related queries" marked "Breakout" or with high relative interest
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