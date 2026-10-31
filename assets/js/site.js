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
    /* desktop: the whole figure is a replay target (the button stays the keyboard path) */
    if (matchMedia('(hover: hover) and (pointer: fine)').matches) { fig.dataset.cursor = 'Replay'; fig.addEventListener('click', (e) => { if (!e.target.closest('button, a') && !getSelection().toString()) b.click(); }); }
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
  /* ---- round 5: thermal field, explore, story chapters, cursor ---- */
  /* Signature: an illustrative thermal field over the hero. WebGL, half-res, ~30 fps,
     starts after load + idle so LCP is untouched; paused offscreen / hidden tab; one static frame on reduced motion. */
  const hero = d.querySelector('[data-field]');
  if (hero) {
    const start = () => {
      const cv = d.createElement('canvas'); cv.className = 'hero__field'; cv.setAttribute('aria-hidden', 'true');
      const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
      if (!gl) return;
      const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
      const dv = !!gl.getExtension('OES_standard_derivatives');
      const fs = `${dv ? '#extension GL_OES_standard_derivatives : enable\n' : ''}precision mediump float;uniform vec2 r;uniform float t;uniform vec3 m;uniform vec2 s;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;float k=r.x/r.y;vec2 p=vec2(uv.x*k,uv.y);
vec2 q=p*2.1;q.y-=t*.09;float w=fbm(q+fbm(q*.7+vec2(0.,-t*.05))*1.3);
vec2 sp=vec2(s.x*k,s.y);vec2 dd=(p-sp)*vec2(.9,1.25);dd.y-=max(0.,p.y-sp.y)*.45;
float ht=exp(-length(dd)*1.55)*1.05+w*.5-uv.y*.18;
vec2 mp=vec2(m.x*k,m.y);ht+=m.z*.38*exp(-length(p-mp)*4.5);ht=max(ht,0.);ht=ht/(1.+ht*.45);
float f=ht*21.;${dv ? 'float g=abs(fract(f-.5)-.5)/max(fwidth(f),1e-4);float ln=1.-min(g*.8,1.);float mj=abs(fract(f/5.-.5)-.5)*5./max(fwidth(f),1e-4);ln=max(ln*.7,1.-min(mj*.55,1.));' : 'float ln=1.-smoothstep(.0,.1,abs(fract(f)-.5)*2.);'}ln*=smoothstep(.2,.5,ht);
vec3 c=mix(vec3(.11,.70,.78),vec3(.98,.64,.27),smoothstep(.38,.74,ht));
float a=ln*.66+smoothstep(.45,.85,ht)*.16;a*=smoothstep(.18,.62,uv.x)*(.55+.45*smoothstep(.0,.35,uv.y));
gl_FragColor=vec4(c*a,a);}`;
      const sh = (ty, src) => { const o = gl.createShader(ty); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
      const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs); if (!v || !f) return;
      const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
      if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
      gl.useProgram(pr);
      const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const U = (nm) => gl.getUniformLocation(pr, nm), uR = U('r'), uT = U('t'), uM = U('m'), uS = U('s');
      const mob = innerWidth < 861, scale = mob ? .65 : .5;
      gl.uniform2f(uS, mob ? .62 : .7, mob ? .52 : .55);
      const size = () => { const w = Math.max(1, Math.round(hero.clientWidth * scale)), hh = Math.max(1, Math.round(hero.clientHeight * scale)); if (cv.width !== w || cv.height !== hh) { cv.width = w; cv.height = hh; gl.viewport(0, 0, w, hh); gl.uniform2f(uR, w, hh); } };
      const ptr = { x: .7, y: .5, z: 0, tz: 0 };
      let t0 = performance.now(), last = 0, raf = 0, vis = true, running = false;
      const draw = (now) => { size(); ptr.z += (ptr.tz - ptr.z) * .06; ptr.tz *= .985; gl.uniform1f(uT, reduce ? 12 : (now - t0) / 1000); gl.uniform3f(uM, ptr.x, ptr.y, ptr.z); gl.drawArrays(gl.TRIANGLES, 0, 3); };
      const loop = (now) => { raf = requestAnimationFrame(loop); if (now - last < 33) return; last = now; draw(now); };
      const play = () => { if (!running && vis && !d.hidden && !reduce) { running = true; raf = requestAnimationFrame(loop); } };
      const stop = () => { running = false; cancelAnimationFrame(raf); };
      hero.insertBefore(cv, hero.querySelector('.ribs'));
      draw(performance.now());
      requestAnimationFrame(() => { hero.classList.add('has-field'); });
      if (reduce) { addEventListener('resize', () => draw(0), { passive: true }); return; }
      new IntersectionObserver((es) => { vis = es[0].isIntersecting; vis ? play() : stop(); }).observe(hero);
      d.addEventListener('visibilitychange', () => (d.hidden ? stop() : play()));
      hero.addEventListener('pointermove', (e) => { const r = hero.getBoundingClientRect(); ptr.x = (e.clientX - r.left) / r.width; ptr.y = 1 - (e.clientY - r.top) / r.height; ptr.tz = 1; }, { passive: true });
      cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); cv.remove(); hero.classList.remove('has-field'); });
      play();
    };
    const later = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 2500 }) : setTimeout(start, 1200));
    if (d.readyState === 'complete') later(); else addEventListener('load', later, { once: true });
  }

  /* Explore the Flexbox: hotspots + parts list share one state; flows overlay toggle */
  $$('[data-explore]').forEach((x) => {
    const stage = x.querySelector('.explore__stage'), items = $$('.xp', x), hs = $$('.hs', x), bs = $$('.xp__b', x);
    x.classList.add('is-js');
    const set = (i, focusList) => {
      items.forEach((li, n) => li.classList.toggle('is-on', n === i));
      bs.forEach((b, n) => b.setAttribute('aria-expanded', String(n === i)));
      hs.forEach((h, n) => { h.classList.toggle('is-on', n === i); h.setAttribute('aria-pressed', String(n === i)); });
      stage.style.setProperty('--fx', hs[i].style.getPropertyValue('--x')); stage.style.setProperty('--fy', hs[i].style.getPropertyValue('--y'));
      stage.classList.add('is-focus');
      if (focusList) bs[i].focus({ preventScroll: true });
    };
    hs.forEach((h, i) => { h.tabIndex = -1; h.addEventListener('click', () => set(i, false)); h.addEventListener('pointerenter', () => fine && set(i, false)); });
    bs.forEach((b, i) => {
      b.addEventListener('click', () => set(i, false));
      b.addEventListener('keydown', (e) => { const k = e.key, n = bs.length; let j = -1; if (k === 'ArrowDown' || k === 'ArrowRight') j = (i + 1) % n; else if (k === 'ArrowUp' || k === 'ArrowLeft') j = (i + n - 1) % n; else if (k === 'Home') j = 0; else if (k === 'End') j = n - 1; if (j > -1) { e.preventDefault(); set(j, true); } });
    });
    set(0, false); stage.classList.remove('is-focus');
    const ov = $$('[data-ov]', x);
    ov.forEach((b) => b.addEventListener('click', () => { ov.forEach((o) => o.setAttribute('aria-pressed', String(o === b))); stage.classList.toggle('show-flows', b.dataset.ov === 'flows'); }));
  });

  /* Product pages: a story chapter pill (01 problem → 04 start) */
  const chap = d.querySelector('[data-chapters]');
  if (chap) {
    const links = $$('a', chap), cur = chap.querySelector('[data-chap-cur]'), lab = chap.querySelector('[data-chap-lab]');
    const secs = links.map((a) => d.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const upd = () => {
      let i = -1; secs.forEach((s, n) => { if (s.getBoundingClientRect().top < innerHeight * .55) i = n; });
      chap.classList.toggle('is-on', i > -1 && scrollY > innerHeight * .5 && root.scrollHeight - scrollY - innerHeight > 260);
      const k = Math.max(0, i);
      links.forEach((a, n) => { a.classList.toggle('is-on', n === k); n === k ? a.setAttribute('aria-current', 'step') : a.removeAttribute('aria-current'); });
      if (cur) cur.textContent = `0${k + 1}`; if (lab) lab.textContent = links[k].dataset.label;
    };
    let q = false; addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(() => { q = false; upd(); }); } }, { passive: true }); (window.requestIdleCallback || setTimeout)(upd);
  }

  /* Custom cursor on diagrams and the Flexbox explorer — fine pointers only, never hides the native cursor */
  if (fine && !reduce) {
    const c = d.createElement('div'); c.className = 'cursor'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<span></span>'; d.body.appendChild(c);
    const lbl = c.firstChild; let x = -100, y = -100, cx = -100, cy = -100, on = false, raf = 0;
    const tick = () => { cx += (x - cx) * .22; cy += (y - cy) * .22; c.style.transform = `translate3d(${cx.toFixed(1)}px,${cy.toFixed(1)}px,0)`; raf = Math.abs(x - cx) + Math.abs(y - cy) > .3 ? requestAnimationFrame(tick) : 0; };
    d.addEventListener('pointermove', (e) => {
      x = e.clientX; y = e.clientY;
      const t = e.target.closest && e.target.closest('[data-cursor]');
      if (t) { const txt = t.dataset.cursor; if (lbl.textContent !== txt) lbl.textContent = txt; if (!on) { on = true; cx = x; cy = y; c.classList.add('is-on'); } c.classList.toggle('is-press', !!e.target.closest('button, a')); }
      else if (on) { on = false; c.classList.remove('is-on'); }
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
  }
})();
