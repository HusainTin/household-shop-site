(() => {
  "use strict";

  const C = window.SHOP_CONFIG || {};
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const fmt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });
  const money = (n) => (C.currency || "₹") + fmt.format(n);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ } },
  };

  const CACHE_KEY = "catalogue:v1";
  const state = {
    products: [],
    byId: new Map(),
    category: "All",
    query: "",
    basket: store.get("basket:v1", {}),
  };

  /* ---------------- Data: Google Sheet (CSV) ---------------- */

  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (quoted) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; } else quoted = false;
        } else field += c;
      } else if (c === '"') quoted = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c !== "\r") field += c;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows;
  }

  function rowsToObjects(rows) {
    const [head = [], ...body] = rows;
    const keys = head.map((h) => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, ""));
    return body
      .filter((r) => r.some((cell) => cell.trim()))
      .map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
  }

  const isYes = (v) => /^(y|yes|true|1)$/i.test(String(v ?? "").trim());
  const isNo = (v) => /^(n|no|false|0|out|out of stock)$/i.test(String(v ?? "").trim());
  const num = (v) => { const n = parseFloat(String(v ?? "").replace(/[^0-9.]/g, "")); return Number.isFinite(n) ? n : 0; };
  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  function normalise(p, i) {
    const name = String(p.name ?? "").trim();
    if (!name) return null;
    const images = [p.image, ...String(p.more_images ?? "").split(/[\n,]+/)].map((s) => String(s ?? "").trim()).filter(Boolean);
    return {
      id: String(p.id ?? "").trim() || slug(name) || `item-${i}`,
      name,
      category: String(p.category ?? "").trim() || "Other",
      brand: String(p.brand ?? "").trim(),
      price: num(p.price),
      mrp: num(p.mrp),
      unit: String(p.unit ?? "").trim(),
      images,
      description: String(p.description ?? "").trim(),
      inStock: !isNo(p.in_stock),
      featured: isYes(p.featured),
    };
  }

  async function fetchSheet() {
    const url = C.sheetCsvUrl + (C.sheetCsvUrl.includes("?") ? "&" : "?") + "t=" + Date.now();
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Sheet request failed (${res.status})`);
    const text = await res.text();
    if (/^\s*</.test(text)) throw new Error("Sheet returned HTML — is it published to the web as CSV?");
    return rowsToObjects(parseCSV(text));
  }

  /* ---------------- Images: Google Drive / URL / local file ---------------- */

  function driveId(src) {
    if (!/(drive|docs)\.google\.com/.test(src)) return null;
    const m = src.match(/\/d\/([\w-]{10,})/) || src.match(/[?&]id=([\w-]{10,})/);
    return m ? m[1] : null;
  }

  // Returns a list of URLs to try in order (later ones are fallbacks).
  function imageSources(src, width) {
    if (!src) return [];
    const id = driveId(src);
    if (id) return [`https://drive.google.com/thumbnail?id=${id}&sz=w${width}`, `https://lh3.googleusercontent.com/d/${id}=w${width}`];
    if (/^https?:\/\//i.test(src)) return [src];
    return ["images/" + src.replace(/^\/+/, "")];
  }

  function initials(name) {
    return name.split(/\s+/).filter((w) => /[a-z0-9]/i.test(w)).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  }
  function hue(text) {
    let h = 0;
    for (const ch of text) h = (h * 31 + ch.charCodeAt(0)) % 360;
    return h;
  }

  // Placeholder tile always sits underneath; the image covers it once loaded and is removed if every source fails.
  function mediaHTML(p, src, width, eager = false) {
    const sources = imageSources(src, width);
    const img = sources.length
      ? `<img src="${esc(sources[0])}" data-fallbacks="${esc(sources.slice(1).join("|"))}" alt="${esc(p.name)}" ${eager ? "" : 'loading="lazy"'} decoding="async" referrerpolicy="no-referrer">`
      : "";
    return `<div class="media"><span class="ph" style="--h:${hue(p.category)}" aria-hidden="true">${esc(initials(p.name))}</span>${img}</div>`;
  }

  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset || !("fallbacks" in img.dataset)) return;
    const rest = img.dataset.fallbacks ? img.dataset.fallbacks.split("|") : [];
    if (rest.length) { img.dataset.fallbacks = rest.slice(1).join("|"); img.src = rest[0]; }
    else img.remove();
  }, true);

  /* ---------------- Rendering ---------------- */

  function priceHTML(p) {
    const off = p.mrp > p.price && p.price > 0 ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    return `<div class="price"><strong>${p.price ? money(p.price) : "Ask for price"}</strong>${off ? `<s>${money(p.mrp)}</s><span class="off">${off}% off</span>` : ""}</div>`;
  }

  function controlHTML(id) {
    const p = state.byId.get(id);
    if (!p) return "";
    if (!p.inStock) return `<button class="add" disabled>Out of stock</button>`;
    const qty = state.basket[id] || 0;
    if (!qty) return `<button class="add" data-add="${esc(id)}">Add</button>`;
    return `<div class="stepper"><button data-dec="${esc(id)}" aria-label="Remove one">−</button><span aria-live="polite">${qty}</span><button data-inc="${esc(id)}" aria-label="Add one">+</button></div>`;
  }

  function cardHTML(p) {
    const off = p.mrp > p.price && p.price > 0 ? Math.round((1 - p.price / p.mrp) * 100) : 0;
    const badge = !p.inStock ? `<span class="badge out">Out of stock</span>` : off >= 5 ? `<span class="badge">${off}% off</span>` : "";
    return `<article class="card">
      <button class="card-media" data-open="${esc(p.id)}" aria-label="View ${esc(p.name)}">${mediaHTML(p, p.images[0], 400)}${badge}</button>
      <div class="card-body">
        <p class="brand">${esc(p.brand)}</p>
        <h3><button data-open="${esc(p.id)}">${esc(p.name)}</button></h3>
        <p class="unit">${esc(p.unit)}</p>
        ${priceHTML(p)}
        <div class="ctl" data-ctl="${esc(p.id)}">${controlHTML(p.id)}</div>
      </div>
    </article>`;
  }

  function renderChips() {
    const cats = ["All", ...new Set(state.products.map((p) => p.category))];
    if (!cats.includes(state.category)) state.category = "All";
    $("#chips").innerHTML = cats
      .map((c) => `<button class="chip" data-cat="${esc(c)}" aria-pressed="${c === state.category}">${esc(c)}</button>`)
      .join("");
  }

  function matches(p, q) {
    if (!q) return true;
    const hay = `${p.name} ${p.brand} ${p.category} ${p.unit} ${p.description} ${p.id}`.toLowerCase();
    return q.split(/\s+/).every((word) => hay.includes(word));
  }

  function renderGrid() {
    const q = state.query.trim().toLowerCase();
    const list = state.products.filter((p) => (state.category === "All" || p.category === state.category) && matches(p, q));
    const featured = state.products.filter((p) => p.featured);
    const showFeatured = state.category === "All" && !q && featured.length > 0;

    $("#featuredBlock").hidden = !showFeatured;
    if (showFeatured) $("#featured").innerHTML = featured.map(cardHTML).join("");

    $("#resultInfo").textContent = q ? `${list.length} result${list.length === 1 ? "" : "s"} for “${state.query.trim()}”` : "";
    $("#grid").innerHTML = list.length
      ? list.map(cardHTML).join("")
      : `<p class="empty-state">No products found. Try another word, or <a href="${waLink("Hello, I'm looking for: " + state.query)}" target="_blank" rel="noopener">ask us on WhatsApp</a>.</p>`;
  }

  function renderAll() {
    renderChips();
    renderGrid();
    renderBasket();
  }

  function refreshControls(id) {
    $$(`[data-ctl="${CSS.escape(id)}"]`).forEach((el) => { el.innerHTML = controlHTML(id); });
  }

  /* ---------------- Product dialog ---------------- */

  const productDialog = $("#productDialog");

  function openProduct(id, { pushHash = true } = {}) {
    const p = state.byId.get(id);
    if (!p) return;
    const thumbs = p.images.length > 1
      ? `<div class="thumbs">${p.images.map((src, i) => `<button data-thumb="${i}" aria-current="${i === 0}" aria-label="Photo ${i + 1}">${mediaHTML(p, src, 160)}</button>`).join("")}</div>`
      : "";
    $("#pdBody").innerHTML = `
      <div><div id="pdMain">${mediaHTML(p, p.images[0], 900, true)}</div>${thumbs}</div>
      <div>
        <p class="brand">${esc([p.brand, p.category].filter(Boolean).join(" · "))}</p>
        <h2 id="pdName">${esc(p.name)}</h2>
        <p class="unit">${esc(p.unit)}</p>
        ${priceHTML(p)}
        ${p.inStock ? "" : `<p class="stock-out">Currently out of stock — message us and we'll let you know when it's back.</p>`}
        ${p.description ? `<p class="desc">${esc(p.description)}</p>` : ""}
        <div class="ctl" data-ctl="${esc(p.id)}">${controlHTML(p.id)}</div>
        <div class="actions">
          <a class="btn wa" target="_blank" rel="noopener" href="${waLink(`Hello ${C.name}, I'm interested in: ${p.name}${p.unit ? ` (${p.unit})` : ""} — ${p.price ? money(p.price) : "price?"}\n${productUrl(p.id)}`)}">${p.inStock ? "Ask / order on WhatsApp" : "Notify me on WhatsApp"}</a>
          <button class="btn ghost" data-share="${esc(p.id)}" style="color:var(--brand)">Share this product</button>
        </div>
      </div>`;
    $$("[data-thumb]", productDialog).forEach((btn) => btn.addEventListener("click", () => {
      $("#pdMain").innerHTML = mediaHTML(p, p.images[+btn.dataset.thumb], 900, true);
      $$("[data-thumb]", productDialog).forEach((b) => b.setAttribute("aria-current", String(b === btn)));
    }));
    if (pushHash) history.replaceState(null, "", "#p=" + encodeURIComponent(p.id));
    if (!productDialog.open) productDialog.showModal();
  }

  productDialog.addEventListener("close", () => {
    if (location.hash.startsWith("#p=")) history.replaceState(null, "", location.pathname + location.search);
  });

  function productUrl(id) {
    return location.origin + location.pathname + "#p=" + encodeURIComponent(id);
  }

  async function share(id) {
    const p = state.byId.get(id);
    const url = productUrl(id);
    try {
      if (navigator.share) { await navigator.share({ title: p.name, text: `${p.name} at ${C.name}`, url }); return; }
      await navigator.clipboard.writeText(url);
      toast("Link copied");
    } catch { /* user cancelled */ }
  }

  /* ---------------- Basket ---------------- */

  const basketDialog = $("#basketDialog");

  function basketItems() {
    return Object.entries(state.basket)
      .map(([id, qty]) => ({ p: state.byId.get(id), qty }))
      .filter((x) => x.p && x.qty > 0);
  }

  function setQty(id, qty) {
    if (qty > 0) state.basket[id] = Math.min(qty, 99);
    else delete state.basket[id];
    store.set("basket:v1", state.basket);
    refreshControls(id);
    renderBasket();
  }

  function renderBasket() {
    // Only prune once real data has loaded, so a slow sheet doesn't wipe the basket.
    if (state.products.length) {
      for (const id of Object.keys(state.basket)) if (!state.byId.has(id)) delete state.basket[id];
    }
    const items = basketItems();
    const count = items.reduce((n, x) => n + x.qty, 0);
    const total = items.reduce((n, x) => n + x.qty * x.p.price, 0);

    const badge = $("#basketCount");
    badge.hidden = count === 0;
    badge.textContent = count;

    $("#basketEmpty").hidden = items.length > 0;
    $("#orderForm").hidden = items.length === 0;
    $("#basketTotal").textContent = money(total);
    $("#basketLines").innerHTML = items.map(({ p, qty }) => `
      <li class="line">
        ${mediaHTML(p, p.images[0], 160)}
        <div>
          <div class="line-name">${esc(p.name)}</div>
          <div class="line-meta">${esc(p.unit)}${p.unit ? " · " : ""}${money(p.price)} each</div>
          <div class="stepper"><button data-dec="${esc(p.id)}" aria-label="Remove one">−</button><span>${qty}</span><button data-inc="${esc(p.id)}" aria-label="Add one">+</button></div>
        </div>
        <div class="line-total">${money(qty * p.price)}</div>
      </li>`).join("");
  }

  function orderMessage(form) {
    const items = basketItems();
    const total = items.reduce((n, x) => n + x.qty * x.p.price, 0);
    const lines = items.map(({ p, qty }, i) =>
      `${i + 1}. ${p.name}${p.unit ? ` (${p.unit})` : ""} × ${qty} = ${money(qty * p.price)}  [${p.id}]`);
    const name = form.name.value.trim();
    const address = form.address.value.trim();
    const note = form.note.value.trim();
    const msg = [
      `Hello ${C.name}, I'd like to place an order:`,
      "",
      ...lines,
      "",
      `Total: ${money(total)} (${items.reduce((n, x) => n + x.qty, 0)} items)`,
      "",
      `Name: ${name}`,
    ];
    if (address) msg.push(`Address: ${address}`);
    if (note) msg.push(`Note: ${note}`);
    return msg.join("\n");
  }

  function waLink(text) {
    return `https://wa.me/${String(C.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
  }

  const form = $("#orderForm");
  const savedCustomer = store.get("customer:v1", {});
  form.name.value = savedCustomer.name || "";
  form.address.value = savedCustomer.address || "";

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!basketItems().length) return;
    store.set("customer:v1", { name: form.name.value.trim(), address: form.address.value.trim() });
    window.open(waLink(orderMessage(form)), "_blank", "noopener");
    toast("WhatsApp opened — tap send to confirm your order");
  });

  $("#clearBasket").addEventListener("click", () => {
    if (!confirm("Remove all items from your basket?")) return;
    const ids = Object.keys(state.basket);
    state.basket = {};
    store.set("basket:v1", state.basket);
    ids.forEach(refreshControls);
    renderBasket();
  });

  /* ---------------- Events ---------------- */

  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-add],[data-inc],[data-dec],[data-open],[data-cat],[data-close],[data-share]");
    if (!t) return;
    const d = t.dataset;
    if ("add" in d) { setQty(d.add, 1); toast("Added to basket"); }
    else if ("inc" in d) setQty(d.inc, (state.basket[d.inc] || 0) + 1);
    else if ("dec" in d) setQty(d.dec, (state.basket[d.dec] || 0) - 1);
    else if ("open" in d) openProduct(d.open);
    else if ("share" in d) share(d.share);
    else if ("close" in d) t.closest("dialog").close();
    else if ("cat" in d) {
      state.category = d.cat;
      $$(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === d.cat)));
      renderGrid();
    }
  });

  // Click on the dark backdrop closes dialogs.
  [productDialog, basketDialog].forEach((dlg) => dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); }));

  $("#openBasket").addEventListener("click", () => basketDialog.showModal());

  let searchTimer;
  $("#search").addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      state.query = e.target.value;
      if (state.query && state.category !== "All") {
        state.category = "All";
        $$(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.cat === "All")));
      }
      renderGrid();
    }, 150);
  });

  window.addEventListener("hashchange", openFromHash);
  function openFromHash() {
    const m = location.hash.match(/^#p=(.+)$/);
    if (m) openProduct(decodeURIComponent(m[1]), { pushHash: false });
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  /* ---------------- Shop details ---------------- */

  function applyConfig() {
    if (C.brandColour) document.documentElement.style.setProperty("--brand", C.brandColour);
    document.title = C.name + " — order on WhatsApp";
    $$("[data-shop-name]").forEach((el) => { el.textContent = C.name; });
    $("#tagline").textContent = C.tagline || "";
    $("#deliveryNote").textContent = C.deliveryNote || "";
    $("#basketDelivery").textContent = C.deliveryNote || "";
    $("#address").textContent = C.address || "";
    $("#timings").textContent = C.timings || "";
    const phone = $("#phone");
    phone.textContent = C.phone || "";
    phone.href = "tel:" + String(C.phone || "").replace(/[^\d+]/g, "");
    const email = $("#email");
    if (C.email) { email.textContent = C.email; email.href = "mailto:" + C.email; }
    else { email.parentElement.remove(); $("#emailLabel").remove(); }
    const hello = waLink(`Hello ${C.name}, `);
    ["#heroWhatsApp", "#contactWhatsApp", "#waFloat"].forEach((s) => { $(s).href = hello; });
    $("#mapsLink").href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(C.address || C.name);
    if (C.mapEmbedUrl) $("#map").innerHTML = `<iframe src="${esc(C.mapEmbedUrl)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Map"></iframe>`;
    $("#year").textContent = new Date().getFullYear();
  }

  /* ---------------- Boot ---------------- */

  function setProducts(rawList) {
    state.products = rawList.map(normalise).filter(Boolean);
    state.byId = new Map(state.products.map((p) => [p.id, p]));
    renderAll();
  }

  async function boot() {
    applyConfig();
    renderBasket();

    if (!C.sheetCsvUrl) {
      setProducts(window.SAMPLE_PRODUCTS || []);
      openFromHash();
      return;
    }

    // Show the last copy instantly, then refresh from the sheet in the background.
    const cached = store.get(CACHE_KEY, null);
    if (cached && Array.isArray(cached.rows)) { setProducts(cached.rows); openFromHash(); }

    try {
      const rows = await fetchSheet();
      const changed = !cached || JSON.stringify(cached.rows) !== JSON.stringify(rows);
      store.set(CACHE_KEY, { rows, at: Date.now() });
      if (changed) { setProducts(rows); if (!cached) openFromHash(); }
    } catch (err) {
      console.warn("[catalogue]", err);
      if (!cached) { setProducts(window.SAMPLE_PRODUCTS || []); openFromHash(); toast("Could not load the latest catalogue"); }
    }
  }

  boot();
})();
