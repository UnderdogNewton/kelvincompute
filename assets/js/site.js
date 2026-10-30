/* Kelvin Compute — site interactions. Vanilla, ~5 KB, progressive enhancement. */
(() => {
  const d = document, root = d.documentElement;
  root.classList.remove('no-js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, c = d) => [...c.querySelectorAll(s)];

  /* header: solid after hero */
  const header = d.querySelector('.site-header');
  if (header && 'IntersectionObserver' in window) {
    const s = d.createElement('div'); s.setAttribute('aria-hidden', 'true');
    s.style.cssText = 'position:absolute;top:60vh;left:0;width:1px;height:1px;pointer-events:none';
    d.body.appendChild(s);
    new IntersectionObserver(([e]) => header.classList.toggle('is-solid', !e.isIntersecting && e.boundingClientRect.top < 0)).observe(s);
  }

  /* mobile nav */
  const toggle = d.querySelector('.nav-toggle'), mnav = d.getElementById('mobile-nav');
  if (toggle && mnav) {
    const set = (open) => { toggle.setAttribute('aria-expanded', open); mnav.classList.toggle('is-open', open); mnav.inert = !open; d.body.style.overflow = open ? 'hidden' : ''; toggle.querySelector('.lbl').textContent = open ? 'Close' : 'Menu'; };
    mnav.inert = true;
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
    mnav.addEventListener('click', (e) => { if (e.target === mnav || e.target.closest('a')) set(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
  }

  /* reveal on scroll */
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.rv, [data-inview]').forEach((el) => io.observe(el));

  /* statement: words sharpen as you scroll (staffer-style blur reveal) */
  $$('[data-words]').forEach((p) => {
    const words = p.textContent.trim().split(/\s+/);
    const hl = (p.dataset.hl || '').split('|'), hh = (p.dataset.hh || '').split('|');
    p.innerHTML = words.map((w) => `<span class="w${hl.includes(w.replace(/[.,]/g, '')) ? ' hl' : ''}${hh.includes(w.replace(/[.,]/g, '')) ? ' hh' : ''}">${w}</span>`).join(' ');
    p.setAttribute('aria-label', words.join(' '));
    const spans = $$('.w', p);
    if (reduce) return;
    const tick = () => {
      const r = p.getBoundingClientRect();
      const prog = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35)));
      const lit = prog * spans.length * 1.15;
      spans.forEach((s, i) => { const k = Math.min(1, Math.max(0, lit - i)); s.style.setProperty('--k', k.toFixed(3)); });
    };
    let on = false, q = false;
    const sch = () => { if (!q) { q = true; requestAnimationFrame(() => { q = false; tick(); }); } };
    new IntersectionObserver(([e]) => { if (e.isIntersecting && !on) { on = true; addEventListener('scroll', sch, { passive: true }); sch(); } else if (!e.isIntersecting && on) { on = false; removeEventListener('scroll', sch); tick(); } }, { rootMargin: '20% 0px' }).observe(p);
  });

  /* count-up */
  const cio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, end = parseFloat(el.dataset.count), dec = (el.dataset.count.split('.')[1] || '').length;
    if (reduce) { el.textContent = end.toFixed(dec); return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => { const k = Math.min(1, (t - t0) / dur), v = end * (1 - Math.pow(1 - k, 3)); el.textContent = v.toFixed(dec); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => cio.observe(el));

  /* tabbed stepper with autoplay + pause */
  $$('[data-tabs]').forEach((wrap) => {
    const tabs = $$('[role="tab"]', wrap), panels = $$('[role="tabpanel"]', wrap);
    const pauseBtn = wrap.querySelector('[data-pause]'), stepEl = wrap.querySelector('[data-step]');
    const track = wrap.closest('[data-scrolly]');
    const mq = matchMedia('(min-width:1024px) and (min-height:700px) and (pointer:fine)');
    const scrolly = !!track && mq.matches && !reduce;
    let i = 0, playing = !reduce && !scrolly, t0 = performance.now(), raf; const DUR = 6500;
    const show = (n, focus) => {
      i = (n + tabs.length) % tabs.length;
      tabs.forEach((t, k) => { t.setAttribute('aria-selected', k === i); t.tabIndex = k === i ? 0 : -1; t.style.setProperty('--p', scrolly && k < i ? 1 : 0); });
      panels.forEach((p, k) => { p.hidden = k !== i; p.classList.toggle('is-in', k === i); });
      if (stepEl) stepEl.textContent = String(i + 1).padStart(2, '0');
      if (focus) tabs[i].focus({ preventScroll: scrolly }); t0 = performance.now();
    };
    if (scrolly) {
      track.classList.add('is-scrolly');
      let ch = 0, st = 16, range = 1, top = 0;
      const measure = () => {
        ch = wrap.offsetHeight; st = Math.round(ch <= innerHeight - 24 ? Math.min(16, (innerHeight - ch) / 2) : innerHeight - ch - 16);
        track.style.setProperty('--ch', ch + 'px'); track.style.setProperty('--st', st + 'px');
        range = Math.max(1, track.offsetHeight - ch); top = track.getBoundingClientRect().top + scrollY;
      };
      const onScroll = () => {
        const p = Math.min(1, Math.max(0, (scrollY + st - top) / range));
        const n = Math.min(tabs.length - 1, Math.floor(p * tabs.length));
        if (n !== i) show(n);
        const sub = Math.min(1, p * tabs.length - n);
        tabs[i].style.setProperty('--p', p >= 1 ? 1 : sub); wrap.style.setProperty('--sub', sub.toFixed(3));
      };
      const goto = (k, focus) => {
        k = (k + tabs.length) % tabs.length; measure();
        scrollTo({ top: top - st + (k + 0.04) / tabs.length * range, behavior: 'smooth' }); show(k, focus);
      };
      tabs.forEach((t, k) => {
        t.addEventListener('click', () => goto(k));
        t.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); goto(i + 1, true); } if (e.key === 'ArrowLeft') { e.preventDefault(); goto(i - 1, true); } });
      });
      measure(); show(0); onScroll();
      addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
      addEventListener('resize', () => { measure(); onScroll(); });
      addEventListener('load', () => { measure(); onScroll(); });
      return;
    }
    tabs.forEach((t, k) => {
      t.addEventListener('click', () => { show(k); });
      t.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') show(i + 1, true); if (e.key === 'ArrowLeft') show(i - 1, true); });
    });
    const loop = (t) => {
      if (playing) { const k = (t - t0) / DUR; tabs[i].style.setProperty('--p', Math.min(1, k)); if (k >= 1) show(i + 1); }
      raf = requestAnimationFrame(loop);
    };
    const vis = new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) { t0 = performance.now() - (parseFloat(tabs[i].style.getPropertyValue('--p')) || 0) * DUR; raf = requestAnimationFrame(loop); } });
    vis.observe(wrap);
    wrap.addEventListener('focusin', () => { playing = false; sync(); });
    const sync = () => { if (!pauseBtn) return; pauseBtn.setAttribute('aria-pressed', !playing); pauseBtn.querySelector('span').textContent = playing ? 'Pause' : 'Play'; pauseBtn.querySelector('use').setAttribute('href', playing ? '#i-pause' : '#i-play'); };
    pauseBtn && pauseBtn.addEventListener('click', () => { playing = !playing; t0 = performance.now() - (parseFloat(tabs[i].style.getPropertyValue('--p')) || 0) * DUR; sync(); });
    show(0); sync();
  });

  /* diagram replay */
  $$('[data-replay]').forEach((b) => {
    const fig = b.closest('.dg'); const live = document.createElement('span');
    live.className = 'dg__live'; live.setAttribute('aria-live', 'polite'); fig.appendChild(live);
    b.addEventListener('click', () => {
      fig.classList.add('rs'); fig.classList.remove('in'); void fig.offsetWidth;
      requestAnimationFrame(() => { fig.classList.remove('rs'); requestAnimationFrame(() => fig.classList.add('in')); });
      live.textContent = ''; setTimeout(() => { live.textContent = 'Diagram replayed'; }, 50);
    });
  });

  /* hero pointer light */
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    $$('.hero, .phero').forEach((h) => {
      let q = 0;
      h.addEventListener('pointermove', (e) => {
        if (q) return; q = requestAnimationFrame(() => { q = 0; const r = h.getBoundingClientRect();
          h.style.setProperty('--lx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
          h.style.setProperty('--ly', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%'); });
      });
    });
  }

  /* Stockholm clock */
  $$('[data-clock]').forEach((c) => {
    const t = c.querySelector('time');
    try {
      const f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Stockholm', hour: '2-digit', minute: '2-digit' });
      const tick = () => { t.textContent = f.format(new Date()); };
      tick(); c.hidden = false; setInterval(tick, 30000);
    } catch (e) {}
  });

  /* segmented image switchers */
  $$('[data-switch]').forEach((wrap) => {
    const btns = $$('[data-view]', wrap), stills = $$('[data-still]', wrap), cap = wrap.querySelector('[data-cap]');
    btns.forEach((b) => b.addEventListener('click', () => {
      btns.forEach((x) => x.setAttribute('aria-pressed', x === b));
      stills.forEach((s) => s.classList.toggle('is-on', s.dataset.still === b.dataset.view));
      if (cap && b.dataset.capText) cap.textContent = b.dataset.capText;
    }));
  });

  /* who-we-build-with list */
  $$('[data-who]').forEach((wrap) => {
    const items = $$('[role="tab"]', wrap), panels = $$('[role="tabpanel"]', wrap);
    const show = (k) => { items.forEach((t, n) => { t.setAttribute('aria-selected', n === k); t.tabIndex = n === k ? 0 : -1; }); panels.forEach((p, n) => p.hidden = n !== k); };
    items.forEach((t, k) => { t.addEventListener('click', () => show(k)); t.addEventListener('mouseenter', () => matchMedia('(hover:hover)').matches && show(k));
      t.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); const n = (k + 1) % items.length; show(n); items[n].focus(); } if (e.key === 'ArrowUp') { e.preventDefault(); const n = (k - 1 + items.length) % items.length; show(n); items[n].focus(); } }); });
    show(0);
  });

  /* subnav active state */
  const sub = $$('.subnav a');
  if (sub.length) {
    const map = new Map(sub.map((a) => [a.getAttribute('href').slice(1), a]));
    const sio = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { sub.forEach((a) => a.classList.remove('is-on')); const a = map.get(e.target.id); a && a.classList.add('is-on'); } }), { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_, id) => { const s = d.getElementById(id); s && sio.observe(s); });
  }

  const y = d.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
  /* ---- round 2: progress, parallax, tilt, magnetic, spotlight ---- */
  const bar = d.querySelector('.progress');
  if (bar) { const sp = () => { const h = root.scrollHeight - innerHeight; bar.style.setProperty('--sp', h > 0 ? (scrollY / h).toFixed(4) : 0); }; addEventListener('scroll', sp, { passive: true }); requestAnimationFrame(() => setTimeout(sp, 0)); }
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduce && fine) {
    $$('[data-parallax]').forEach((m) => {
      const host = m.parentElement;
      host.addEventListener('pointermove', (e) => { const r = host.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; m.style.setProperty('--px', `${(-x * 18).toFixed(1)}px`); m.style.setProperty('--py', `${(-y * 12).toFixed(1)}px`); });
      host.addEventListener('pointerleave', () => { m.style.setProperty('--px', '0px'); m.style.setProperty('--py', '0px'); });
    });
    $$('[data-tilt]').forEach((el) => {
      el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; el.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`); el.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`); });
      el.addEventListener('pointerleave', () => { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
    });
    $$('[data-magnetic], .cta .btn--copper, .cta .btn--light').forEach((b) => {
      b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * .18).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * .28).toFixed(1)}px)`; });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
    d.addEventListener('pointermove', (e) => {
      const c = e.target.closest && e.target.closest('.tile, .box'); if (!c) return;
      const r = c.getBoundingClientRect(); c.style.setProperty('--mx', `${e.clientX - r.left}px`); c.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  /* copy email */
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const lbl = b.querySelector('span'), t = b.dataset.copy;
    try { await navigator.clipboard.writeText(t); } catch (e) { const r = document.createRange(); const n = b.previousElementSibling; if (n) { r.selectNodeContents(n); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); } }
    b.classList.add('is-done'); lbl.textContent = 'Copied'; b.setAttribute('aria-label', 'Email address copied');
    setTimeout(() => { b.classList.remove('is-done'); lbl.textContent = 'Copy'; b.setAttribute('aria-label', 'Copy email address'); }, 1800);
  }));
})();
