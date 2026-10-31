/*
 * SHOP SETTINGS — the only file you need to edit to personalise the site.
 * Products and prices live in the Google Sheet (see README.md), not here.
 */
window.SHOP_CONFIG = {
  name: "Daily Needs Store",
  tagline: "Bottles, tiffins & everyday home essentials — delivered locally.",

  // WhatsApp number that receives orders: country code + number, digits only (no +, spaces or dashes).
  whatsapp: "919999999999",
  phone: "+91 99999 99999",
  email: "",

  address: "Shop No. 1, Main Road, Your Area, Your City – 000000",
  timings: "Mon – Sat: 10:00 am – 8:30 pm · Sun: closed",
  deliveryNote: "Free home delivery within 5 km on orders above ₹500.",

  // Optional: Google Maps → Share → Embed a map → copy only the src="..." URL.
  mapEmbedUrl: "",

  // Google Sheet → File → Share → Publish to web → Products tab → CSV → copy link.
  // Leave empty to show the sample products in data/products.js.
  sheetCsvUrl: "",

  currency: "₹",
  brandColour: "#0f766e",
};
