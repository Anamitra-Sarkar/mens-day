(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ORDER = ["bouquet", "letter", "wish", "chapter", "final"];

  /* ---------- language: Bengali by default, English one tap away ---------- */
  const L = window.MENS_DAY || {};
  const lang = "en";
  const BN_LINE = window.MENS_DAY_LINE || "";
  const t = (k) => (L[lang] && L[lang][k]) ?? "";

  const paperText = $("#paper-text");
  const balloon = $("#balloon");
  let revealed = false;

  function graphemes(str) {
    if (window.Intl && Intl.Segmenter) return [...new Intl.Segmenter(lang, { granularity: "grapheme" }).segment(str)].map((x) => x.segment);
    return Array.from(str);
  }
  function buildBalloon() {
    const title = t("title");
    balloon.setAttribute("aria-label", title);
    balloon.replaceChildren();
    let n = 0;
    title.split(" ").forEach((word) => {
      const w = document.createElement("b");               // one box per word so a long title wraps between words, never inside one
      w.className = "word";
      graphemes(word).forEach((ch) => {
        const s = document.createElement("span");
        s.setAttribute("aria-hidden", "true");
        s.style.setProperty("--i", n);
        s.style.setProperty("--rr", `${(n % 2 ? 1 : -1) * (6 + (n % 3) * 3)}deg`);
        s.textContent = ch; n++;
        w.appendChild(s);
      });
      balloon.appendChild(w);
    });
  }
  function buildLetter() {
    paperText.replaceChildren();
    (t("letter") || []).forEach((txt, i) => {
      const p = document.createElement("p");
      if (i === 0) p.className = "lead";
      p.textContent = txt;
      paperText.appendChild(p);
    });
  }
  function renderReveal(instant) {
    const reveal = $("#reveal"), note = $("#reveal-note");
    reveal.textContent = "";
    reveal.setAttribute("aria-label", BN_LINE);
    reveal.lang = "bn";
    note.classList.remove("on");
    const emph = t("emph");
    const words = BN_LINE.split(" ");
    words.forEach((w, i) => {
      const s = document.createElement("span");
      if (emph && w.includes(emph)) { const em = document.createElement("em"); em.textContent = w; s.appendChild(em); } else s.textContent = w;
      s.style.cssText = `display:inline-block;margin-right:.3em;opacity:${instant ? 1 : 0};transform:${instant ? "none" : "translateY(10px)"};transition:opacity .4s,transform .5s cubic-bezier(.22,1,.36,1)`;
      reveal.appendChild(s);
      if (!instant) setTimeout(() => { s.style.opacity = 1; s.style.transform = "none"; }, reduce ? 0 : 150 * i);
    });
    note.textContent = t("finalNote");
    setTimeout(() => note.classList.add("on"), instant || reduce ? 0 : 150 * words.length + 300);
  }
  function applyLang() {
    document.documentElement.lang = lang;
    document.title = t("pageTitle");
    const md = document.querySelector('meta[name="description"]'); if (md) md.content = t("pageDesc");
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $("#final-title").textContent = t("finalTitle");
    buildBalloon();
    buildLetter();
    const open = $("#envelope").getAttribute("aria-expanded") === "true";
    $("#env-hint").textContent = open ? t("envHintOpen") : t("envHint");
    const c = $("#cta"); c.textContent = c.disabled ? "✦ ✦ ✦" : t("cta");
    if (revealed) renderReveal(true);
    const hs = $("#bq-hint span"); if (hs) { hs.style.animation = "none"; void hs.offsetWidth; hs.style.animation = ""; }
    if (open) sizePaper();
  }
  /* ---------- slow drifting petals / stars in the background ---------- */
  if (!reduce) {
    const drift = $("#drift");
    const bits = ["✦", "✧", "★", "✦", "✧"];
    const cols = ["#f5ecc9", "#8fb0f2", "#f2b95b", "#cfe0ff", "#f5ecc9"];
    const n = innerWidth < 600 ? 9 : 16;
    for (let i = 0; i < n; i++) {
      const el = document.createElement("i");
      el.textContent = bits[i % bits.length];
      el.style.left = Math.random() * 100 + "vw";
      el.style.fontSize = 12 + Math.random() * 20 + "px";
      el.style.color = cols[i % cols.length];
      el.style.animationDuration = 14 + Math.random() * 16 + "s";
      el.style.animationDelay = -Math.random() * 28 + "s";
      el.style.setProperty("--dx", (Math.random() * 120 - 60).toFixed(0) + "px");
      el.style.setProperty("--rot", (Math.random() * 540 - 270).toFixed(0) + "deg");
      drift.appendChild(el);
    }
  }

  /* ---------- midnight sky: twinkling stars + shooting stars ---------- */
  (() => {
    const sky = $("#sky");
    const n = innerWidth < 600 ? 70 : 130;
    for (let i = 0; i < n; i++) {
      const st = document.createElement("i");
      st.className = "star" + (i % 9 === 0 ? " big" : "");
      const z = i % 9 === 0 ? 2.6 : 1 + Math.random() * 1.4;
      st.style.cssText = `left:${(Math.random() * 100).toFixed(2)}%;top:${(Math.random() * 100).toFixed(2)}%;width:${z}px;height:${z}px;--d:${(2 + Math.random() * 4).toFixed(1)}s;--dl:${(-Math.random() * 6).toFixed(1)}s`;
      sky.appendChild(st);
    }
    for (let i = 0; i < 9; i++) {
      const sp = document.createElement("i");
      sp.className = "spark"; sp.textContent = "✦";
      sp.style.cssText = `left:${(4 + Math.random() * 90).toFixed(1)}%;top:${(4 + Math.random() * 86).toFixed(1)}%;--s:${(10 + Math.random() * 14).toFixed(0)}px;--d:${(3 + Math.random() * 4).toFixed(1)}s;--dl:${(-Math.random() * 6).toFixed(1)}s`;
      sky.appendChild(sp);
    }
    if (reduce) return;
    (function shoot() {
      setTimeout(() => {
        if (!document.hidden) {
          const s = document.createElement("i");
          s.className = "shoot";
          s.style.left = (Math.random() * 55) + "%";
          s.style.top = (4 + Math.random() * 30) + "%";
          sky.appendChild(s);
          setTimeout(() => s.remove(), 1500);
        }
        shoot();
      }, 6000 + Math.random() * 6000);
    })();
  })();

  /* ---------- confetti canvas ---------- */
  const cv = $("#fx"), ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1, parts = [], raf = 0;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); addEventListener("resize", size);
  const COLS = ["#f2b95b", "#f5ecc9", "#4a7be0", "#8fb0f2", "#ffffff", "#f2b95b"];
  function starPath(x, y, s) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? s * .42 : s, a = i * Math.PI / 5 - Math.PI / 2;
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
    ctx.closePath();
  }
  function burst(x, y, count = 70, spread = 1) {
    if (reduce) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, v = (3 + Math.random() * 7) * spread;
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4,
        g: .16 + Math.random() * .08, s: 6 + Math.random() * 10, r: Math.random() * 6, vr: (Math.random() - .5) * .3,
        c: COLS[(Math.random() * COLS.length) | 0], kind: Math.random() < .55 ? "star" : Math.random() < .5 ? "rect" : "dot",
        life: 0, max: 90 + Math.random() * 60,
      });
    }
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function rain(ms = 2600) {
    if (reduce) return;
    const end = performance.now() + ms;
    (function drop() {
      burst(Math.random() * W, -10, 6, .35);
      if (performance.now() < end) setTimeout(drop, 120);
    })();
  }
  function tick() {
    ctx.clearRect(0, 0, W, H);
    parts = parts.filter((p) => p.life < p.max && p.y < H + 40);
    for (const p of parts) {
      p.life++; p.vy += p.g; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.globalAlpha = Math.min(1, (p.max - p.life) / 25);
      ctx.fillStyle = p.c;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.translate(-p.x, -p.y);
      if (p.kind === "star") { starPath(p.x, p.y, p.s * .8); ctx.fill(); }
      else if (p.kind === "rect") ctx.fillRect(p.x - p.s / 2, p.y - p.s / 4, p.s, p.s / 2);
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.s / 3, 0, 7); ctx.fill(); }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
    raf = parts.length ? requestAnimationFrame(tick) : 0;
    if (!raf) ctx.clearRect(0, 0, W, H);
  }

  /* ---------- scene router (hash based so the back button works) ---------- */
  let current = null;
  function go(name, push = true) {
    if (!ORDER.includes(name)) name = "bouquet";
    if (name === current) return;
    current = name;
    $$(".scene").forEach((s) => {
      const on = s.dataset.scene === name;
      s.classList.toggle("is-active", on);
      s.toggleAttribute("inert", !on);
      s.setAttribute("aria-hidden", on ? "false" : "true");
      if (on) s.scrollTop = 0;
    });
    $$("#story i").forEach((b, i) => b.classList.toggle("on", i <= ORDER.indexOf(name)));
    if (push) history.pushState(null, "", "#" + name);
    if (name === "wish" && !reduce) setTimeout(() => burst(W / 2, H * .3, 36, .8), 500);
  }
  addEventListener("hashchange", () => go(location.hash.slice(1), false));
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));

  /* ---------- wishes: tap a card to turn it over ---------- */
  $$(".flip").forEach((b) => b.addEventListener("click", () => {
    const on = b.getAttribute("aria-pressed") === "true";
    b.setAttribute("aria-pressed", on ? "false" : "true");
    if (!on) { const r = b.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 18, .5); }
  }));

  /* ---------- 1 bouquet ---------- */
  const bq = $("#bouquet");
  bq.addEventListener("click", () => {
    if (bq.classList.contains("pop")) return;
    const r = bq.getBoundingClientRect();
    bq.classList.add("pop");
    burst(r.left + r.width / 2, r.top + r.height * .3, 90, 1.1);
    setTimeout(() => { go("letter"); bq.classList.remove("pop"); }, reduce ? 0 : 750);
  });

  /* ---------- 2 envelope ---------- */
  const env = $("#envelope"), paper = $("#paper");
  function sizePaper() {
    const eh = env.getBoundingClientRect().height;
    // widen the paper to fit the words, then size it from an off-screen copy of the text
    const pw = Math.min(innerWidth - 32, 540);
    const probe = paperText.cloneNode(true);
    probe.style.cssText = `position:absolute;visibility:hidden;left:-9999px;top:0;width:${pw - 6}px`;
    document.body.appendChild(probe);
    const textH = probe.offsetHeight + 16;
    probe.remove();
    const want = Math.min(innerHeight * 0.62, 520, textH);
    const ph = Math.max(want, eh * .9);
    env.style.setProperty("--paper-w", pw + "px");
    env.style.setProperty("--paper-h", ph + "px");
    env.style.marginTop = Math.max(0, ph - eh * .94, eh * .66) + 28 + "px"; // reserve room so the letter never covers the headline
  }
  function openEnvelope() {
    if (env.getAttribute("aria-expanded") === "true") return;
    sizePaper();
    env.setAttribute("aria-expanded", "true");
    $("#env-hint").textContent = t("envHintOpen");
    burst(innerWidth / 2, innerHeight * .55, 30, .7);
    setTimeout(() => { $("#next-letter").hidden = false; }, reduce ? 0 : 900);
  }
  env.addEventListener("click", openEnvelope);

  /* ---------- 4 final ---------- */
  const cta = $("#cta"), reveal = $("#reveal");
  cta.addEventListener("click", () => {
    if (cta.disabled) return;
    cta.disabled = true;
    cta.textContent = "✦ ✦ ✦";
    revealed = true;
    renderReveal(false);
    const r = cta.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, 120, 1.3);
    rain(3000);
    setTimeout(() => { $("#replay").hidden = false; }, 1200);
  });
  $("#replay").addEventListener("click", () => {
    revealed = false; cta.disabled = false; cta.textContent = t("cta"); reveal.textContent = ""; $("#reveal-note").classList.remove("on"); $("#reveal-note").textContent = "";
    $("#replay").hidden = true;
    env.setAttribute("aria-expanded", "false"); env.style.marginTop = ""; $("#next-letter").hidden = true;
    $("#env-hint").textContent = t("envHint");
  });

  /* ---------- phone: tap the right half = next, left half = back (like story viewers) ---------- */
  function advance() {
    if (current === "bouquet") bq.click();
    else if (current === "letter") { if (env.getAttribute("aria-expanded") !== "true") openEnvelope(); else go("wish"); }
    else if (current === "wish" || current === "chapter") go(ORDER[ORDER.indexOf(current) + 1]);
    else if (current === "final") { if (!cta.disabled) cta.click(); else $("#replay").click(); }
  }
  function back() {
    const i = ORDER.indexOf(current);
    if (i > 0) go(ORDER[i - 1]);
  }
  let down = null;
  const app = $("#app");
  app.addEventListener("pointerdown", (e) => { down = e.pointerType === "mouse" ? null : { x: e.clientX, y: e.clientY, t: performance.now(), id: e.pointerId }; });
  app.addEventListener("pointercancel", () => { down = null; });
  app.addEventListener("pointerup", (e) => {
    const d = down; down = null;
    if (!d || d.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10 || performance.now() - d.t > 600) return; // a scroll or long press, not a tap
    const ctl = e.target.closest("button, a");                                                      // real controls keep their own behaviour...
    if (ctl && !(ctl === env && env.getAttribute("aria-expanded") === "true")) return;               // ...but an opened letter is just content, so a tap on it navigates
    dismissHint();
    if (e.clientX < innerWidth / 2) back(); else advance();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); advance(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); back(); }
  });

  // one-time hint, only on touch devices
  const hint = document.createElement("div");
  hint.className = "tap-hint"; hint.setAttribute("aria-hidden", "true");
  hint.innerHTML = '<span data-i18n="tapL"></span><span data-i18n="tapR"></span>';
  document.body.appendChild(hint);
  function dismissHint() { hint.classList.add("gone"); }
  setTimeout(dismissHint, 7000);

  applyLang();
  go(location.hash.slice(1) || "bouquet", false);
})();
