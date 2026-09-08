(function () {
  var root = document.documentElement;
  var art = document.querySelector('.doc-body');
  var L = art ? art.dataset : {};
  var copyLabel = L.copy || 'Copy', copiedLabel = L.copied || 'Copied';

  // ---- theme (light / dark), remembered in localStorage ----
  var saved = null;
  try { saved = localStorage.getItem('narit-theme'); } catch (e) {}
  if (saved) root.setAttribute('data-theme', saved);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) root.setAttribute('data-theme', 'dark');
  var tbtn = document.querySelector('[data-theme-toggle]');
  function paintTheme() { if (tbtn) tbtn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀︎' : '☾'; }
  if (tbtn) {
    paintTheme();
    tbtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('narit-theme', next); } catch (e) {}
      paintTheme();
    });
  }

  // ---- copy buttons ----
  document.querySelectorAll('pre').forEach(function (pre) {
    var btn = document.createElement('button');
    btn.className = 'copy-btn'; btn.type = 'button'; btn.textContent = copyLabel;
    btn.addEventListener('click', function () {
      var code = pre.querySelector('code');
      var text = code ? code.innerText : pre.innerText;
      var done = function () {
        btn.textContent = copiedLabel; btn.classList.add('done');
        setTimeout(function () { btn.textContent = copyLabel; btn.classList.remove('done'); }, 1600);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done);
      else {
        var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta);
        ta.select(); try { document.execCommand('copy'); } catch (e) {} document.body.removeChild(ta); done();
      }
    });
    pre.appendChild(btn);
  });

  // ---- mobile menu ----
  var menu = document.querySelector('[data-menu]');
  var side = document.getElementById('sidebar');
  if (menu && side) {
    menu.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = side.classList.toggle('open');
      menu.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', function (e) {
      if (side.classList.contains('open') && !side.contains(e.target)) {
        side.classList.remove('open'); menu.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---- details body wrapper ----
  document.querySelectorAll('details').forEach(function (d) {
    if (d.querySelector(':scope > .details-body')) return;
    var wrap = document.createElement('div'); wrap.className = 'details-body';
    Array.prototype.slice.call(d.childNodes).forEach(function (n) {
      if (!(n.tagName && n.tagName.toLowerCase() === 'summary')) wrap.appendChild(n);
    });
    d.appendChild(wrap);
  });

  // ---- wrap tables for horizontal scroll ----
  document.querySelectorAll('.doc-body table').forEach(function (t) {
    var w = document.createElement('div'); w.className = 'table-wrap';
    t.parentNode.insertBefore(w, t); w.appendChild(t);
  });

  // ---- heading anchors ----
  document.querySelectorAll('.doc-body h2[id], .doc-body h3[id]').forEach(function (h) {
    var a = document.createElement('a'); a.className = 'anchor'; a.href = '#' + h.id; a.textContent = '#'; a.setAttribute('aria-hidden', 'true');
    h.insertBefore(a, h.firstChild);
  });

  // ---- reading progress bar + back to top ----
  var bar = document.querySelector('.progress');
  var top = document.querySelector('.totop');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? (h.scrollTop / max) : 0;
    if (bar) bar.style.width = (p * 100) + '%';
    if (top) top.classList.toggle('show', h.scrollTop > 600);
    if (p > 0.9 && art && art.dataset.slug) markDone(art.dataset.slug);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // ---- remember finished sections (per language) ----
  var lang = root.getAttribute('lang') || 'en';
  var key = 'narit-done-' + lang;
  function getDone() { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; } }
  function markDone(slug) {
    var d = getDone(); if (d.indexOf(slug) >= 0) return;
    d.push(slug); try { localStorage.setItem(key, JSON.stringify(d)); } catch (e) {}
    paintDone();
  }
  function paintDone() {
    var d = getDone(); var items = document.querySelectorAll('.side-list li');
    items.forEach(function (li) { if (d.indexOf(li.dataset.slug) >= 0 && !li.classList.contains('active')) li.classList.add('done'); });
    var sp = document.querySelector('.side-progress');
    if (sp && items.length) {
      var n = d.length;
      sp.querySelector('.bar i').style.width = Math.round(100 * n / items.length) + '%';
      sp.querySelector('.txt').textContent = (sp.dataset.label || '').replace('{n}', n).replace('{t}', items.length);
    }
  }
  paintDone();

  // ---- scroll-spy for "on this page" ----
  var links = document.querySelectorAll('.onpage a[href^="#"]');
  if (links.length && 'IntersectionObserver' in window) {
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          if (current) current.classList.remove('current');
          current = map[en.target.id]; if (current) current.classList.add('current');
        }
      });
    }, { rootMargin: '-64px 0px -70% 0px', threshold: 0 });
    Object.keys(map).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }
})();
