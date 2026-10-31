# Shop catalogue website (Next.js)

Catalogue website for a local distributor. Products come from a **Google Sheet**, photos from **Google Drive**, and customers send orders through **WhatsApp**. There's no database or admin panel to maintain: the owner edits the sheet and the site updates itself.

```
Google Sheet (products) ─┐
Google Drive (photos) ───┤──► Next.js pre-builds every page ──► customer browses ──► basket ──► WhatsApp order
                         └── refreshed every 5 min (or instantly via the refresh link)
```

**Stack:** Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4. No database.

## What you get

- Home page with best sellers, search, category filters and contact details/map
- A page per category (`/category/water-bottles`) and per product (`/product/wb001`), each **pre-built as static HTML** so it's fast and Google can index it
- SEO: page titles and descriptions, canonical URLs, Product and Store structured data (prices can show in Google results), `sitemap.xml`, `robots.txt`
- WhatsApp link previews show the product photo, name and price
- Basket saved in the visitor's browser. "Send order on WhatsApp" fills in the full order message (items, quantities, total, name, address).
- Drive photos load at the right size for each spot (card, product page, basket). A coloured initials tile shows when a photo is missing.

---

## 1. Product sheet

1. Upload `products-template.xlsx` to Google Drive, open it, then choose **File → Save as Google Sheets**.
2. Keep the heading row as it is and replace the sample rows.

| Column | Required | What to enter | Example |
|---|---|---|---|
| `id` | yes | Unique code. Never change or reuse it, because it's the product's web address. | `WB001` |
| `name` | yes | Product name | `Steel Water Bottle` |
| `category` | yes | Becomes a filter tab and a category page. Spell it the same way every time. | `Water Bottles` |
| `brand` | – | | `Milton` |
| `price` | yes | Selling price, numbers only | `649` |
| `mrp` | – | If higher than `price`, a "% off" badge shows | `799` |
| `unit` | – | Size or pack | `1 litre` |
| `image` | – | Google Drive share link of the main photo | |
| `more_images` | – | Extra Drive links, separated by commas | |
| `description` | – | | |
| `in_stock` | – | `yes` / `no` (blank counts as in stock) | |
| `featured` | – | `yes` shows the product under "Best sellers" | |

> ⚠️ The published sheet is **public**. Keep cost prices, supplier details and margins in a separate file.

## 2. Photos on Google Drive

1. Create a folder (e.g. `Website Photos`) → **Share** → General access: **Anyone with the link → Viewer**.
2. Upload photos, named after the product id (`WB001.jpg`). Use square photos on a white background, under 500 KB.
3. Right-click a photo → **Share → Copy link**, then paste it into the `image` column.

The `image` column also accepts any direct image URL (e.g. Cloudinary), or a filename placed in `public/images/`. Switch whenever you like: only the sheet changes, not the code.

## 3. Connect the sheet

**File → Share → Publish to web** → choose the **Products** tab → **CSV** → **Publish**, then copy the link.

Set these environment variables in your hosting dashboard. For local testing, put them in `.env.local` (see `.env.example`):

| Variable | Value |
|---|---|
| `SHEET_CSV_URL` | The published CSV link |
| `NEXT_PUBLIC_SITE_URL` | Your live address, e.g. `https://dailyneeds.netlify.app` |
| `REFRESH_KEY` | Any long random word (used by the instant-refresh link) |

If `SHEET_CSV_URL` isn't set, the site shows sample products.

## 4. Shop details

Edit `src/shop.config.ts`: shop name, WhatsApp number (digits with country code, e.g. `919876543210`), address, city, opening hours, delivery note, map embed URL and brand colour.

---

## How updates reach the site

| Owner does | Shows on the site |
|---|---|
| Edits price or stock, adds or deletes a row | Within about **5–10 minutes**. Google takes a few minutes to republish the CSV, and the site re-reads it every 5 minutes. |
| Wants it **now** | Open the bookmarked link `https://YOUR-SITE/api/refresh?key=YOUR_REFRESH_KEY`. The next page load fetches the sheet. Google's own publish delay still applies. |
| Changes shop details in `shop.config.ts` | Needs a redeploy (push to GitHub) |

A new product row gets its own page automatically on its first visit. No rebuild is needed.

The refresh interval lives in `next.config.ts` under `cacheLife.catalogue`.

---

## Deploying for free

> **Not on Vercel's free (Hobby) plan.** Hobby is limited to non-commercial, personal use, and a shop website counts as commercial. Vercel Pro (~$20 a month) is fine if you'd rather pay.

**Recommended: Netlify (free plan, commercial use allowed, supports Next.js 16 with no extra setup)**
1. Push this folder to a GitHub repository.
2. Netlify → **Add new site → Import from Git** → pick the repository. Netlify detects Next.js automatically.
3. **Site configuration → Environment variables**: add the three variables above.
4. Deploy. Then check that the 5-minute refresh and `/api/refresh` work on the live site (see "Test after deploying").

**Alternative: Cloudflare Workers** (generous free tier) using the [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) adapter. It needs a little more setup.

**Custom domain** (about ₹600–900 a year): buy `yourshop.in` and add it in Netlify → Domain management. Register it in the **shop owner's name**, then update `NEXT_PUBLIC_SITE_URL`.

**After going live:** add the site to [Google Search Console](https://search.google.com/search-console) and submit `https://YOUR-SITE/sitemap.xml`. Create a free **Google Business Profile** and link it to the site.

### Test after deploying
1. Change one price in the sheet, wait about 10 minutes, and reload the product page. The new price should show.
2. Open `/api/refresh?key=…`, then reload. It should show "Done", then the latest data.
3. Paste a product link into WhatsApp. The preview should show the photo, name and price.

---

## Development

```bash
npm install
npm run dev
```

Open http://localhost:3000. Other commands: `npm run build`, `npm run start` and `npm run lint`.

| Path | Purpose |
|---|---|
| `src/shop.config.ts` | **Shop settings** |
| `src/lib/products.ts` | Reads and caches the Google Sheet, cleans up the rows |
| `src/lib/images.ts` | Converts Drive, URL and filename values to image URLs |
| `src/lib/csv.ts` | CSV parser |
| `src/lib/basket-store.ts` | Basket stored in the browser (localStorage) |
| `src/lib/sample-products.ts` | Sample data shown until a sheet is connected |
| `src/app/` | Pages: home, `category/[slug]`, `product/[id]`, sitemap, robots, `api/refresh` |
| `src/components/` | Catalogue, product card, basket drawer, gallery and so on |
| `products-template.xlsx` / `.csv` | Starting template for the Google Sheet |
