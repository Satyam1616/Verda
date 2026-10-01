// AI Systems — front-end controller (self-contained, no imports).
// Tabs + four modules (catalog, proposal, impact, support) talking to the
// Express API. Clean rendering; all AI output comes from Groq via the server.

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  setupTheme();
  initCatalog();
  initProposal();
  initImpact();
  initSupport();
});

const ACTIVE = ["bg-brand-soft", "dark:bg-brand/15", "text-brand"];
const INACTIVE = ["text-stone-500", "hover:text-stone-900", "dark:hover:text-stone-100"];

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".section");
  const show = (id) => {
    sections.forEach((s) => s.classList.toggle("hidden", s.id !== id));
    buttons.forEach((b) => {
      const on = b.dataset.target === id;
      ACTIVE.forEach((c) => b.classList.toggle(c, on));
      INACTIVE.forEach((c) => b.classList.toggle(c, !on));
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  buttons.forEach((b) => b.addEventListener("click", () => show(b.dataset.target)));
  document.querySelectorAll("[data-go]").forEach((el) => el.addEventListener("click", () => show(el.dataset.go)));
  show("overview");
}

function setupTheme() {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark");
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
  });
}

function loading(mod, on, label) {
  const loader = document.getElementById(`${mod}-loader`);
  const text = document.getElementById(`${mod}-btn-text`);
  const err = document.getElementById(`${mod}-error`);
  if (loader) loader.classList.toggle("hidden", !on);
  if (text && label) text.textContent = on ? label.loading : label.idle;
  if (on && err) err.classList.add("hidden");
}

function fail(mod, msg) {
  const err = document.getElementById(`${mod}-error`);
  if (err) { err.textContent = msg; err.classList.remove("hidden"); }
}

async function postJSON(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok || data.error) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

// PLACEHOLDER_MODULES

function initCatalog() {
  const form = document.getElementById("catalog-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.materials) data.materials = String(data.materials).split(",").map((m) => m.trim()).filter(Boolean);
    loading("catalog", true, { loading: "Analyzing…", idle: "Analyze product" });
    try {
      const r = await postJSON("/api/generate-tags", data);
      document.getElementById("catalog-primary").textContent = r.primaryCategory || "—";
      document.getElementById("catalog-sub").textContent = r.subCategory || "—";
      document.getElementById("catalog-filters").innerHTML = (r.sustainabilityFilters || [])
        .map((f) => `<span class="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">✓ ${f}</span>`).join("");
      document.getElementById("catalog-tags").innerHTML = (r.seoTags || [])
        .map((t) => `<span class="text-xs font-medium px-2.5 py-1 rounded-lg bg-brand-soft text-brand border border-brand/15 dark:bg-brand/15">#${t}</span>`).join("");
      document.getElementById("catalog-result-empty").classList.add("hidden");
      document.getElementById("catalog-result-content").classList.remove("hidden");
    } catch (err) { fail("catalog", err.message); }
    finally { loading("catalog", false, { loading: "Analyzing…", idle: "Analyze product" }); }
  });
}

function initProposal() {
  const form = document.getElementById("proposal-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    loading("proposal", true, { loading: "Generating…", idle: "Generate proposal" });
    try {
      const r = await postJSON("/api/generate-proposal", data);
      document.getElementById("proposal-summary").textContent = r.impactPositioningSummary || "";
      document.getElementById("proposal-fit").textContent = r.clientFitExplanation || "";
      document.getElementById("proposal-products").innerHTML = (r.productMix || []).map((p) => {
        // Model may return the sustainability score on a 0–10 or 0–100 scale; normalise to 0–10.
        const raw = Number(p.sustainabilityScore) || 0;
        const outOf10 = raw > 10 ? Math.round(raw / 10) : raw;
        const pct = Math.max(0, Math.min(100, raw > 10 ? raw : raw * 10));
        return `
        <tr class="border-t border-stone-200 dark:border-stone-800 align-top">
          <td class="py-2.5 pr-3"><div class="font-medium">${p.name}</div><div class="text-xs text-stone-500">${p.description || ""}</div></td>
          <td class="py-2.5 pr-3 tabular-nums">${p.quantity}</td>
          <td class="py-2.5 pr-3 font-medium tabular-nums">$${p.unitCost}</td>
          <td class="py-2.5">
            <div class="flex items-center gap-2">
              <div class="flex-1 h-1.5 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden"><div class="h-full bg-brand" style="width:${pct}%"></div></div>
              <span class="text-xs font-medium text-stone-500 tabular-nums">${outOf10}/10</span>
            </div>
          </td>
        </tr>`;
      }).join("");
      const b = r.budgetAllocation || {};
      const money = (n) => "$" + Number(n ?? 0).toLocaleString();
      document.getElementById("proposal-budget").innerHTML = `
        <div class="flex justify-between py-1"><span class="text-stone-500">Products</span><span class="font-medium tabular-nums">${money(b.totalProductCost)}</span></div>
        <div class="flex justify-between py-1"><span class="text-stone-500">Logistics</span><span class="font-medium tabular-nums">${money(b.logisticsCost)}</span></div>
        <div class="flex justify-between py-1"><span class="text-stone-500">Contingency</span><span class="font-medium tabular-nums">${money(b.contingency)}</span></div>
        <div class="flex justify-between pt-2 mt-1 border-t border-stone-200 dark:border-stone-800"><span class="font-semibold">Estimated total</span><span class="font-semibold text-lg text-brand tabular-nums">${money(b.totalEstimatedBudget)}</span></div>`;
      document.getElementById("proposal-result-empty").classList.add("hidden");
      document.getElementById("proposal-result-content").classList.remove("hidden");
    } catch (err) { fail("proposal", err.message); }
    finally { loading("proposal", false, { loading: "Generating…", idle: "Generate proposal" }); }
  });
}

function initImpact() {
  const form = document.getElementById("impact-form");
  if (!form) return;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    loading("impact", true, { loading: "Generating…", idle: "Generate impact report" });
    try {
      const r = await postJSON("/api/generate-impact", data);
      document.getElementById("impact-plastic").textContent = r.plasticSaved || "—";
      document.getElementById("impact-carbon").textContent = r.carbonAvoided || "—";
      document.getElementById("impact-local").textContent = r.localSourcing || "—";
      document.getElementById("impact-statement").textContent = r.impactStatement || "";
      document.getElementById("impact-result-empty").classList.add("hidden");
      document.getElementById("impact-result-content").classList.remove("hidden");
    } catch (err) { fail("impact", err.message); }
    finally { loading("impact", false, { loading: "Generating…", idle: "Generate impact report" }); }
  });
}

function initSupport() {
  const form = document.getElementById("chat-form");
  const input = document.getElementById("chat-input");
  const win = document.getElementById("chat-window");
  const logs = document.getElementById("chat-logs");
  const alertEl = document.getElementById("escalation-alert");
  if (!form) return;

  const bubble = (role, text) => {
    const wrap = document.createElement("div");
    wrap.className = `flex ${role === "user" ? "justify-end" : "justify-start"} animate-fade-in`;
    const cls = role === "user"
      ? "bg-brand text-white rounded-2xl rounded-tr-sm"
      : "bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-2xl rounded-tl-sm";
    wrap.innerHTML = `<div class="${cls} px-3.5 py-2.5 max-w-[80%] text-sm">${text}</div>`;
    win.appendChild(wrap);
    win.scrollTop = win.scrollHeight;
  };

  bubble("bot", "Hi! Ask about an order status, returns, or a refund.");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = input.value.trim();
    if (!message) return;
    bubble("user", message);
    input.value = "";
    try {
      const r = await postJSON("/api/chat", { message });
      setTimeout(() => {
        bubble("bot", r.response);
        if (r.reasoning) {
          const log = document.createElement("div");
          log.className = "rounded-lg p-2.5 text-[11px] font-mono bg-stone-50 dark:bg-stone-800/60 text-stone-500 border border-stone-200 dark:border-stone-800 animate-fade-in break-words";
          log.textContent = r.reasoning;
          logs.prepend(log);
        }
        alertEl.classList.toggle("hidden", !r.escalate);
      }, 500);
    } catch (err) { bubble("bot", "Error: " + err.message); }
  });
}
