# 99acres — Farm Houses in Gurgaon (scraped dataset)

Source: https://www.99acres.com/farm-house-in-gurgaon-ffid
Scraped: 2026-09-09 · 442 listings (site's own count: 442) · 18 SRP pages

Data comes from the page's own `window.__initialData__` state object, not HTML parsing —
so fields are the site's native values, not scraped text.

## Files

| File | What |
|---|---|
| `farmhouses-gurgaon.csv` | Main dataset — 442 rows × 52 columns |
| `farmhouses-gurgaon.json` | Same data as JSON |
| `raw-json/page-N.json` | Untouched raw tuples (140 fields each) — use if you need a field I didn't map |
| `facets.json` | Code→label lookups (furnishing, features, facing, age buckets…) + site-wide facet counts |
| `images/<PROP_ID>/NN.jpg` | 4,287 images across 401 listings (135 MB) |
| `videos/<PROP_ID>/<VIDEO_ID>.ts` | 189 property videos, highest available resolution (6.0 GB) |
| `images-manifest.json`, `videos-manifest.json` | URL → local file mapping |
| `*-failures.log` | What didn't download and why |

## Columns (52)

**Identity** `prop_id` `spid` `heading` `url`
**Type** `property_type` `transaction` `listing_by`
**Location** `city` `locality` `locality_full` `society` `address` `latitude` `longitude`
**Price** `price_display` `price_inr` (numeric ₹) `price_in_words` `price_per_sqft`
**Size** `area_display` `super_area` `area_sqft` `area_unit`
**Config** `bedrooms` `bathrooms` `balconies` `total_floors` `furnishing` `facing` `age` `ownership`
**Flags** `gated` `corner_property` `reserved_parking` `verified` `rera` `poster_rera_registered`
**Seller** `contact_name` `contact_company` `brokerage`
**Extras** `amenities` `features` `overlooking` `availability` `description`
**Dates** `posting_date` `update_date`
**Media** `image_count` `images` `video_count` `video_hls` `video_youtube` `video_ids`

`price_inr` is the numeric rupee value (use this for analysis, not `price_display`).
`amenities`/`features` are decoded to labels, pipe-separated.
Every row has lat/long. 441 of 442 have a price.

## Known gaps

- **22 images** returned 404 from 99acres' own CDN (dead files on their side).
- **37 videos** are YouTube-only or their HLS returned 404 — links are in the
  `video_youtube` column. Downloading those needs `yt-dlp` (not installed).
- **Phone numbers** are not in the page state — 99acres masks them behind a
  login + contact form, so they're not in this dataset.

## Videos are `.ts` (MPEG-TS)

They're HLS segments concatenated raw, since ffmpeg isn't installed here.
VLC plays them as-is. To remux to mp4 (no re-encode, seconds per file):

    brew install ffmpeg
    cd videos && for f in */*.ts; do ffmpeg -i "$f" -c copy "${f%.ts}.mp4"; done

## Re-running

    node scrape.mjs    # fetches SRP pages → raw-json/ (skips cached pages)
    node flatten.mjs   # raw-json/ → CSV + JSON + manifests
    node images.mjs    # downloads images (resumable)
    node videos.mjs    # downloads videos (resumable)

`scrape.mjs` needs a real browser — 99acres sits behind Akamai and returns 403
to plain curl, including on robots.txt. It uses Playwright from the Dhando repo's
node_modules and runs headed with ~3s between pages.

Note this is a one-off personal snapshot. 99acres' terms don't permit scraping,
so don't redistribute or republish this data.
