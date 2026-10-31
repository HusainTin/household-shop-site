# Shop catalogue website: setup guide

A free catalogue website. Products come from a **Google Sheet**, photos from **Google Drive**, and customers send orders through **WhatsApp**. There is no server or database, and hosting costs nothing.

```
Google Sheet (products) ──► website reads it live ──► customer adds to basket ──► order sent on WhatsApp
Google Drive (photos)  ──► link pasted in sheet
```

---

## 1. Create the product sheet (one-off, 10 min)

1. Upload `products-template.xlsx` to Google Drive.
2. Open it and choose **File → Save as Google Sheets**. The site can't read `.xlsx` files directly.
3. Delete the sample rows and add your products. Keep the heading row exactly as it is.

| Column | Required | What to enter | Example |
|---|---|---|---|
| `id` | yes | Unique code. Never change or reuse it once live, because basket and share links depend on it. | `WB001` |
| `name` | yes | Product name | `Steel Water Bottle` |
| `category` | yes | Becomes a filter tab. Spell it the same way every time. | `Water Bottles` |
| `brand` | – | Brand name | `Milton` |
| `price` | yes | Selling price, numbers only | `649` |
| `mrp` | – | If higher than `price`, a "% off" badge shows | `799` |
| `unit` | – | Size or pack | `1 litre`, `Set of 4` |
| `image` | – | Google Drive link to the main photo | `https://drive.google.com/file/d/…/view` |
| `more_images` | – | Extra Drive links, separated by commas | |
| `description` | – | Short details for the product page | |
| `in_stock` | – | `yes` / `no`. Blank counts as in stock. | `yes` |
| `featured` | – | `yes` shows the product under "Best sellers" | `yes` |

> ⚠️ **The published sheet is public.** Keep cost prices, supplier details and margins in a **separate file**, not just a separate tab.

## 2. Photos on Google Drive

1. Create a Drive folder, e.g. `Website Photos`.
2. Right-click the folder → **Share** → General access: **Anyone with the link → Viewer**. Every photo in it inherits this.
3. Upload photos. Name each file after its product id, e.g. `WB001.jpg`, so they're easy to find.
4. Right-click a photo → **Share → Copy link**, then paste it into the `image` column.

**Photo tips:** square, plain white background, good light, **under 500 KB**. A tile with the product's initials shows if a photo is missing or fails to load.

> Drive works well for starting out (up to ~100–200 products). If photos start loading slowly, move them to Cloudinary (free) and paste those links instead. Nothing in the code needs to change.

## 3. Connect the sheet to the website

1. In the Google Sheet: **File → Share → Publish to web**.
2. Choose the **Products** tab and the **Comma-separated values (.csv)** format, then click **Publish**.
3. Copy the link. It looks like `https://docs.google.com/spreadsheets/d/e/2PACX-…/pub?gid=0&single=true&output=csv`.
4. Paste it into `config.js` → `sheetCsvUrl`.

## 4. Shop details

Edit `config.js`: shop name, WhatsApp number (digits only with country code, e.g. `919876543210`), address, opening hours, delivery note and brand colour. To embed a map, go to Google Maps → Share → **Embed a map**, copy only the `src` URL, and paste it into `mapEmbedUrl`.

## 5. Put it online for free

**Easiest: Netlify Drop (no account set-up needed to try)**
1. Go to https://app.netlify.com/drop.
2. Drag the whole `site` folder onto the page. You get a live link straight away.
3. Create a free account to keep the site and rename it (e.g. `yourshop.netlify.app`).

**Recommended for the long term: Cloudflare Pages (free, unlimited bandwidth)**
1. Put this folder in a GitHub repository.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repository.
3. Build command: *(leave empty)*. Output directory: `/` (or `site` if the repository root sits above it).
4. Every push to GitHub updates the site automatically.

**Custom domain (optional, about ₹600–900 a year):** buy `yourshop.in` from any registrar and add it in Netlify or Cloudflare. Register it in the **shop owner's name**.

---

## Day-to-day updates (no developer needed)

| Task | What to do | When it shows on the site |
|---|---|---|
| Change a price | Edit the `price` cell | about 5 min (Google's publish delay) |
| Out of stock | Set `in_stock` to `no` | about 5 min |
| New product | Add a row, upload a photo, paste its link | about 5 min |
| Remove a product | Delete the row | about 5 min |

Customers see the last loaded catalogue instantly, then the site refreshes it in the background.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page layout |
| `styles.css` | Look and feel |
| `app.js` | Loads the sheet, handles Drive images, search, filters, basket and the WhatsApp order |
| `config.js` | **Shop settings: edit this** |
| `data/products.js` | Sample products, used only until `sheetCsvUrl` is set |
| `images/` | Optional: photos placed here can be referenced by filename (e.g. `WB001.jpg`) instead of a Drive link |
| `products-template.xlsx` / `.csv` | Starting template for the Google Sheet |

## Test locally

```bash
python3 -m http.server 5173
```
Then open http://localhost:5173.
