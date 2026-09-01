/* Kelvin Compute — kelvincompute.com
   Light, dependency-free enhancements. Everything on the page works without this file;
   it adds: mobile navigation (overlay, focus trap), active-section highlighting, current-page nav (aria-current=page),
   header shadow, reveal-on-scroll, hero parallax on the Classic fold (disabled when prefers-reduced-motion),
   sticky Approach chapter (no pin below 720px or reduced-motion), sites map HTML pins paired with the board,
   in-page focus management, the footer year, hall chapter rail,
   Closed/Exploded still + chip to hotspot, For-you verticals (two chip groups, wrap per group),
   catalogue hash → parts accordion, motion (reveals, count-up, still crossfades),
   heat host/scale/grade/tier/market/queue pickers, compute pad catalogue, hall tilt at half Approach, chip pulse,
   dest stills decode before paint,
   chapter prev/next + 01/n counts, copy/still 680ms fade,
   side-jump scroll-spy (aria-current=location), product still one-shot settle. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  root.classList.add('js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReducedMotion = function () { return reduceMotion.matches; };
  var motionNarrow = window.matchMedia('(max-width: 719px)');
  var motionOff = function () { return prefersReducedMotion() || motionNarrow.matches; };

  var pad2 = function (n) {
    return (n < 10 ? '0' : '') + String(n);
  };
  var fadeText = function (el, text) {
    if (!el || text == null) { return; }
    if (el.textContent === text && !el.classList.contains('is-swap')) { return; }
    if (el._fadeT) { window.clearTimeout(el._fadeT); el._fadeT = 0; }
    if (motionOff()) {
      el.classList.remove('is-swap');
      el.textContent = text;
      return;
    }
    el.classList.add('is-swap');
    el._fadeT = window.setTimeout(function () {
      el.textContent = text;
      el.classList.remove('is-swap');
      el._fadeT = 0;
    }, 340);
  };

  var supportsViewTimeline = false;
  var supportsScrollTimeline = false;
  try {
    supportsViewTimeline = !!(window.CSS && CSS.supports && (
      CSS.supports('animation-timeline: view()') || CSS.supports('animation-timeline', 'view()')
    ));
    supportsScrollTimeline = !!(window.CSS && CSS.supports && (
      CSS.supports('animation-timeline: scroll()') || CSS.supports('animation-timeline', 'scroll()')
    ));
  } catch (eSda) { supportsViewTimeline = false; supportsScrollTimeline = false; }
  var syncSda = function () {
    root.classList.toggle('has-sda', !!((supportsViewTimeline || supportsScrollTimeline) && !motionOff()));
  };
  syncSda();
  if (reduceMotion.addEventListener) { reduceMotion.addEventListener('change', syncSda); }
  else if (reduceMotion.addListener) { reduceMotion.addListener(syncSda); }
  if (motionNarrow.addEventListener) { motionNarrow.addEventListener('change', syncSda); }
  else if (motionNarrow.addListener) { motionNarrow.addListener(syncSda); }

  /* Page-progress: 2px timber bar. SDA when supported; JS fallback otherwise. Gated by motionOff(). */
  var progressBar = doc.createElement('div');
  progressBar.className = 'page-progress';
  progressBar.setAttribute('aria-hidden', 'true');
  var mountProgress = function () {
    if (progressBar.parentNode) { return; }
    if (doc.body) { doc.body.insertBefore(progressBar, doc.body.firstChild); }
  };
  mountProgress();
  var usingScrollSda = function () {
    return root.classList.contains('has-sda') && supportsScrollTimeline;
  };
  var paintProgress = function () {
    if (motionOff()) {
      progressBar.hidden = true;
      progressBar.style.transform = '';
      return;
    }
    progressBar.hidden = false;
    if (usingScrollSda()) {
      progressBar.style.transform = '';
      return;
    }
    var se = doc.documentElement;
    var max = Math.max(1, (se.scrollHeight || 1) - (window.innerHeight || 0));
    var p = Math.min(1, Math.max(0, (window.pageYOffset || window.scrollY || 0) / max));
    progressBar.style.transform = 'scaleX(' + p + ')';
  };
  paintProgress();
  window.addEventListener('scroll', paintProgress, { passive: true });
  window.addEventListener('resize', paintProgress, { passive: true });
  if (reduceMotion.addEventListener) { reduceMotion.addEventListener('change', paintProgress); }
  else if (reduceMotion.addListener) { reduceMotion.addListener(paintProgress); }
  if (motionNarrow.addEventListener) { motionNarrow.addEventListener('change', paintProgress); }
  else if (motionNarrow.addListener) { motionNarrow.addListener(paintProgress); }

  var t = {
    menu: 'Menu',
    close: 'Close'
  };

  /* ---------- Mobile navigation ---------- */
  var header = doc.querySelector('.site-header');
  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('site-nav');
  var overlay = doc.getElementById('nav-overlay');
  var main = doc.getElementById('main');
  var footer = doc.querySelector('.site-footer');

  function navFocusables() {
    var items = [];
    if (toggle) { items.push(toggle); }
    if (nav) {
      Array.prototype.forEach.call(nav.querySelectorAll('a, button'), function (el) { items.push(el); });
    }
    return items;
  }

  function setNav(open) {
    if (!toggle || !nav) { return; }
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('is-open', open);
    doc.body.classList.toggle('nav-open', open);
    var label = toggle.querySelector('.nav-toggle__label');
    if (label) { label.textContent = open ? t.close : t.menu; }
    if (overlay) { overlay.hidden = !open; }
    if (main) {
      if (open) { main.setAttribute('inert', ''); } else { main.removeAttribute('inert'); }
    }
    if (footer) {
      if (open) { footer.setAttribute('inert', ''); } else { footer.removeAttribute('inert'); }
    }
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function (event) {
      var willOpen = toggle.getAttribute('aria-expanded') !== 'true';
      setNav(willOpen);
      if (willOpen && event.detail === 0) {
        var firstLink = nav.querySelector('a');
        if (firstLink) { firstLink.focus(); }
      }
    });

    nav.addEventListener('click', function (event) {
      var link = event.target.closest('a');
      if (link) { setNav(false); }
    });

    if (overlay) {
      overlay.addEventListener('click', function () { setNav(false); });
    }

    doc.addEventListener('keydown', function (event) {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      if (!open) { return; }
      if (event.key === 'Escape') {
        setNav(false);
        toggle.focus();
        return;
      }
      if (event.key === 'Tab') {
        var items = navFocusables();
        if (!items.length) { return; }
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && doc.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && doc.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    doc.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') === 'true' && header && !header.contains(event.target)) {
        setNav(false);
      }
    });

    // Reset when the viewport grows past the mobile breakpoint
    var wide = window.matchMedia('(min-width: 1200px)');
    var onWide = function (e) { if (e.matches) { setNav(false); } };
    if (wide.addEventListener) { wide.addEventListener('change', onWide); } else if (wide.addListener) { wide.addListener(onWide); }
  }

  /* ---------- Header shadow + hide-on-scroll (never fights a chapter bar) ---------- */
  if (header) {
    var lastKnown = false;
    var lastY = 0;
    var away = false;
    var canHideHeader = !doc.querySelector('.hall-chapters, [data-chapter]');
    var onScroll = function () {
      var y = window.pageYOffset || window.scrollY || 0;
      var scrolled = y > 8;
      if (scrolled !== lastKnown) {
        header.classList.toggle('is-scrolled', scrolled);
        lastKnown = scrolled;
      }
      if (!canHideHeader || motionOff() || doc.body.classList.contains('nav-open')) {
        if (away) {
          header.classList.remove('is-away');
          away = false;
        }
        lastY = y;
        return;
      }
      var hide = y > lastY && y > 96;
      if (hide !== away) {
        header.classList.toggle('is-away', hide);
        away = hide;
      }
      lastY = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    var onMotionHeader = function () {
      if (motionOff() && away) {
        header.classList.remove('is-away');
        away = false;
      }
    };
    if (reduceMotion.addEventListener) { reduceMotion.addEventListener('change', onMotionHeader); }
    else if (reduceMotion.addListener) { reduceMotion.addListener(onMotionHeader); }
    if (motionNarrow.addEventListener) { motionNarrow.addEventListener('change', onMotionHeader); }
    else if (motionNarrow.addListener) { motionNarrow.addListener(onMotionHeader); }
  }

  /* ---------- In-page links: move focus to the target for keyboard and screen-reader users ---------- */
  doc.addEventListener('click', function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) { return; }
    var id = link.getAttribute('href').slice(1);
    if (!id) { return; }
    var target = doc.getElementById(id);
    if (!target) { return; }

    // Expand a closed details target before focusing it
    var details = target.closest('details');
    if (details && !details.open) { details.open = true; }

    if (!target.hasAttribute('tabindex')) { target.setAttribute('tabindex', '-1'); }
    // Let the browser perform the scroll (CSS handles smooth vs. instant), then focus without re-scrolling
    window.setTimeout(function () {
      try { target.focus({ preventScroll: true }); } catch (e) { target.focus(); }
    }, prefersReducedMotion() ? 0 : 350);
  });

  /* ---------- Active section in the navigation ---------- */
  var navLinks = Array.prototype.slice.call(doc.querySelectorAll('.site-nav__list a[href^="#"]'));
  var sections = navLinks
    .map(function (a) { return doc.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var current = null;
    var setCurrent = function (id) {
      if (id === current) { return; }
      current = id;
      navLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) { a.setAttribute('aria-current', 'true'); }
        else { a.removeAttribute('aria-current'); }
      });
    };
    var visible = {};
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0; });
      var best = null, bestRatio = 0;
      sections.forEach(function (s) {
        if ((visible[s.id] || 0) > bestRatio) { bestRatio = visible[s.id]; best = s.id; }
      });
      if (best) { setCurrent(best); }
      else if (window.scrollY < 200) { setCurrent(null); }
    }, { rootMargin: '-35% 0px -55% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
    sections.forEach(function (s) { sectionObserver.observe(s); });
  }

  /* ---------- Side-jump scroll-spy (Compute / Energy / Thermal / Flexibility) ----------
     One aria-current="location" at a time. Spy still updates under reduced-motion.
     rootMargin top matches sticky-pill scroll-margin so the header does not steal active. */
  var jumpLinks = Array.prototype.slice.call(doc.querySelectorAll('.side-jump a[href^="#"]'));
  if ('IntersectionObserver' in window && jumpLinks.length) {
    var jumpSeen = {};
    var jumpSecs = [];
    jumpLinks.forEach(function (a) {
      var id = (a.getAttribute('href') || '').slice(1);
      if (!id || jumpSeen[id]) { return; }
      var sec = doc.getElementById(id);
      if (!sec) { return; }
      jumpSeen[id] = true;
      jumpSecs.push(sec);
    });
    var jumpCurrent = null;
    var setJumpCurrent = function (id) {
      if (id === jumpCurrent) { return; }
      jumpCurrent = id;
      jumpLinks.forEach(function (a) {
        if (id && a.getAttribute('href') === '#' + id) {
          a.setAttribute('aria-current', 'location');
        } else if (a.getAttribute('aria-current') === 'location') {
          a.removeAttribute('aria-current');
        }
      });
    };
    var jumpVisible = {};
    var jumpObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        jumpVisible[entry.target.id] = entry.isIntersecting ? entry.intersectionRatio : 0;
      });
      var best = null, bestRatio = 0;
      jumpSecs.forEach(function (s) {
        var r = jumpVisible[s.id] || 0;
        if (r > bestRatio) { bestRatio = r; best = s.id; }
      });
      if (best) { setJumpCurrent(best); }
      else if (window.scrollY < 160) { setJumpCurrent(null); }
      else {
        var last = null;
        var line = window.innerHeight * 0.55;
        jumpSecs.forEach(function (s) {
          if (s.getBoundingClientRect().top < line) { last = s.id; }
        });
        if (last) { setJumpCurrent(last); }
      }
    }, { rootMargin: '-92px 0px -35% 0px', threshold: [0, 0.1, 0.25, 0.5, 0.75, 1] });
    jumpSecs.forEach(function (s) { jumpObserver.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = doc.querySelectorAll('.reveal');
  if (reveals.length) {
    if (!('IntersectionObserver' in window) || motionOff()) {
      Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      Array.prototype.forEach.call(reveals, function (el) { revealObserver.observe(el); });
      // Safety net: anything still hidden after a while (e.g. print, unusual viewports) is shown
      window.setTimeout(function () {
        Array.prototype.forEach.call(reveals, function (el) { el.classList.add('is-visible'); });
      }, 4000);
    }
  }

  /* ---------- Current page in primary nav ---------- */
  (function markCurrentPage() {
    var file = (location.pathname.split('/').pop() || '').toLowerCase();
    if (!file) { file = 'index.html'; }
    Array.prototype.forEach.call(doc.querySelectorAll('.site-nav__list a[href], .site-footer__nav a[href]'), function (a) {
      var href = a.getAttribute('href') || '';
      var path = href.split('#')[0];
      if (path && path === file) { a.setAttribute('aria-current', 'page'); }
    });
  }());


  /* ---------- Parallax (hero layers + section visuals) ---------- */
  var heroStage = doc.querySelector('.hero--fold .hero__stage') || doc.querySelector('.hero__stage');
  var heroLayers = heroStage ? Array.prototype.slice.call(heroStage.querySelectorAll('.hero__layer[data-parallax]')) : [];
  var vizShots = Array.prototype.slice.call(doc.querySelectorAll('.viz-frame__shot img')).filter(function (el) {
    return !el.closest('.sites-map');
  });

  var parallaxTick = false;
  var applyParallax = function () {
    parallaxTick = false;
    if (motionOff()) {
      root.classList.remove('has-parallax');
      heroLayers.forEach(function (el) { el.style.transform = ''; });
      vizShots.forEach(function (el) { el.style.setProperty('--viz-shift', '0px'); });
      return;
    }
    root.classList.add('has-parallax');
    var y = window.pageYOffset || root.scrollTop || 0;
    if (heroStage) {
      var hero = heroStage.parentElement;
      var heroH = hero ? hero.offsetHeight : 0;
      if (y < heroH + 80) {
        heroLayers.forEach(function (el) {
          var factor = parseFloat(el.getAttribute('data-parallax')) || 0;
          el.style.transform = 'translate3d(0,' + Math.round(y * factor) + 'px,0)';
        });
      }
    }
    var vh = window.innerHeight || 800;
    vizShots.forEach(function (el) {
      var rect = el.getBoundingClientRect();
      if (rect.bottom < -40 || rect.top > vh + 40) { return; }
      var progress = (vh - rect.top) / (vh + rect.height);
      var shift = Math.round((progress - 0.5) * 28);
      el.style.setProperty('--viz-shift', shift + 'px');
    });
  };
  var onParallaxScroll = function () {
    if (!parallaxTick) {
      parallaxTick = true;
      window.requestAnimationFrame(applyParallax);
    }
  };
  if (heroLayers.length || vizShots.length) {
    applyParallax();
    window.addEventListener('scroll', onParallaxScroll, { passive: true });
    window.addEventListener('resize', onParallaxScroll, { passive: true });
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', applyParallax);
    } else if (reduceMotion.addListener) {
      reduceMotion.addListener(applyParallax);
    }
  }

  /* ---------- Sites map: pin ↔ row pairing ---------- */
  var sitesLayout = doc.querySelector('.sites-layout');
  if (sitesLayout) {
    var siteBtns = Array.prototype.slice.call(sitesLayout.querySelectorAll('button[data-site]'));
    var selectedSite = 'k1';
    var siteCaptionEl = sitesLayout.querySelector('[data-sites-caption]');
    var siteCaptionIdle = 'First plots.';
    var siteCaptions = {
      k1: 'K1 Söderhamn — coastal. Status Plot.',
      k2: 'K2 Bollnäs — inland. Status Plot.',
      k3: 'K3 Ljusdal — northwest. Status Plot.'
    };

    var paintSite = function (id) {
      if (id) { sitesLayout.setAttribute('data-active-site', id); }
      else { sitesLayout.setAttribute('data-active-site', ''); }
      siteBtns.forEach(function (btn) {
        btn.setAttribute('aria-pressed', btn.getAttribute('data-site') === selectedSite ? 'true' : 'false');
      });
      if (siteCaptionEl) {
        siteCaptionEl.textContent = (id && siteCaptions[id]) ? siteCaptions[id] : siteCaptionIdle;
      }
    };

    paintSite('k1');

    sitesLayout.addEventListener('pointerover', function (event) {
      var target = event.target.closest('[data-site]');
      if (target && sitesLayout.contains(target)) {
        paintSite(target.getAttribute('data-site'));
      } else {
        paintSite(selectedSite);
      }
    });
    sitesLayout.addEventListener('pointerleave', function () {
      paintSite(selectedSite);
    });
    sitesLayout.addEventListener('focusin', function (event) {
      var target = event.target.closest('[data-site]');
      if (target) { paintSite(target.getAttribute('data-site')); }
    });
    sitesLayout.addEventListener('focusout', function (event) {
      if (!sitesLayout.contains(event.relatedTarget)) { paintSite(selectedSite); }
    });
    sitesLayout.addEventListener('click', function (event) {
      var target = event.target.closest('button[data-site]');
      if (!target || !sitesLayout.contains(target)) { return; }
      var id = target.getAttribute('data-site');
      selectedSite = selectedSite === id ? null : id;
      paintSite(selectedSite);
      Array.prototype.forEach.call(sitesLayout.querySelectorAll('.sites-map__pin'), function (pin) {
        pin.classList.remove('is-pulse');
      });
      if (selectedSite && !motionOff()) {
        var pulseT = sitesLayout.querySelector('.sites-map__pin[data-site="' + selectedSite + '"]');
        if (pulseT) {
          void pulseT.offsetWidth;
          pulseT.classList.add('is-pulse');
          window.setTimeout(function () { pulseT.classList.remove('is-pulse'); }, 650);
        }
      }
    });
    sitesLayout.addEventListener('keydown', function (event) {
      var keys = { ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1, Home: 'home', End: 'end' };
      if (!(event.key in keys)) { return; }
      var current = event.target.closest('button[data-site]');
      if (!current) { return; }
      var codes = ['k1', 'k2', 'k3'];
      var id = current.getAttribute('data-site');
      var idx = codes.indexOf(id);
      if (idx < 0) { return; }
      var move = keys[event.key];
      if (move === 'home') { idx = 0; }
      else if (move === 'end') { idx = codes.length - 1; }
      else { idx = ((idx + move) % codes.length + codes.length) % codes.length; }
      event.preventDefault();
      var onPin = current.classList.contains('sites-map__pin');
      var sel = onPin
        ? '.sites-map__pin[data-site="' + codes[idx] + '"]'
        : '.site-board__row[data-site="' + codes[idx] + '"]';
      var next = sitesLayout.querySelector(sel);
      if (next) { next.focus(); paintSite(codes[idx]); }
    });
    var onCaptionWidth = function () { paintSite(selectedSite); };
    if (motionNarrow.addEventListener) { motionNarrow.addEventListener('change', onCaptionWidth); }
    else if (motionNarrow.addListener) { motionNarrow.addListener(onCaptionWidth); }
  }

  /* ---------- Footer year ---------- */
  var year = doc.getElementById('year');
  if (year) { year.textContent = String(new Date().getFullYear()); }


  /* ---------- Audience verticals: each [data-verticals] wraps on its items (or per data-group); never hide active index rows ---------- */
  var bindVerticals = function (verts) {
    var vItems = Array.prototype.slice.call(verts.querySelectorAll('.vertical'));
    var vJumps = Array.prototype.slice.call(verts.querySelectorAll('[data-jump]'));
    var vGroups = Array.prototype.slice.call(verts.querySelectorAll('[data-v-group]'));
    var vI = 0;
    var groupOf = function (idx) {
      var el = vItems[idx];
      return el && el.getAttribute('data-group') ? el.getAttribute('data-group') : '';
    };
    var idsInGroup = function (g) {
      var out = [];
      vItems.forEach(function (el, j) {
        if (!g || (el.getAttribute('data-group') || '') === g) { out.push(j); }
      });
      return out.length ? out : vItems.map(function (_el, j) { return j; });
    };
    var vReady = false;
    var showV = function (idx, delta) {
      if (!vItems.length) { return; }
      if (typeof delta === 'number') {
        var ids = idsInGroup(groupOf(vI));
        var pos = ids.indexOf(vI);
        if (pos < 0) { pos = 0; }
        vI = ids[((pos + delta) % ids.length + ids.length) % ids.length];
      } else {
        var n = vItems.length;
        var parsed = parseInt(idx, 10);
        if (isNaN(parsed)) { parsed = 0; }
        vI = ((parsed % n) + n) % n;
      }
      vItems.forEach(function (el, j) {
        el.classList.toggle('is-active', j === vI);
      });
      if (vReady && !motionOff()) {
        var panel = vItems[vI].querySelector('.vertical__panel');
        if (panel) {
          panel.classList.remove('is-enter');
          void panel.offsetWidth;
          panel.classList.add('is-enter');
        }
      }
      vReady = true;
      vJumps.forEach(function (btn) {
        var on = btn.getAttribute('data-jump') === String(vI);
        btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        btn.hidden = false;
        btn.removeAttribute('hidden');
        if (btn.parentElement) {
          btn.parentElement.hidden = false;
          btn.parentElement.removeAttribute('hidden');
        }
      });
      var gNow = groupOf(vI);
      vGroups.forEach(function (gEl) {
        gEl.classList.toggle('is-active', gEl.getAttribute('data-v-group') === gNow);
      });
      var countEl = verts.querySelector('[data-v-count]');
      if (countEl) {
        var idsNow = idsInGroup(gNow);
        var posNow = idsNow.indexOf(vI);
        if (posNow < 0) { posNow = 0; }
        fadeText(countEl, pad2(posNow + 1) + ' / ' + pad2(idsNow.length));
      }
    };
    showV(0);
    var vPrev = verts.querySelector('[data-v-prev]');
    var vNext = verts.querySelector('[data-v-next]');
    if (vPrev) { vPrev.addEventListener('click', function () { showV(vI, -1); }); }
    if (vNext) { vNext.addEventListener('click', function () { showV(vI, 1); }); }
    vJumps.forEach(function (btn) {
      btn.addEventListener('click', function () {
        showV(parseInt(btn.getAttribute('data-jump'), 10));
      });
    });
    verts.addEventListener('keydown', function (event) {
      var keys = { ArrowLeft: -1, ArrowRight: 1, Home: 'home', End: 'end' };
      if (!(event.key in keys)) { return; }
      var onCtrl = event.target.closest('[data-jump], [data-v-prev], [data-v-next], .vertical-controls, .chapter-step');
      if (!onCtrl) { return; }
      event.preventDefault();
      if (event.key === 'Home') {
        var idsH = idsInGroup(groupOf(vI));
        showV(idsH[0]);
        return;
      }
      if (event.key === 'End') {
        var idsE = idsInGroup(groupOf(vI));
        showV(idsE[idsE.length - 1]);
        return;
      }
      showV(vI, keys[event.key]);
    });
  };
  Array.prototype.forEach.call(doc.querySelectorAll('[data-verticals]'), bindVerticals);

  /* ---------- Hero / chapter clip play ---------- */
  window.requestAnimationFrame(function () {
    var heroEl = doc.querySelector('.hero');
    if (heroEl) { heroEl.classList.add('is-ready'); }
    var chapterEl = doc.querySelector('.chapter');
    if (chapterEl) { chapterEl.classList.add('is-ready'); }
    var sideHero = doc.querySelector('.side-hero');
    if (sideHero) { sideHero.classList.add('is-ready'); }
  });

  /* ---------- Sticky Approach chapter: rAF + getBoundingClientRect, 0.22 lerp ---------- */
  var product = doc.querySelector('[data-chapter]');
  var productRaf = 0;
  var productP = 0;
  var productNarrow = window.matchMedia('(max-width: 719px)');
  var creditLines = ['Kelvin Flexbox', 'Kelvin Flexbox, exploded', 'Kelvin Flexbox — Heat pipe'];
  var claimStops = [0.16, 0.42, 0.72];
  /* Claim gates sit a beat below the visual stops so 0.22 lerp
     approaching from below actually lights the claim (p=0.08 used
     to leave copyOp 0 / claim -1; p=0.55 stayed on 02). */
  var claimShowAt = 0.045;
  var claimBAt = 0.26;
  var claimCAt = 0.52;
  var lastCredit = '';
  var claimIndexOf = function (p) {
    if (p >= claimCAt) { return 2; }
    if (p >= claimBAt) { return 1; }
    return 0;
  };
  var productPinLive = function () {
    if (!product || prefersReducedMotion() || productNarrow.matches) { return false; }
    var track = product.querySelector('.chapter__track') || product;
    var rect = track.getBoundingClientRect();
    var vh = window.innerHeight || 800;
    return rect.top <= 2 && rect.bottom >= vh - 2;
  };
  var readProductP = function () {
    var track = product.querySelector('.chapter__track') || product;
    var rect = track.getBoundingClientRect();
    var vh = window.innerHeight || 800;
    var total = Math.max(track.offsetHeight - vh, 1);
    var p = (-rect.top) / total;
    if (p < 0) { p = 0; }
    if (p > 1) { p = 1; }
    return p;
  };
  var paintProduct = function (p) {
    var orbits = product.querySelectorAll('.orbit');
    var credit = product.querySelector('[data-hero-credit]');
    product.style.setProperty('--p', p.toFixed(4));
    var idx = claimIndexOf(p);
    var show = p >= claimShowAt;
    Array.prototype.forEach.call(orbits, function (el, i) {
      var on = show && i === idx;
      el.classList.toggle('is-active', on);
      el.classList.toggle('is-on', on);
    });
    product.setAttribute('data-claim', show ? String(idx) : '-1');
    var nextCredit = creditLines[idx] || creditLines[0];
    if (credit && nextCredit !== lastCredit) {
      lastCredit = nextCredit;
      fadeText(credit, nextCredit);
    }
  };
  var applyProduct = function () {
    productRaf = 0;
    if (!product) { return; }
    var orbits = product.querySelectorAll('.orbit');
    var credit = product.querySelector('[data-hero-credit]');
    if (prefersReducedMotion() || productNarrow.matches) {
      productP = 0;
      product.style.setProperty('--p', '0');
      product.setAttribute('data-claim', 'all');
      Array.prototype.forEach.call(orbits, function (el) {
        el.classList.add('is-active');
        el.classList.add('is-on');
      });
      lastCredit = 'Kelvin Flexbox';
      if (credit) {
        if (credit._fadeT) { window.clearTimeout(credit._fadeT); credit._fadeT = 0; }
        credit.classList.remove('is-swap');
        credit.textContent = lastCredit;
      }
      return;
    }
    var target = readProductP();
    var delta = target - productP;
    if (Math.abs(delta) < 0.0009) { productP = target; }
    else { productP += delta * 0.22; }
    paintProduct(productP);
    if (Math.abs(target - productP) >= 0.0009) {
      productRaf = window.requestAnimationFrame(applyProduct);
    }
  };
  var onProductScroll = function () {
    if (!productRaf) { productRaf = window.requestAnimationFrame(applyProduct); }
  };
  var scrollProductToP = function (p) {
    if (!product) { return; }
    if (p < 0) { p = 0; }
    if (p > 1) { p = 1; }
    var track = product.querySelector('.chapter__track') || product;
    var vh = window.innerHeight || 800;
    var total = Math.max(track.offsetHeight - vh, 1);
    var rect = track.getBoundingClientRect();
    var y = (window.pageYOffset || window.scrollY || 0) + (rect.top + p * total);
    window.scrollTo(0, y);
  };
  if (product) {
    applyProduct();
    window.addEventListener('scroll', onProductScroll, { passive: true });
    window.addEventListener('resize', onProductScroll, { passive: true });
    if (reduceMotion.addEventListener) { reduceMotion.addEventListener('change', applyProduct); }
    else if (reduceMotion.addListener) { reduceMotion.addListener(applyProduct); }
    doc.addEventListener('keydown', function (event) {
      if (!productPinLive()) { return; }
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) { return; }
      if (doc.body.classList.contains('nav-open')) { return; }
      var tag = event.target && event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') { return; }
      if (event.target && event.target.isContentEditable) { return; }
      var p = productP;
      var idx = claimIndexOf(p);
      var show = p >= claimShowAt;
      var key = event.key;
      if (key === 'Home') {
        event.preventDefault();
        scrollProductToP(0);
        return;
      }
      if (key === 'End') {
        event.preventDefault();
        scrollProductToP(claimStops[2]);
        return;
      }
      var next = key === 'ArrowDown' || key === 'ArrowRight';
      var prev = key === 'ArrowUp' || key === 'ArrowLeft';
      if (!next && !prev) { return; }
      if (next) {
        if (!show) {
          event.preventDefault();
          scrollProductToP(claimStops[0]);
        } else if (idx < 2) {
          event.preventDefault();
          scrollProductToP(claimStops[idx + 1]);
        }
      } else if (show) {
        event.preventDefault();
        if (idx <= 0) { scrollProductToP(0); }
        else { scrollProductToP(claimStops[idx - 1]); }
      }
    });
  }

  /* ---------- Nav tint over dark sections (sample under the pill, skip header) ---------- */
  var pill = doc.querySelector('.nav-pill');
  var navThemeRaf = 0;
  var applyNavTheme = function () {
    navThemeRaf = 0;
    if (!pill) { return; }
    var on = false;
    var x = Math.round((window.innerWidth || 800) * 0.5);
    var y = 56;
    if (doc.elementsFromPoint) {
      var stack = doc.elementsFromPoint(x, y);
      for (var i = 0; i < stack.length; i++) {
        var node = stack[i];
        if (node.closest && node.closest('.site-header')) { continue; }
        if (node.closest && node.closest('[data-theme="dark"], .section--dark, .section--verticals, .site-footer')) {
          on = true;
          break;
        }
      }
    }
    if (on) { pill.setAttribute('data-on-dark', ''); }
    else { pill.removeAttribute('data-on-dark'); }
  };
  var onNavTheme = function () {
    if (!navThemeRaf) { navThemeRaf = window.requestAnimationFrame(applyNavTheme); }
  };
  if (pill) {
    applyNavTheme();
    window.addEventListener('scroll', onNavTheme, { passive: true });
    window.addEventListener('resize', onNavTheme, { passive: true });
  }

  /* ---------- Clip-path: mark frames in view ---------- */
  var frames = doc.querySelectorAll('.viz-frame');
  if (frames.length && 'IntersectionObserver' in window && !motionOff()) {
    var frameIo = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.18 });
    Array.prototype.forEach.call(frames, function (el) { frameIo.observe(el); });
  } else {
    Array.prototype.forEach.call(frames, function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Product still settle: one-shot on first intersect. Motion on + ≥720. Not Ken Burns. ---------- */
  if ('IntersectionObserver' in window && !motionOff()) {
    var settleSeen = [];
    var settleShots = [];
    var addSettleShot = function (el) {
      if (!el || settleSeen.indexOf(el) !== -1) { return; }
      if (el.closest && (el.closest('.sites-map') || el.closest('.sites-layout'))) { return; }
      settleSeen.push(el);
      settleShots.push(el);
    };
    Array.prototype.forEach.call(doc.querySelectorAll('.side-still .viz-frame__shot'), addSettleShot);
    ['unit', 'surplus', 'faas'].forEach(function (id) {
      var sec = doc.getElementById(id);
      if (!sec) { return; }
      Array.prototype.forEach.call(sec.querySelectorAll('.viz-frame__shot'), addSettleShot);
    });
    /* Dest is a .heat-pick: SDA view() already settles the frame.
       IO one-shot only when view-timeline is off — no double-settle. */
    if (!supportsViewTimeline) {
      var destSec = doc.getElementById('dest');
      if (destSec) {
        Array.prototype.forEach.call(destSec.querySelectorAll('.viz-frame__shot'), addSettleShot);
      }
    }
    if (settleShots.length) {
      var settleIo = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          entry.target.classList.add('is-settled');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
      settleShots.forEach(function (el) { settleIo.observe(el); });
    }
  }

  /* ---------- Pointer tilt: Approach full strength; hall still half. Off under reduced-motion and <720. ---------- */
  var bindTilt = function (tiltEl) {
    if (!tiltEl) { return; }
    var raw = parseFloat(tiltEl.getAttribute('data-tilt'));
    var strength = (isNaN(raw) || raw <= 0) ? 1 : raw;
    var tiltRaf = 0, tiltX = 0, tiltY = 0;
    var applyTilt = function () {
      tiltRaf = 0;
      tiltEl.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
      tiltEl.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
    };
    var resetTilt = function () {
      tiltX = 0; tiltY = 0;
      tiltEl.classList.remove('is-tilting');
      applyTilt();
    };
    var stage = tiltEl.closest('.chapter__stage') || tiltEl.closest('.hero__stage') || tiltEl;
    stage.addEventListener('pointermove', function (event) {
      if (motionOff()) { if (tiltEl.classList.contains('is-tilting')) { resetTilt(); } return; }
      var r = tiltEl.getBoundingClientRect();
      var px = (event.clientX - r.left) / Math.max(r.width, 1) - 0.5;
      var py = (event.clientY - r.top) / Math.max(r.height, 1) - 0.5;
      tiltY = px * 8 * strength;
      tiltX = py * -6 * strength;
      tiltEl.classList.add('is-tilting');
      if (!tiltRaf) { tiltRaf = window.requestAnimationFrame(applyTilt); }
    });
    stage.addEventListener('pointerleave', resetTilt);
  };
  Array.prototype.forEach.call(doc.querySelectorAll('[data-tilt]'), bindTilt);

  /* ---------- Right-edge section ticks ---------- */
  var rail = doc.querySelector('.page-rail');
  if (rail) {
    var railLinks = Array.prototype.slice.call(rail.querySelectorAll('a[data-rail]'));
    var railIds = railLinks.map(function (a) { return a.getAttribute('data-rail'); });
    var railSecs = railIds.map(function (id) { return doc.getElementById(id); }).filter(Boolean);
    var paintRail = function () {
      var y = (window.innerHeight || 800) * 0.28;
      var best = railIds[0], bestDist = Infinity;
      railSecs.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        var dist = Math.abs(r.top - y);
        if (r.top <= y + 80) { dist = Math.abs(r.top); }
        if (dist < bestDist && r.bottom > 80) { bestDist = dist; best = sec.id; }
      });
      railLinks.forEach(function (a) {
        if (a.getAttribute('data-rail') === best) { a.setAttribute('aria-current', 'true'); }
        else { a.removeAttribute('aria-current'); }
      });
      var max = Math.max(doc.documentElement.scrollHeight - (window.innerHeight || 800), 1);
      var sp = (window.pageYOffset || 0) / max;
      if (sp < 0) { sp = 0; }
      if (sp > 1) { sp = 1; }
      rail.style.setProperty('--rail-p', sp.toFixed(4));
    };
    paintRail();
    window.addEventListener('scroll', paintRail, { passive: true });
    window.addEventListener('resize', paintRail, { passive: true });
  }

  /* ---------- Spec chips light when Flexbox stage is in view ---------- */
  var chipsRoot = doc.querySelector('[data-spec-chips]');
  if (chipsRoot) {
    var hallSec = doc.getElementById('hall');
    var lightChips = function () { chipsRoot.classList.add('is-lit'); };
    if (hallSec && 'IntersectionObserver' in window) {
      var chipIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) { lightChips(); }
        });
      }, { threshold: 0.28 });
      chipIo.observe(hallSec);
    } else { lightChips(); }
  }

  /* ---------- Scale / heat / mode stops (buttons, arrows, no library) ---------- */
  var bindPressedGroup = function (root, btnSel, apply) {
    if (!root) { return; }
    var btns = Array.prototype.slice.call(root.querySelectorAll(btnSel));
    if (!btns.length) { return; }
    var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: 'home', End: 'end' };
    var prevBtn = root.querySelector('[data-step-prev]');
    var nextBtn = root.querySelector('[data-step-next]');
    var countEl = root.querySelector('[data-step-count]');
    var wraps = true;
    var currentI = 0;
    var paint = function (i, moveFocus) {
      if (i < 0 || i >= btns.length) { return; }
      currentI = i;
      btns.forEach(function (b, j) {
        b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
      apply(btns[i], i);
      if (countEl) { fadeText(countEl, pad2(i + 1) + ' / ' + pad2(btns.length)); }
      if (moveFocus) { btns[i].focus(); }
    };
    var step = function (delta) {
      var n = btns.length;
      paint(((currentI + delta) % n + n) % n, false);
    };
    btns.forEach(function (btn, i) {
      btn.addEventListener('click', function () { paint(i, false); });
    });
    if (prevBtn) { prevBtn.addEventListener('click', function () { step(-1); }); }
    if (nextBtn) { nextBtn.addEventListener('click', function () { step(1); }); }
    root.addEventListener('keydown', function (event) {
      if (!(event.key in keys)) { return; }
      var tag = event.target && event.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') { return; }
      btns.forEach(function (b, j) {
        if (b.getAttribute('aria-pressed') === 'true') { currentI = j; }
      });
      var current = event.target.closest(btnSel);
      var onStep = event.target.closest && event.target.closest('.chapter-step');
      var i;
      if (current && root.contains(current)) {
        i = btns.indexOf(current);
      } else if (wraps && onStep) {
        i = currentI;
      } else {
        return;
      }
      if (i < 0) { return; }
      var move = keys[event.key];
      var n = btns.length;
      var next;
      if (move === 'home') { next = 0; }
      else if (move === 'end') { next = n - 1; }
      else if (wraps) { next = ((i + move) % n + n) % n; }
      else { next = Math.max(0, Math.min(n - 1, i + move)); }
      event.preventDefault();
      paint(next, true);
    });
    var start = 0;
    btns.forEach(function (b, j) {
      if (b.getAttribute('aria-pressed') === 'true') { start = j; }
    });
    paint(start, false);
  };

  /* Overlay dest stills: never paint an empty forest box. Keep the previous
     is-on until the next img has loaded / decoded. Kick eager so lazy+hidden
     cannot skip the first click. */
  var stillReady = function (picture, then) {
    var img = picture && picture.querySelector('img');
    if (!img) { then(); return; }
    if (img.getAttribute('loading') === 'lazy') { img.loading = 'eager'; }
    if (img.complete) { then(); return; }
    var settled = false;
    var done = function () {
      if (settled) { return; }
      settled = true;
      then();
    };
    img.addEventListener('load', done);
    img.addEventListener('error', done);
    if (typeof img.decode === 'function') {
      img.decode().then(done).catch(function () {
        if (img.complete) { done(); }
      });
    }
  };

  var paintStills = function (root, attr, id, genHolder) {
    if (!root) { return; }
    var sel = '[' + attr + ']';
    var next = root.querySelector('[' + attr + '="' + id + '"]');
    Array.prototype.forEach.call(root.querySelectorAll(sel), function (el) {
      el.removeAttribute('hidden');
      el.setAttribute('aria-hidden', el === next ? 'false' : 'true');
      var img = el.querySelector('img');
      if (!img) { return; }
      if (img.getAttribute('loading') === 'lazy') { img.loading = 'eager'; }
      if (typeof img.decode === 'function') { img.decode().catch(function () {}); }
    });
    genHolder.n += 1;
    var token = genHolder.n;
    var go = function () {
      if (token !== genHolder.n) { return; }
      Array.prototype.forEach.call(root.querySelectorAll(sel), function (el) {
        el.classList.toggle('is-on', el === next);
      });
    };
    stillReady(next, go);
  };

  var scaleRoot = doc.querySelector('[data-scale]');
  var scaleGen = { n: 0 };
  bindPressedGroup(scaleRoot, 'button[data-scale]', function (btn) {
    var id = btn.getAttribute('data-scale');
    var capText = btn.getAttribute('data-scale-cap');
    var copyText = btn.getAttribute('data-scale-copy');
    var cap = scaleRoot.querySelector('.viz-cap [data-scale-cap], .viz-cap__line[data-scale-cap]');
    var copyEl = scaleRoot.querySelector('.scale__note');
    if (cap && capText) { fadeText(cap, capText); }
    if (copyEl && copyText) { fadeText(copyEl, copyText); }
    paintStills(scaleRoot, 'data-scale-still', id, scaleGen);
  });

  var heatCopy = {
    industrial: {
      cap: 'Industrial host — load at the mill',
      copy: 'Local Heat at the mill — premises and process on site. The mill stays on; Compute flexes.',
      kicker: '01 Industrial'
    },
    residential: {
      cap: 'District Heat — into the network',
      copy: 'Heat into the district network that already serves buildings and homes.',
      kicker: '02 Residential'
    },
    hydro: {
      cap: 'Hydro — surplus at generation',
      copy: 'Surplus at generation, behind the meter or spare connection.',
      kicker: '03 Hydro'
    },
    geothermal: {
      cap: 'Geothermal — Heat sink next to the pad',
      copy: 'A Heat sink next to the pad.',
      kicker: '04 Geothermal'
    },
    gas: {
      cap: 'Gas — dispatchable adjacency',
      copy: 'An industrial host with dispatchable adjacency. Kelvin does not own generation.',
      kicker: '05 Gas'
    },
    solar: {
      cap: 'Solar and wind — surplus at generation',
      copy: 'Surplus and curtailment at generation, behind the meter or spare connection.',
      kicker: '06 Solar & wind'
    },
    process: {
      cap: 'Process — a pipe to drying or kilns',
      copy: 'Local process Heat — drying, kilns, the line you already run.',
      kicker: '07 Process'
    }
  };

  Array.prototype.forEach.call(doc.querySelectorAll('[data-heat]:not(button)'), function (heatRoot) {
    var heatGen = { n: 0 };
    bindPressedGroup(heatRoot, 'button[data-heat]', function (btn) {
      var id = btn.getAttribute('data-heat');
      var pack = heatCopy[id] || heatCopy.industrial;
      var capText = btn.getAttribute('data-heat-cap') || pack.cap;
      var copyText = btn.getAttribute('data-heat-copy') || pack.copy;
      var kickerText = btn.getAttribute('data-heat-kicker') || pack.kicker;
      var cap = heatRoot.querySelector('.viz-cap [data-heat-cap], .viz-cap__line[data-heat-cap]');
      var copyEl = heatRoot.querySelector('.heat-pick__copy');
      var kickerEl = heatRoot.querySelector('.heat-pick__kicker');
      if (cap) { fadeText(cap, capText); }
      if (copyEl) { fadeText(copyEl, copyText); }
      if (kickerEl) { fadeText(kickerEl, kickerText); }
      paintStills(heatRoot, 'data-heat-still', id, heatGen);
    });
  });

  var modeCopy = {
    surplus: 'When surplus is on the wire, the load ramps up. The host stays on.',
    tight: 'Jobs checkpoint and the site steps down. Heat follows the load.'
  };
  /* ---------- Compute pad catalogue: 01–04, one panel + still. Same as heat/scale. ---------- */
  Array.prototype.forEach.call(doc.querySelectorAll('[data-pad]'), function (padRoot) {
    var padGen = { n: 0 };
    bindPressedGroup(padRoot, 'button[data-pad-part]', function (btn) {
      var id = btn.getAttribute('data-pad-part');
      var capText = btn.getAttribute('data-pad-cap');
      var copyText = btn.getAttribute('data-pad-copy');
      var kickerText = btn.getAttribute('data-pad-kicker');
      var cap = padRoot.querySelector('.viz-cap [data-pad-cap], .viz-cap__line[data-pad-cap]');
      var copyEl = padRoot.querySelector('[data-pad-copy].heat-pick__copy, .heat-pick__copy[data-pad-copy]');
      var kickerEl = padRoot.querySelector('[data-pad-kicker].heat-pick__kicker, .heat-pick__kicker[data-pad-kicker]');
      if (cap && capText) { fadeText(cap, capText); }
      if (copyEl && copyText) { fadeText(copyEl, copyText); }
      if (kickerEl && kickerText) { fadeText(kickerEl, kickerText); }
      paintStills(padRoot, 'data-pad-still', id, padGen);
    });
  });

  var modeRoot = doc.querySelector('[data-mode]');
  bindPressedGroup(modeRoot, 'button[data-mode]', function (btn) {
    var copyEl = modeRoot.querySelector('[data-mode-copy]');
    if (copyEl) { fadeText(copyEl, modeCopy[btn.getAttribute('data-mode')] || modeCopy.surplus); }
  });


  /* ---------- Hall: Closed/Exploded shell + chip to spec + chapter rail ---------- */
  var hallPair = doc.querySelector('[data-hall-pair]');
  var hallGen = { n: 0 };
  var setHallShell = function (id) {
    if (!hallPair || (id !== 'closed' && id !== 'exploded')) { return; }
    hallPair.classList.toggle('is-exploded', id === 'exploded');
    hallPair.setAttribute('data-shell', id);
    paintStills(hallPair, 'data-shell-still', id, hallGen);
    var cap = hallPair.querySelector('[data-shell-cap]');
    if (cap) {
      fadeText(cap, id === 'exploded'
        ? 'Kelvin Flexbox, exploded. 4 racks.'
        : 'Kelvin Flexbox — door, louvers, Heat-out');
    }
    Array.prototype.forEach.call(hallPair.querySelectorAll('button[data-shell]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-shell') === id ? 'true' : 'false');
    });
  };

  var paintChip = function (id) {
    if (!id || !hallPair) { return; }
    hallPair.setAttribute('data-active-chip', id);
    Array.prototype.forEach.call(doc.querySelectorAll('.spec-chips [data-chip]'), function (btn) {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-chip') === id ? 'true' : 'false');
    });
    var row = null;
    Array.prototype.forEach.call(doc.querySelectorAll('.spec-strip > div[data-chip]'), function (el) {
      var on = el.getAttribute('data-chip') === id;
      el.classList.toggle('is-on', on);
      if (on) { row = el; }
    });
    if (id === 'rk') { setHallShell('exploded'); }
    var shell = hallPair.getAttribute('data-shell') || 'closed';
    Array.prototype.forEach.call(hallPair.querySelectorAll('.flex-hotspot'), function (spot) {
      spot.classList.remove('is-pulse');
    });
    if (!motionOff()) {
      Array.prototype.forEach.call(hallPair.querySelectorAll('.flex-hotspot[data-chip="' + id + '"]'), function (spot) {
        var spotShell = spot.getAttribute('data-shell');
        if (spotShell && spotShell !== shell) { return; }
        void spot.offsetWidth;
        spot.classList.add('is-pulse');
        window.setTimeout(function () { spot.classList.remove('is-pulse'); }, 700);
      });
    }
    if (row && row.scrollIntoView) {
      try { row.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
      catch (e) { row.scrollIntoView(false); }
    }
  };

  bindPressedGroup(hallPair, 'button[data-shell]', function (btn) {
    setHallShell(btn.getAttribute('data-shell'));
  });

  if (chipsRoot) {
    var chipBtns = Array.prototype.slice.call(chipsRoot.querySelectorAll('button[data-chip]'));
    chipsRoot.addEventListener('click', function (event) {
      var btn = event.target.closest('button[data-chip]');
      if (!btn || !chipsRoot.contains(btn)) { return; }
      paintChip(btn.getAttribute('data-chip'));
    });
    chipsRoot.addEventListener('keydown', function (event) {
      var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: 'home', End: 'end' };
      if (!(event.key in keys)) { return; }
      var current = event.target.closest('button[data-chip]');
      if (!current || !chipsRoot.contains(current)) { return; }
      var i = chipBtns.indexOf(current);
      if (i < 0) { return; }
      var n = chipBtns.length;
      var move = keys[event.key];
      var next = move === 'home' ? 0 : move === 'end' ? n - 1 : ((i + move) % n + n) % n;
      event.preventDefault();
      paintChip(chipBtns[next].getAttribute('data-chip'));
      chipBtns[next].focus();
    });
  }
  if (hallPair) {
    hallPair.addEventListener('click', function (event) {
      if (event.target.closest('button[data-chip], button[data-shell]')) { return; }
      var spot = event.target.closest('.flex-hotspot[data-chip]');
      if (!spot || !hallPair.contains(spot)) { return; }
      paintChip(spot.getAttribute('data-chip'));
    });
  }

  var hallNav = doc.querySelector('.hall-chapters');
  if (hallNav) {
    var hallLinks = Array.prototype.slice.call(hallNav.querySelectorAll('a[href^="#"]'));
    var hallSecs = hallLinks.map(function (a) {
      return doc.getElementById(a.getAttribute('href').slice(1));
    }).filter(Boolean);
    var paintHallChapters = function () {
      var y = (window.innerHeight || 800) * 0.32;
      var best = hallLinks.length ? hallLinks[0].getAttribute('href').slice(1) : '';
      var bestDist = Infinity;
      hallSecs.forEach(function (sec) {
        var r = sec.getBoundingClientRect();
        var dist = Math.abs(r.top - y);
        if (r.top <= y + 80) { dist = Math.abs(r.top); }
        if (dist < bestDist && r.bottom > 80) { bestDist = dist; best = sec.id; }
      });
      hallLinks.forEach(function (a) {
        var href = a.getAttribute('href');
        var on = href === '#' + best;
        if (on) { a.setAttribute('aria-current', 'true'); }
        else { a.removeAttribute('aria-current'); }
      });
    };
    paintHallChapters();
    window.addEventListener('scroll', paintHallChapters, { passive: true });
    window.addEventListener('resize', paintHallChapters, { passive: true });
  }

  var partsRoot = doc.querySelector('[data-parts]');
  if (partsRoot) {
    var partBtns = Array.prototype.slice.call(partsRoot.querySelectorAll('.parts__btn'));
    var partPanels = Array.prototype.slice.call(partsRoot.querySelectorAll('.parts__panel'));
    var partList = partsRoot.querySelector('.parts__list');
    var reduceParts = prefersReducedMotion();
    var lockListHeight = function () {
      if (!partList || !partBtns.length) { return; }
      var btnH = 0;
      var maxPanel = 0;
      partBtns.forEach(function (btn, i) {
        btnH += btn.offsetHeight;
        var panel = partPanels[i];
        if (!panel) { return; }
        var hid = panel.hasAttribute('hidden');
        var prev = panel.style.maxHeight;
        if (hid) { panel.removeAttribute('hidden'); }
        panel.style.maxHeight = 'none';
        var h = panel.scrollHeight;
        if (h > maxPanel) { maxPanel = h; }
        panel.style.maxHeight = prev;
        if (hid) { panel.setAttribute('hidden', ''); }
      });
      partList.style.height = (btnH + maxPanel) + 'px';
    };
    var paintPart = function (idx, moveFocus) {
      if (idx < 0 || idx >= partBtns.length) { return; }
      partBtns.forEach(function (btn, i) {
        var on = i === idx;
        btn.setAttribute('aria-expanded', on ? 'true' : 'false');
        var panel = partPanels[i];
        if (!panel) { return; }
        if (on) {
          panel.removeAttribute('hidden');
          if (!reduceParts) {
            panel.style.maxHeight = '0px';
            void panel.offsetHeight;
          }
          panel.style.maxHeight = panel.scrollHeight + 'px';
        } else {
          panel.style.maxHeight = '0px';
          if (reduceParts) { panel.setAttribute('hidden', ''); }
          else {
            window.setTimeout(function () {
              if (btn.getAttribute('aria-expanded') !== 'true') { panel.setAttribute('hidden', ''); }
            }, 320);
          }
        }
      });
      if (moveFocus) { partBtns[idx].focus(); }
    };
    var partIds = ['part-fb', 'part-ctl', 'part-heat', 'part-lv'];
    var openPartFromHash = function () {
      var id = (location.hash || '').replace('#', '');
      var idx = partIds.indexOf(id);
      if (idx < 0) { return false; }
      paintPart(idx, false);
      return true;
    };
    lockListHeight();
    if (!openPartFromHash()) { paintPart(0, false); }
    window.addEventListener('hashchange', openPartFromHash);
    window.addEventListener('resize', lockListHeight, { passive: true });
    partBtns.forEach(function (btn, i) {
      btn.addEventListener('click', function () { paintPart(i, false); });
    });
    doc.querySelectorAll('.catalogue__row[data-part]').forEach(function (row) {
      row.addEventListener('click', function () {
        var id = 'part-' + row.getAttribute('data-part');
        var idx = partIds.indexOf(id);
        if (idx >= 0) { paintPart(idx, false); }
      });
    });
    partsRoot.addEventListener('keydown', function (event) {
      var keys = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1, Home: 'home', End: 'end' };
      if (!(event.key in keys)) { return; }
      var current = event.target.closest('.parts__btn');
      if (!current || !partsRoot.contains(current)) { return; }
      var i = partBtns.indexOf(current);
      if (i < 0) { return; }
      var move = keys[event.key];
      var n = partBtns.length;
      var next = move === 'home' ? 0 : move === 'end' ? n - 1 : ((i + move) % n + n) % n;
      event.preventDefault();
      paintPart(next, true);
    });
  }


  /* ---------- Thermal grade ticks: click/focus names the point. Hairline stays CSS. ---------- */
  var gradeRoot = doc.querySelector('[data-grade]');
  if (gradeRoot) {
    bindPressedGroup(gradeRoot, 'button[data-grade]', function (btn) {
      var live = doc.querySelector('.grade-live');
      if (live) { fadeText(live, btn.getAttribute('data-grade-live') || ''); }
    });
    gradeRoot.addEventListener('focusin', function (event) {
      var btn = event.target.closest('button[data-grade]');
      if (!btn || !gradeRoot.contains(btn)) { return; }
      var live = doc.querySelector('.grade-live');
      if (live) { fadeText(live, btn.getAttribute('data-grade-live') || ''); }
    });
  }

  /* ---------- Compute load tiers: 4-stop picker, one panel. Buffer muted. ---------- */
  var tierRoot = doc.querySelector('[data-tiers]');
  bindPressedGroup(tierRoot, 'button[data-tier]', function (btn) {
    if (!tierRoot) { return; }
    var id = btn.getAttribute('data-tier');
    Array.prototype.forEach.call(tierRoot.querySelectorAll('[data-tier-panel]'), function (panel) {
      var on = panel.getAttribute('data-tier-panel') === id;
      panel.classList.toggle('is-on', on);
      panel.setAttribute('aria-hidden', on ? 'false' : 'true');
      panel.removeAttribute('hidden');
    });
  });

  /* ---------- Flexibility markets / Energy queue: aria-current + one-line under H2. Disclaimer stays. ---------- */
  var bindScanLive = function (root, btnSel, liveSel, liveAttr, fallback) {
    bindPressedGroup(root, btnSel, function (btn) {
      if (!root) { return; }
      var live = doc.querySelector(liveSel);
      if (live) { fadeText(live, btn.getAttribute(liveAttr) || fallback); }
    });
  };
  bindScanLive(doc.querySelector('[data-markets]'), 'button[data-market]', '.markets-live', 'data-market-live', 'Built for.');
  bindScanLive(doc.querySelector('[data-queue]'), 'button[data-queue]', '.queue-live', 'data-queue-live', 'The queue — years on a demand connection.');


  /* ---------- Gap stats row: select a figure, live gloss, optional auto-advance ---------- */
  var bindStatsRow = function (row) {
    if (!row) { return; }
    var btns = Array.prototype.slice.call(row.querySelectorAll('button[data-stat-gloss]'));
    if (!btns.length) { return; }
    var glossEl = null;
    if (row.parentNode) { glossEl = row.parentNode.querySelector('[data-stats-gloss]'); }
    if (!glossEl) { glossEl = row.querySelector('[data-stats-gloss]'); }
    var i = 0;
    btns.forEach(function (b, j) {
      if (b.getAttribute('aria-pressed') === 'true') { i = j; }
    });
    var inView = false;
    var hoverPause = false;
    var timer = 0;
    var paint = function (idx) {
      if (idx < 0 || idx >= btns.length) { return; }
      i = idx;
      btns.forEach(function (b, j) {
        b.setAttribute('aria-pressed', j === i ? 'true' : 'false');
      });
      if (glossEl) { fadeText(glossEl, btns[i].getAttribute('data-stat-gloss') || ''); }
    };
    var stopAuto = function () {
      if (timer) { window.clearInterval(timer); timer = 0; }
    };
    var startAuto = function () {
      stopAuto();
      if (motionOff() || !inView || hoverPause) { return; }
      timer = window.setInterval(function () {
        if (motionOff() || !inView || hoverPause) { return; }
        paint((i + 1) % btns.length);
      }, 4500);
    };
    btns.forEach(function (btn, j) {
      btn.addEventListener('click', function () { paint(j); stopAuto(); startAuto(); });
    });
    row.addEventListener('keydown', function (event) {
      var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1, Home: 'home', End: 'end' };
      if (!(event.key in keys)) { return; }
      var current = event.target.closest('button[data-stat-gloss]');
      if (!current || !row.contains(current)) { return; }
      var idx = btns.indexOf(current);
      if (idx < 0) { return; }
      var move = keys[event.key];
      var n = btns.length;
      var next = move === 'home' ? 0 : move === 'end' ? n - 1 : ((idx + move) % n + n) % n;
      event.preventDefault();
      paint(next);
      btns[next].focus();
      stopAuto();
      startAuto();
    });
    var pause = function () { hoverPause = true; stopAuto(); };
    var resume = function () { hoverPause = false; startAuto(); };
    row.addEventListener('pointerenter', pause);
    row.addEventListener('pointerleave', resume);
    row.addEventListener('focusin', pause);
    row.addEventListener('focusout', function (event) {
      if (!row.contains(event.relatedTarget)) { resume(); }
    });
    if (glossEl) {
      glossEl.addEventListener('pointerenter', pause);
      glossEl.addEventListener('pointerleave', resume);
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          inView = entry.isIntersecting;
          if (inView) { startAuto(); } else { stopAuto(); }
        });
      }, { threshold: 0.35 });
      io.observe(row);
    } else {
      inView = true;
      startAuto();
    }
    if (reduceMotion.addEventListener) { reduceMotion.addEventListener('change', function () { stopAuto(); startAuto(); }); }
    else if (reduceMotion.addListener) { reduceMotion.addListener(function () { stopAuto(); startAuto(); }); }
    if (motionNarrow.addEventListener) { motionNarrow.addEventListener('change', function () { stopAuto(); startAuto(); }); }
    else if (motionNarrow.addListener) { motionNarrow.addListener(function () { stopAuto(); startAuto(); }); }
  };
  Array.prototype.forEach.call(doc.querySelectorAll('[data-stats-row]'), bindStatsRow);


  /* ---------- Gap proof count-up (once, in view). No new numbers. ---------- */
  var countEls = Array.prototype.slice.call(doc.querySelectorAll('[data-count]'));
  var runCount = function (el) {
    if (el.getAttribute('data-counted') === '1') { return; }
    el.setAttribute('data-counted', '1');
    var target = parseFloat(el.getAttribute('data-count'));
    if (isNaN(target)) { return; }
    var decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (isNaN(decimals) || decimals < 0) { decimals = 0; }
    var start = performance.now();
    var dur = 720;
    var tick = function (now) {
      var t = Math.min(1, (now - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      var val = target * eased;
      el.textContent = val.toFixed(decimals);
      if (t < 1) { window.requestAnimationFrame(tick); }
      else { el.textContent = target.toFixed(decimals); }
    };
    window.requestAnimationFrame(tick);
  };
  if (countEls.length) {
    if (!('IntersectionObserver' in window) || motionOff()) {
      /* leave the published figures in the markup */
    } else {
      var countIo = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) { return; }
          var nums = entry.target.querySelectorAll ? entry.target.querySelectorAll('[data-count]') : [];
          if (entry.target.hasAttribute && entry.target.hasAttribute('data-count')) {
            runCount(entry.target);
          }
          Array.prototype.forEach.call(nums, runCount);
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.4 });
      var countRoots = doc.querySelectorAll('.hero-stats, .stats--row');
      if (countRoots.length) {
        Array.prototype.forEach.call(countRoots, function (root) { countIo.observe(root); });
      } else {
        countEls.forEach(function (el) { countIo.observe(el); });
      }
    }
  }

})();
