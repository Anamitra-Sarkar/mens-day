(() => {
  "use strict";
  const C = window.MENS_DAY || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const ORDER = ["bouquet", "letter", "collage", "final"];

  /* ---------- fill content from config ---------- */
  $("#to-line").textContent = `to ${C.to || "my favourite man"}`;
  $("#final-title").textContent = C.finalTitle || "One Last Thing…";

  const paperText = $("#paper-text");
  (C.letter || []).forEach((t) => {
    const p = document.createElement("p");
    p.textContent = t;
    paperText.appendChild(p);
  });
  const sign = document.createElement("p");
  sign.textContent = `— ${C.signoff || "Always yours"} ♥`;
  sign.style.textAlign = "right";
  paperText.appendChild(sign);

  $$("[data-note]").forEach((el) => (el.textContent = (C.notes || [])[+el.dataset.note] || ""));
  (C.stamps || []).forEach((s, i) => { const el = $("#stamp-" + i); if (el) el.textContent = s; });

  // balloon title, one span per letter so they can drop in one by one
  const balloon = $("#balloon");
  balloon.setAttribute("aria-label", C.title || "MY MAN");
  [...(C.title || "MY MAN")].forEach((ch, i) => {
    const s = document.createElement("span");
    s.setAttribute("aria-hidden", "true");
    s.style.setProperty("--i", i);
    s.style.setProperty("--rr", `${(i % 2 ? 1 : -1) * (6 + (i % 3) * 3)}deg`);
    if (ch === " ") s.className = "gap"; else s.textContent = ch;
    balloon.appendChild(s);
  });

  // user photos replace the illustrated placeholders
  $$(".polaroid .ph").forEach((ph, i) => {
    const src = (C.photos || [])[i];
    if (!src) return;
    const img = new Image();
    img.alt = "";
    img.decoding = "async";
    img.loading = "lazy";
    img.onload = () => { ph.replaceChildren(img); };
    img.src = src;
  });

  /* ---------- slow drifting petals / stars in the background ---------- */
  if (!reduce) {
    const drift = $("#drift");
    const bits = ["✦", "♥", "✧", "★", "✦"];
    const cols = ["#f5ecc9", "#8fb0f2", "#f2b95b", "#cfe0ff", "#ff9bb8"];
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

  /* ---------- confetti / hearts canvas ---------- */
  const cv = $("#fx"), ctx = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1, parts = [], raf = 0;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  size(); addEventListener("resize", size);
  const COLS = ["#f2b95b", "#f5ecc9", "#4a7be0", "#8fb0f2", "#ff7ea8", "#e23a52", "#ffffff"];
  function heartPath(x, y, s) {
    ctx.beginPath();
    ctx.moveTo(x, y + s * .35);
    ctx.bezierCurveTo(x, y - s * .2, x - s * .7, y - s * .2, x - s * .7, y + s * .25);
    ctx.bezierCurveTo(x - s * .7, y + s * .7, x - s * .1, y + s * .9, x, y + s * 1.1);
    ctx.bezierCurveTo(x + s * .1, y + s * .9, x + s * .7, y + s * .7, x + s * .7, y + s * .25);
    ctx.bezierCurveTo(x + s * .7, y - s * .2, x, y - s * .2, x, y + s * .35);
    ctx.closePath();
  }
  function burst(x, y, count = 70, spread = 1) {
    if (reduce) return;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2, v = (3 + Math.random() * 7) * spread;
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 4,
        g: .16 + Math.random() * .08, s: 6 + Math.random() * 10, r: Math.random() * 6, vr: (Math.random() - .5) * .3,
        c: COLS[(Math.random() * COLS.length) | 0], kind: Math.random() < .55 ? "heart" : Math.random() < .5 ? "rect" : "dot",
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
      if (p.kind === "heart") { heartPath(p.x, p.y, p.s); ctx.fill(); }
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
    if (push) history.pushState(null, "", "#" + name);
    if (name === "collage" && !reduce) setTimeout(() => burst(W / 2, H * .3, 36, .8), 500);
  }
  addEventListener("hashchange", () => go(location.hash.slice(1), false));
  $$("[data-go]").forEach((b) => b.addEventListener("click", () => go(b.dataset.go)));

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
  function openEnvelope() {
    if (env.getAttribute("aria-expanded") === "true") return;
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
    env.style.marginTop = Math.max(0, ph - eh * .94) + 28 + "px"; // reserve room so the letter never covers the headline
    env.setAttribute("aria-expanded", "true");
    $("#env-hint").textContent = "with all my love";
    burst(innerWidth / 2, innerHeight * .55, 30, .7);
    setTimeout(() => { $("#next-letter").hidden = false; }, reduce ? 0 : 900);
  }
  env.addEventListener("click", openEnvelope);

  /* ---------- 4 final ---------- */
  const cta = $("#cta"), reveal = $("#reveal");
  cta.addEventListener("click", () => {
    if (cta.disabled) return;
    cta.disabled = true;
    cta.textContent = "♥ ♥ ♥";
    const words = (C.finalLine || "I love you so much!").split(" ");
    reveal.textContent = "";
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.textContent = w;
      if (/favourite|love/i.test(w)) { const em = document.createElement("em"); em.textContent = w; s.textContent = ""; s.appendChild(em); }
      s.style.opacity = 0; s.style.display = "inline-block"; s.style.marginRight = ".3em"; s.style.transition = "opacity .4s, transform .5s cubic-bezier(.22,1,.36,1)"; s.style.transform = "translateY(10px)";
      reveal.appendChild(s);
      setTimeout(() => { s.style.opacity = 1; s.style.transform = "none"; }, reduce ? 0 : 140 * i);
    });
    const r = cta.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top, 120, 1.3);
    rain(3000);
    setTimeout(() => { $("#replay").hidden = false; }, 1200);
  });
  $("#replay").addEventListener("click", () => {
    cta.disabled = false; cta.textContent = "Click for your final surprise »"; reveal.textContent = "";
    $("#replay").hidden = true;
    env.setAttribute("aria-expanded", "false"); env.style.marginTop = ""; $("#next-letter").hidden = true;
    $("#env-hint").textContent = "tap the envelope to read my letter";
  });

  go(location.hash.slice(1) || "bouquet", false);
})();
