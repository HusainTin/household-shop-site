/**
 * SHOP SETTINGS — edit these to personalise the site.
 * Products, prices and photos live in the Google Sheet, not here (see README.md).
 */
export const shop = {
  name: "Daily Needs Store",
  tagline: "Bottles, tiffins & everyday home essentials — delivered locally.",
  description:
    "Water bottles, tiffins, lunch boxes, kitchen storage and everyday home essentials. Order on WhatsApp for local home delivery.",

  /** Number that receives orders: country code + number, digits only. */
  whatsapp: "919999999999",
  phone: "+91 99999 99999",
  email: "",

  address: "Shop No. 1, Main Road, Your Area, Your City – 000000",
  city: "Your City",
  timings: "Mon – Sat: 10:00 am – 8:30 pm · Sun: closed",
  deliveryNote: "Free home delivery within 5 km on orders above ₹500.",

  /** Optional: Google Maps → Share → Embed a map → copy only the src="..." URL. */
  mapEmbedUrl: "",

  /** Shown in the basket and on product pages. */
  paymentNote: "Pay by cash or UPI when your order arrives.",

  /** Ticks under the hero headline. */
  heroPoints: ["No app or sign-up", "Pay on delivery", "Genuine brands"],

  /** Four short promises shown under the hero. Icons: truck, shield, wallet, chat. */
  highlights: [
    { icon: "truck", title: "Free local delivery", text: "Within 5 km on orders above ₹500" },
    { icon: "shield", title: "Genuine brands", text: "Milton, Cello, Prestige and more" },
    { icon: "wallet", title: "Pay on delivery", text: "Cash or UPI at your door" },
    { icon: "chat", title: "Order on WhatsApp", text: "Quick replies, no app needed" },
  ],

  currency: "₹",
  /** Main colour used for buttons, links and tinted backgrounds. */
  brandColour: "#0f766e",
} as const;

/**
 * Published Google Sheet CSV link. Set SHEET_CSV_URL in your hosting dashboard
 * (or in .env.local for local testing). Empty → sample products are shown.
 */
export const sheetCsvUrl = process.env.SHEET_CSV_URL ?? "";

/** Public address of the site, used for sharing links, SEO and the sitemap. */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");
