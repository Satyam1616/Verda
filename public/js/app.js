// AI Systems — front-end controller (self-contained, no imports).
// Tabs + four modules (catalog, proposal, impact, support) talking to the
// Express API. Clean rendering; all AI output comes from Groq via the server.

document.addEventListener("DOMContentLoaded", () => {
  setupTabs();
  animateStats();
  initCatalog();
  initProposal();
  initImpact();
  initSupport();
});

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-btn");
  const sections = document.querySelectorAll(".section");
  const show = (id) => {
    sections.forEach((s) => s.classList.toggle("hidden", s.id !== id));
    buttons.forEach((b) => {
      const on = b.dataset.target === id;
      b.classList.toggle("active", on);
      b.style.color = on ? "" : "var(--muted)";
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  buttons.forEach((b) => b.addEventListener("click", () => show(b.dataset.target)));
  document.querySelectorAll("[data-go]").forEach((el) =>
    el.addEventListener("click", () => show(el.dataset.go))
  );
}

function animateStats() {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("stat-proposals", "124");
  set("stat-products", "850");
  set("stat-impact", "4.2t");
  set("stat-logs", "1,042");
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
        .map((f) => `<span class="chip chip-accent"><i class="fas fa-check"></i> ${f}</span>`).join("");
      document.getElementById("catalog-tags").innerHTML = (r.seoTags || [])
        .map((t) => `<span class="chip">#${t}</span>`).join("");
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
      document.getElementById("proposal-products").innerHTML = (r.productMix || []).map((p) => `
        <tr class="border-t" style="border-color: var(--border)">
          <td class="py-2.5 pr-3"><div class="font-medium">${p.name}</div><div class="text-xs" style="color: var(--muted)">${p.description || ""}</div></td>
          <td class="py-2.5 pr-3">${p.quantity}</td>
          <td class="py-2.5 pr-3 font-medium">$${p.unitCost}</td>
          <td class="py-2.5"><span class="chip chip-accent">${p.sustainabilityScore}/10</span></td>
        </tr>`).join("");
      const b = r.budgetAllocation || {};
      document.getElementById("proposal-budget").innerHTML = `
        <div class="flex justify-between py-1"><span style="color: var(--muted)">Products</span><span class="font-medium">$${b.totalProductCost ?? 0}</span></div>
        <div class="flex justify-between py-1"><span style="color: var(--muted)">Logistics</span><span class="font-medium">$${b.logisticsCost ?? 0}</span></div>
        <div class="flex justify-between py-1"><span style="color: var(--muted)">Contingency</span><span class="font-medium">$${b.contingency ?? 0}</span></div>
        <div class="flex justify-between pt-2 mt-1 border-t" style="border-color: var(--border)"><span class="font-semibold">Estimated total</span><span class="font-semibold text-lg" style="color: var(--primary)">$${b.totalEstimatedBudget ?? 0}</span></div>`;
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
    const base = role === "user"
      ? "background: var(--primary); color:#fff; border-top-right-radius:4px"
      : "background:#fff; color: var(--fg); border:1px solid var(--border); border-top-left-radius:4px";
    wrap.innerHTML = `<div class="rounded-2xl px-3.5 py-2.5 max-w-[80%] text-sm" style="${base}">${text}</div>`;
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
          log.className = "rounded-lg p-2.5 text-[11px] font-mono animate-fade-in";
          log.style.cssText = "background: var(--surface-muted); color: var(--muted); border:1px solid var(--border)";
          log.textContent = r.reasoning;
          logs.prepend(log);
        }
        alertEl.classList.toggle("hidden", !r.escalate);
      }, 500);
    } catch (err) { bubble("bot", "Error: " + err.message); }
  });
}
