(() => {
const P = window.PORTFOLIO, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
$$('.year').forEach(e => e.textContent = new Date().getFullYear());

/* ---------- counts in nav ---------- */
const count = c => P.WORKS.filter(w => c === 'all' || w.cat === c).length;
$$('.c-all').forEach(e => e.textContent = count('all'));
['ad', 'story', 'fashion', 'vibe', 'web'].forEach(c => $$('.c-' + c).forEach(e => e.textContent = count(c)));

/* ---------- hover preview helper ---------- */
function bindPreview(card, video) {
  if (!video || !video.dataset.preview) return;
  const start = () => { if (reduce) return; if (!video.src) video.src = video.dataset.preview; video.play().then(() => card.classList.add('playing')).catch(() => {}); };
  const stop = () => { video.pause(); card.classList.remove('playing'); };
  card.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') start(); });
  card.addEventListener('pointerleave', stop);
  card.addEventListener('focusin', start); card.addEventListener('focusout', stop);
}

/* ---------- WORK INDEX ---------- */
const state = { cat: 'all', sub: 'all', q: '' };
const tabs = $('.cat-tabs'), subs = $('.sub-chips'), grid = $('.work-grid');
tabs.innerHTML = P.CATS.map(c => `<button class="cat-tab" role="tab" data-cat="${c.id}" aria-selected="${c.id === 'all'}">${c.label}<b>${count(c.id)}</b></button>`).join('');
function renderSubs() {
  const ids = P.SUBS[state.cat]; subs.hidden = !ids; if (!ids) { subs.innerHTML = ''; return; }
  subs.innerHTML = `<button class="sub-chip" data-sub="all" aria-pressed="true">전체<b>${count(state.cat)}</b></button>` + ids.map(id => `<button class="sub-chip" data-sub="${id}" aria-pressed="false">${P.genreOf(id).label}<b>${P.WORKS.filter(w => w.sub === id).length}</b></button>`).join('');
}

function mediaHTML(w) {
  if (w.thumb) return `<img src="${esc(w.thumb)}" alt="" loading="lazy" class="${w.thumbPos === 'top' ? 'pos-top' : ''}"${w.yt ? ` onerror="this.onerror=null;this.src='https://i.ytimg.com/vi/${w.yt}/mqdefault.jpg'"` : ''}>` +
    (w.preview ? `<video muted loop playsinline preload="none" data-preview="${esc(w.preview)}" aria-hidden="true"></video>` : '');
  if (w.art === 'code') return `<div class="art art-code"><span>${(w.artText || []).map(esc).join('<br>')}</span></div>`;
  return `<div class="art art-${w.art}"></div>`;
}
function ctaHTML(c) {
  if (c.pending) return `<span class="btn btn-pending" title="배포 주소를 data.js의 PROJECTS에 넣으면 버튼이 활성화됩니다">${esc(c.label)}</span>`;
  const cls = c.primary ? 'btn btn-lime' : c.minor ? 'btn btn-minor' : 'btn btn-ghost';
  if (c.href) return `<a class="${cls}" href="${esc(c.href)}" target="_blank" rel="noopener">${esc(c.label)}</a>`;
  if (c.film) return `<button class="${cls}" data-play="${c.film}">${esc(c.label)}</button>`;
  if (c.yt) return `<button class="${cls}" data-yt="${c.yt}">${esc(c.label)}</button>`;
  return `<a class="${cls}" href="${c.jump}">${esc(c.label)}</a>`;
}
function renderWork() {
  const q = state.q.trim().toLowerCase();
  const list = P.WORKS.filter(w => (state.cat === 'all' || w.cat === state.cat) && (state.sub === 'all' || w.sub === state.sub) &&
    (!q || [w.title, w.tag, w.tools, w.hook, w.meta].join(' ').toLowerCase().includes(q)));
  const catLabel = P.CATS.find(c => c.id === state.cat).label;
  $('.work-count').innerHTML = `<b>${list.length}</b>개 작업 · ${catLabel}${state.sub !== 'all' ? ' / ' + P.genreOf(state.sub).label : ''}${q ? ` · “${esc(state.q)}” 검색` : ''}`;
  $('.work-empty').hidden = list.length > 0;
  grid.innerHTML = list.map(w => {
    const primary = w.ctas.find(c => c.primary);
    const act = primary ? (primary.film ? `data-play="${primary.film}"` : primary.yt ? `data-yt="${primary.yt}"` : primary.href ? `data-href="${esc(primary.href)}"` : `data-jump="${primary.jump}"`) : '';
    return `<article class="wcard" data-cat="${w.cat}">
      <div class="wcard-media" ${act} data-cursor="${primary && (primary.film || primary.yt) ? 'Play' : w.cat === 'web' ? 'View' : 'Open'}">${mediaHTML(w)}
        <div class="badges"><span class="tag tag-glass">${esc(w.tag)}</span>${w.meta ? `<span class="runtime">${esc(w.meta)}</span>` : ''}</div>
        ${primary && (primary.film || primary.yt) ? '<span class="play-hint" aria-hidden="true">▶</span><span class="bar"></span>' : ''}
      </div>
      <div class="wcard-body">
        <div class="wcard-tagline"><span class="t">${esc(P.CATS.find(c => c.id === w.cat).label)}</span><span>${esc(w.tools)}</span></div>
        <h3>${esc(w.title)}</h3>
        <p class="hook">${esc(w.hook)}</p>
        <div class="wcard-ctas">${w.ctas.map(ctaHTML).join('')}</div>
      </div></article>`;
  }).join('');
  $$('.wcard', grid).forEach(c => bindPreview(c, $('video', c)));
  window.ScrollTrigger?.refresh();
}
function setCat(cat, scroll) {
  state.cat = cat; state.sub = 'all';
  $$('.cat-tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.cat === cat)));
  renderSubs();
  renderWork();
  if (scroll) scrollToEl($('#work'));
}
tabs.addEventListener('click', e => { const b = e.target.closest('.cat-tab'); if (b) setCat(b.dataset.cat); });
subs.addEventListener('click', e => { const b = e.target.closest('.sub-chip'); if (!b) return; state.sub = b.dataset.sub; $$('.sub-chip').forEach(s => s.setAttribute('aria-pressed', String(s === b))); renderWork(); });
const search = $('.work-search input');
search.addEventListener('input', () => { state.q = search.value; renderWork(); });
$('.work-reset').onclick = () => { search.value = ''; state.q = ''; setCat('all'); };
addEventListener('keydown', e => { if (e.key === '/' && !/input|textarea/i.test(document.activeElement.tagName) && !$('dialog[open]')) { e.preventDefault(); scrollToEl($('#work')); setTimeout(() => search.focus({ preventScroll: true }), 400); } });
renderWork();

/* ---------- FILMS: spotlight (섹션마다 하나) ---------- */
const byId = id => P.FILMS.find(f => f.id === id);
$$('.spotlight').forEach(spot => {
  const featured = spot.dataset.featured.split(',').map(byId).filter(Boolean);
  const sImg = $('.spot-poster', spot), sVid = $('.spot-video', spot); let spotI = 0, spotTimer, vis = false;
  $('.spot-dots', spot).innerHTML = featured.map((f, i) => `<button role="tab" aria-label="${esc(f.title)}" aria-selected="${i === 0}"></button>`).join('');
  function show(i) {
    spotI = (i + featured.length) % featured.length; const f = featured[spotI];
    spot.classList.remove('vid-on'); sImg.src = f.poster; sImg.alt = f.title + ' 장면';
    $('.spot-genre', spot).textContent = '추천 · ' + P.genreOf(f.genre).label; $('.spot-title', spot).textContent = f.title; $('.spot-hook', spot).textContent = f.hook;
    $('.spot-meta', spot).textContent = `${P.fmt(f.dur)} · ${f.ratio === 'v' ? '세로 영상' : '가로 영상'}`;
    $('.spot-play', spot).dataset.play = f.id;
    $$('.spot-dots button', spot).forEach((b, k) => { b.setAttribute('aria-selected', 'false'); if (k === spotI) { void b.offsetWidth; b.setAttribute('aria-selected', 'true'); } });
    if (!reduce && vis) { sVid.src = f.preview; sVid.play().then(() => spot.classList.add('vid-on')).catch(() => {}); }
    clearTimeout(spotTimer); if (vis) spotTimer = setTimeout(() => show(spotI + 1), 7000);
  }
  new IntersectionObserver(([e]) => { vis = e.isIntersecting && e.boundingClientRect.width > 0; if (vis) show(spotI); else { clearTimeout(spotTimer); sVid.pause(); } }, { threshold: .25 }).observe(spot);
  $$('.spot-dots button', spot).forEach((b, i) => b.onclick = () => show(i));
  show(0);
});

/* ---------- FILMS: genre chips + rows ---------- */
$$('.rows').forEach(rows => {
  const sec = rows.closest('section'), ids = rows.dataset.genres.split(',');
  const gs = ids.map(id => P.genreOf(id)).map(g => ({ ...g, films: g.id === 'shorts' ? P.SHORTS : P.FILMS.filter(f => f.genre === g.id) }));
  $('.genre-chips', sec).innerHTML = gs.map(g => `<a class="genre-chip" href="#row-${g.id}">${g.label}<b>${g.films.length}</b></a>`).join('');
  rows.innerHTML = gs.map(g => {
    const isS = g.id === 'shorts';
    const total = isS ? '' : ` · 총 ${P.fmt(g.films.reduce((a, f) => a + f.dur, 0))}`;
    return `<div class="row" id="row-${g.id}">
      <div class="row-head"><div><h3>${g.label}<small>${g.films.length}편${total}</small></h3><p>${g.hook}</p></div>
        <div class="row-nav"><button aria-label="${g.label} 이전" data-dir="-1">←</button><button aria-label="${g.label} 다음" data-dir="1">→</button></div></div>
      <div class="row-track${isS ? ' shorts' : ''}">${g.films.map((f, i) => isS ? `
        <button class="vcard" data-yt="${f.id}" data-cursor="Play" aria-label="${esc(f.title)} 쇼츠 재생">
          <img src="https://i.ytimg.com/vi/${f.id}/${f.thumb}.jpg" alt="" loading="lazy">
          <div class="badges"><span class="tag tag-glass">Shorts</span><span class="runtime">세로</span></div>
          <div class="info"><span class="num">${String(i + 1).padStart(2, '0')}</span><h4>${esc(f.title)}</h4><p class="hook">${esc(f.hook)}</p><span class="watch">▶ 쇼츠 보기</span></div>
        </button>` : `
        <button class="vcard" data-play="${f.id}" data-cursor="Play" aria-label="${esc(f.title)} 영상 재생, ${P.fmt(f.dur)}">
          <img src="${f.poster}" alt="" loading="lazy">
          <video muted loop playsinline preload="none" data-preview="${f.preview}" aria-hidden="true"></video>
          <div class="badges"><span class="tag tag-glass">${g.en}${f.ratio === 'v' ? ' · 세로' : ''}</span><span class="runtime">${P.fmt(f.dur)}</span></div>
          <div class="info"><span class="num">${String(i + 1).padStart(2, '0')}</span><h4>${esc(f.title)}</h4><p class="hook">${esc(f.hook)}</p><span class="watch">▶ 영상 보기</span></div>
          <span class="bar"></span>
        </button>`).join('')}</div></div>`;
  }).join('');
});
$$('.vcard').forEach(c => bindPreview(c, $('video', c)));
$$('.row-nav button').forEach(b => b.onclick = () => { const t = b.closest('.row').querySelector('.row-track'); t.scrollBy({ left: t.clientWidth * .8 * b.dataset.dir, behavior: 'smooth' }); });
$$('.genre-chip').forEach(a => a.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); const el = $(a.getAttribute('href')); const box = el.closest('.chapter-panel.open'); if (box) box.scrollTo({ top: el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 150, behavior: 'smooth' }); else scrollToEl(el); }));
const chipObs = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) $$('.genre-chip', e.target.closest('section')).forEach(c => c.classList.toggle('active', c.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-40% 0px -50% 0px' });
$$('.row').forEach(r => chipObs.observe(r));

/* ---------- FASHION room (from window.FASHION) ---------- */
$('.fashion-grid').innerHTML = P.FASHION.map((f, i) => f.soon ? `
  <div class="fslot soon" aria-label="준비 중인 패션 작품 자리"><span class="fslot-icon" aria-hidden="true">⌒</span><b>준비 중 — 곧 공개</b><small>Fashion piece ${String(i + 1).padStart(2, '0')}</small></div>` : `
  <article class="fslot vcard-like" ${f.film ? `data-play="${f.film}" role="button" tabindex="0" aria-label="${esc(f.title)} 영상 재생"` : ''} data-cursor="Play">
    <img src="${esc(f.poster)}" alt="" loading="lazy">${f.preview ? `<video muted loop playsinline preload="none" data-preview="${esc(f.preview)}" aria-hidden="true"></video>` : ''}
    <div class="badges"><span class="tag tag-glass">Fashion</span><span class="tag tag-warn">${esc(f.status || '공개')}</span></div>
    <div class="fslot-info"><h3>${esc(f.title)}</h3><p>${esc(f.desc || '')}</p>${f.film ? '<span class="watch">▶ 영상 보기</span>' : f.href ? `<a class="watch" href="${esc(f.href)}" target="_blank" rel="noopener">보기 ↗</a>` : ''}</div>
  </article>`).join('');
$$('.fslot.vcard-like').forEach(c => { bindPreview(c, $('video', c)); c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); c.click(); } }); });

/* ---------- projects (from window.PROJECTS): 04 바이브코딩 / 05 웹페이지 ---------- */
$$('.code-bento').forEach(box => box.innerHTML = P.PROJECTS.filter(p => p.chapter === box.dataset.kind).map(p => `<article class="tile proj">
  ${p.shot ? (p.phone ? `<div class="proj-phone"><div><img src="${esc(p.shot)}" alt="${esc(p.title)} 화면" loading="lazy" width="390" height="800"></div></div>` : `<div class="proj-shot"><img src="${esc(p.shot)}" alt="${esc(p.title)} 화면" loading="lazy" width="960" height="600"></div>`)
    : `<div class="type-art" aria-hidden="true">${(p.art || [p.title]).map(a => `<span>${esc(a)}</span>`).join('')}</div>`}
  <div class="proj-body">
    <div class="tile-top">${p.demoUrl ? '<span class="tag tag-lime"><i class="pulse"></i>Live</span>' : `<span class="tag tag-warn">${esc(p.status)}</span>`}<span class="tag">${esc(p.kind)}</span><span class="tag">${esc(p.tools)}</span></div>
    <h3>${esc(p.title)}</h3><p>${esc(p.desc)}</p>
    <div class="proj-links">${P.projectCtas(p).map(ctaHTML).join('')}</div>
  </div></article>`).join(''));

/* ---------- tools ---------- */
$('.tool-groups').innerHTML = P.SKILLS.map(([h, t]) => `<div><h4>${esc(h)}</h4><p>${esc(t)}</p></div>`).join('');
{ const seen = new Set(), chips = []; P.SKILLS.forEach(([h, t]) => t.split('·').map(s => s.trim()).filter(Boolean).forEach(s => { if (!seen.has(s)) { seen.add(s); chips.push(`<span class="tchip" title="${esc(h)}">${esc(s)}</span>`); } }));
  const tc = $('.tool-chips'); if (tc) tc.innerHTML = chips.join(''); }

/* ---------- player ---------- */
const dlg = $('.player'), stage = $('.player-stage'); let lastFocus;
function openFilm(id) {
  const f = byId(id); if (!f) return; lastFocus = document.activeElement;
  $('.player-genre').textContent = f.genre === 'fashion' ? '패션 · 작업 중' : P.genreOf(f.genre).label + ' · ' + P.fmt(f.dur);
  $('.player-title').textContent = f.title;
  dlg.classList.toggle('vertical', f.ratio === 'v');
  stage.innerHTML = `<video controls playsinline autoplay poster="${f.poster}" src="${f.src}"></video>`;
  open();
}
function openYT(id) {
  const s = P.SHORTS.find(x => x.id === id); lastFocus = document.activeElement;
  $('.player-genre').textContent = 'YouTube Shorts'; $('.player-title').textContent = s ? s.title : 'Shorts';
  dlg.classList.remove('vertical');
  stage.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" title="${esc(s ? s.title : 'YouTube Shorts')}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
  open();
}
window.PP = { openFilm: id => openFilm(id), openYT: id => openYT(id) };
{ const tio = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('typo-in'); tio.unobserve(e.target); } }), { threshold: .3 });
  $$('.typo').forEach(el => tio.observe(el)); }
document.addEventListener('click', e => { const j = e.target.closest('.ar-jump'); if (!j) return; e.preventDefault(); e.stopPropagation();
  if (deckMode) openChapter('fashion', true, null, true); else document.getElementById('fashion')?.scrollIntoView({ behavior: 'smooth' }); }, true);
function open() { $$('video').forEach(v => v !== $('video', stage) && v.pause()); dlg.showModal(); lenis?.stop(); }
dlg.addEventListener('close', () => { stage.innerHTML = ''; if (!chapterOpen) lenis?.start(); lastFocus?.focus?.({ preventScroll: true }); });
$('.player-close').onclick = () => dlg.close();
dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
document.addEventListener('click', e => {
  const el = e.target.closest('[data-play],[data-yt],[data-href],[data-jump]'); if (!el || el.closest('.player')) return;
  if (el.dataset.play) { e.preventDefault(); openFilm(el.dataset.play); }
  else if (el.dataset.yt) { e.preventDefault(); openYT(el.dataset.yt); }
  else if (el.dataset.href) window.open(el.dataset.href, '_blank', 'noopener');
  else if (el.dataset.jump) { e.preventDefault(); el.dataset.jump === '#top' ? $('a[href="#top"]').click() : scrollToEl($(el.dataset.jump)); }
});

/* ---------- smooth scroll ---------- */
let lenis;
if (window.Lenis && !reduce) { lenis = new Lenis({ duration: 1.15, smoothWheel: true }); const raf = t => { lenis.raf(t); requestAnimationFrame(raf); }; requestAnimationFrame(raf); }
const navOffset = () => -($('.nav').offsetHeight + 28);
const panel = $('#chapter-panel');
function scrollToEl(el) {
  if (!el) return;
  if (deckMode && panel.contains(el)) { const sec = el.closest('.chapter'); if (sec) { openChapter(sec.dataset.ch, true, el === sec ? null : el); return; } }
  if (deckMode && chapterOpen) closeChapter(true, false);
  lenis ? lenis.scrollTo(el, { offset: navOffset() }) : el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
}

/* ---------- CHAPTER DECK (PPT 슬라이드처럼) ---------- */
const deck = $('#chapters'), CH = P.CHAPTERS, chById = id => CH.find(c => c.id === id);
let canAnimReady = false, deckMode = false, chapterOpen = null, slideI = 0, pushedOpen = false;
function coverVisual(c) {
  const film = id => P.FILMS.find(f => f.id === id);
  switch (c.id) {
    case 'ad': return `<div class="cv cv-films">${['chicken', 'noad', 'nouveau'].map((id, i) => `<figure style="--i:${i}"><img src="${film(id).poster}" alt="" loading="lazy">${i === 0 ? `<video muted loop playsinline preload="none" data-src="${film(id).preview}"></video>` : ''}</figure>`).join('')}<span class="cv-badge">6편 · 광고 3 + Shorts 3</span></div>`;
    case 'story': return `<div class="cv cv-films cv-story">${['danwon', 'sea', 'tree'].map((id, i) => `<figure style="--i:${i}"><img src="${film(id).poster}" alt="" loading="lazy">${i === 1 ? `<video muted loop playsinline preload="none" data-src="${film(id).preview}"></video>` : ''}</figure>`).join('')}<span class="cv-badge">8편 · 역사 · 애니 · 숏필름</span></div>`;
    case 'fashion': return `<div class="cv cv-room" aria-hidden="true"><div class="room"><div class="room-floor"></div><div class="room-wall"></div><div class="spot s1"></div><div class="spot s2"></div><div class="spot s3"></div><div class="room-screen"><img src="thumbs/runway.jpg" alt=""><video muted loop playsinline preload="none" data-src="thumbs/runway-preview.mp4"></video></div><div class="runway-line"></div></div><span class="cv-badge">Runway · 준비 중 3칸</span></div>`;
    case 'vibe': return `<div class="cv cv-vibe" aria-hidden="true"><div class="teaser-art"><span></span><span></span><span></span></div><div class="cv-stack"><b>AI VIDEO STUDIO</b><b><em>AskMemo+</em></b><b>Three.js Lab</b></div></div>`;
    case 'web': return `<div class="cv cv-web" aria-hidden="true"><div class="cv-browser"><i></i><i></i><i></i><img src="shots/proj-jobsaba.png" alt=""></div><div class="cv-phone"><img src="shots/proj-golmok.png" alt=""></div><span class="cv-badge"><i class="pulse"></i>Live 2</span></div>`;
    case 'about': return `<div class="cv cv-about"><img src="img/geumge-studio-wide.jpg" alt="작업실에서 미소 짓는 Geumge Kim" loading="lazy"></div>`;
    default: return `<div class="cv cv-contact"><a class="contact-mail" href="mailto:seoinson076@gmail.com" data-cursor="Mail">seoinson076@gmail.com <span>↗</span></a></div>`;
  }
}
const slideCount = c => c.id === 'about' || c.id === 'contact' ? '' : `<span class="slide-count">${P.WORKS.filter(w => w.cat === c.id).length}개 작업</span>`;
function buildDeck() {
  deck.hidden = false;
  deck.innerHTML = `<div class="deck-stage" tabindex="0" aria-roledescription="carousel" aria-label="챕터 슬라이드 (← → 키로 이동, Enter로 열기)">
    ${CH.map((c, i) => `<article class="slide" data-i="${i}" data-ch="${c.id}" aria-roledescription="slide" aria-label="${c.num} ${c.label}" ${i ? 'aria-hidden="true"' : ''}>
      <div class="slide-text">
        <span class="slide-num"><b>${c.num}</b> / ${String(CH.length).padStart(2, '0')} · ${c.label}</span>
        <h2 class="slide-title">${[...c.title].map((ch, k) => `<span class="sc" style="--k:${k}">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('')} <em>${esc(c.em)}</em></h2>
        <p class="slide-hook">${esc(c.hook)}</p>
        <div class="slide-actions"><button class="btn btn-lime magnetic slide-open" data-open="${c.id}">챕터 열기 →</button>${slideCount(c)}</div>
      </div>
      <div class="slide-visual" data-open="${c.id}" data-cursor="Open">${coverVisual(c)}</div>
    </article>`).join('')}
  </div>
  <div class="deck-ui">
    <button class="deck-arrow" data-dir="-1" aria-label="이전 챕터">←</button>
    <div class="deck-tabs" role="tablist" aria-label="챕터 선택">${CH.map((c, i) => `<button role="tab" data-go="${i}" aria-selected="${!i}"><b>${c.num}</b><span>${c.label}</span></button>`).join('')}</div>
    <button class="deck-arrow" data-dir="1" aria-label="다음 챕터">→</button>
    <span class="deck-progress" aria-hidden="true"><i></i></span>
  </div>`;
  const stage = $('.deck-stage', deck);
  deck.addEventListener('click', e => {
    const o = e.target.closest('[data-open]'); if (o && !e.target.closest('a[href^="mailto"]')) { openChapter(o.dataset.open, true); return; }
    const g = e.target.closest('[data-go]'); if (g) { goSlide(+g.dataset.go); return; }
    const d = e.target.closest('.deck-arrow'); if (d) goSlide(slideI + +d.dataset.dir);
  });
  // swipe
  let sx = null, sy = 0;
  stage.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; });
  stage.addEventListener('pointerup', e => { if (sx === null) return; const dx = e.clientX - sx, dy = e.clientY - sy; sx = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) { e.preventDefault(); suppressClick = true; goSlide(slideI + (dx < 0 ? 1 : -1)); setTimeout(() => suppressClick = false, 50); } });
  stage.addEventListener('click', e => { if (suppressClick) { e.stopPropagation(); e.preventDefault(); } }, true);
  new IntersectionObserver(([e]) => { deckVisible = e.intersectionRatio > .45; playSlideVideo(); }, { threshold: [0, .45, .7] }).observe(deck);
  goSlide(0, true);
}
let suppressClick = false, deckVisible = false;
function emitSlide() {
  const s = $$('.slide', deck)[slideI]; if (!s) return;
  const d = { id: CH[slideI].id, el: $('.slide-visual', s), visible: deckVisible && !chapterOpen };
  window.PP_LAST_SLIDE = d; document.dispatchEvent(new CustomEvent('deck:slide', { detail: d }));
}
function playSlideVideo() { emitSlide();
  $$('.slide video', deck).forEach(v => { const on = deckVisible && !chapterOpen && !reduce && v.closest('.slide').classList.contains('active');
    if (on) { if (!v.src) v.src = v.dataset.src; v.play().then(() => v.classList.add('on')).catch(() => {}); } else v.pause(); });
}
function goSlide(i, instant) {
  const n = CH.length; const prev = slideI; slideI = (i + n) % n;
  $$('.slide', deck).forEach((s, k) => { s.classList.toggle('active', k === slideI); s.classList.toggle('before', k < slideI); s.setAttribute('aria-hidden', String(k !== slideI)); s.toggleAttribute('inert', k !== slideI); });
  $$('.deck-tabs button', deck).forEach((b, k) => b.setAttribute('aria-selected', String(k === slideI)));
  const tab = $$('.deck-tabs button', deck)[slideI]; tab?.parentElement.scrollTo({ left: tab.offsetLeft - 40, behavior: instant ? 'auto' : 'smooth' });
  $('.deck-progress i', deck).style.transform = `scaleX(${(slideI + 1) / n})`;
  deck.dataset.dir = slideI >= prev ? 'next' : 'prev';
  playSlideVideo();
}
addEventListener('keydown', e => {
  if (!deckMode || $('dialog[open]') || /input|textarea/i.test(document.activeElement.tagName)) return;
  if (chapterOpen) {
    if (e.key === 'Escape') { if (isDrawer() && !document.body.classList.contains('side-collapsed')) setSide(false); else closeChapter(true); return; }
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'PageDown' || e.key === 'PageUp') && !document.activeElement.closest?.('.row-track, .spot-dots, [role=tablist]')) { e.preventDefault(); stepChapter(e.key === 'ArrowRight' || e.key === 'PageDown' ? 1 : -1); }
    return; }
  if (!deckVisible) return;
  if (e.key === 'ArrowRight') { e.preventDefault(); goSlide(slideI + 1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); goSlide(slideI - 1); }
  else if (e.key === 'Enter' && deck.contains(document.activeElement) && !document.activeElement.matches('button,a')) openChapter(CH[slideI].id, true);
});

/* chapter panel (overlay) */
let chBar;
function buildPanel() {
  panel.classList.add('is-panel'); panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-modal', 'false'); panel.setAttribute('data-lenis-prevent', '');
  chBar = document.createElement('div'); chBar.className = 'ch-bar';
  chBar.innerHTML = `<button class="ch-side" aria-controls="ppt-side" aria-expanded="true" aria-label="목차 사이드바 열기/숨기기">☰<span> 목차</span></button><button class="ch-prev" aria-label="이전 슬라이드">←</button><span class="ch-now" aria-live="polite"></span><button class="ch-next" aria-label="다음 슬라이드"></button><button class="ch-back" aria-label="프레젠테이션 닫고 챕터 목록으로">✕<span> 닫기</span></button>`;
  document.body.append(chBar);
  chBar.querySelector('.ch-back').onclick = () => closeChapter(true);
  chBar.querySelector('.ch-next').onclick = () => stepChapter(1);
  chBar.querySelector('.ch-prev').onclick = () => stepChapter(-1);
  chBar.querySelector('.ch-side').onclick = () => setSide(document.body.classList.contains('side-collapsed'));
  buildSide();
}
/* PPT presenter: left outline sidebar (thumbnails + titles), collapsible; drawer on mobile */
const pptThumb = c => { const f = id => P.FILMS.find(x => x.id === id)?.poster;
  return ({ ad: f('chicken'), story: f('danwon'), fashion: 'thumbs/runway.jpg', web: 'shots/proj-jobsaba.png', about: 'img/geumge-studio-wide.jpg' })[c.id] || ''; };
const isDrawer = () => innerWidth <= 820;
let side, scrim, fab;
function buildSide() {
  side = document.createElement('aside'); side.className = 'ppt-side'; side.id = 'ppt-side'; side.setAttribute('aria-label', '챕터 목차');
  side.innerHTML = `<div class="ppt-head"><span><b>Slides</b> ${CH.length}</span><button class="ppt-hide" aria-label="사이드바 숨기기">⟨ 숨기기</button></div>
    <ol class="ppt-list"><li><button class="ppt-item ppt-intro active" data-intro aria-label="00 Intro, 첫 화면" aria-current="true">
        <span class="ppt-no">00</span><span class="ppt-thumb ppt-thumb-type"><i>Intro</i></span>
        <span class="ppt-txt"><b>Intro</b><small>Creative Architect</small></span></button></li>${CH.map((c, i) => { const th = pptThumb(c), n = c.id === 'about' || c.id === 'contact' ? '' : P.WORKS.filter(w => w.cat === c.id).length;
      return `<li><button class="ppt-item" data-ppt="${c.id}" aria-label="${c.num} ${c.label}${n ? ', ' + n + '개 작업' : ''}">
        <span class="ppt-no">${c.num}</span>
        <span class="ppt-thumb ${th ? '' : 'ppt-thumb-type'}">${th ? `<img src="${th}" alt="" loading="lazy">` : `<i>${esc(c.title.split(' ')[0])}</i>`}</span>
        <span class="ppt-txt"><b>${esc(c.label)}</b><small>${esc(c.title)} ${esc(c.em)}</small></span>${n ? `<span class="ppt-count">${n}</span>` : ''}</button></li>`; }).join('')}</ol>`;
  document.body.append(side);
  scrim = document.createElement('div'); scrim.className = 'ppt-scrim'; scrim.onclick = () => setSide(false); document.body.append(scrim);
  side.addEventListener('click', e => { if (e.target.closest('[data-intro]')) { if (chapterOpen) closeChapter(true, false); lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: 'smooth' }); if (isDrawer()) setSide(false); return; } const b = e.target.closest('[data-ppt]'); if (b) { openChapter(b.dataset.ppt, true, null, true); if (isDrawer()) setSide(false); } if (e.target.closest('.ppt-hide')) setSide(false); });
  fab = document.createElement('button'); fab.className = 'side-fab'; fab.setAttribute('aria-controls', 'ppt-side'); fab.setAttribute('aria-expanded', 'false');
  fab.setAttribute('aria-label', '챕터 목차 열기'); fab.innerHTML = '<i aria-hidden="true">☰</i><span>목차</span><b>' + CH.length + '</b>';
  fab.onclick = () => setSide(true); document.body.append(fab);
  const saved = localStorage.getItem('pp-side2');   // default = open on desktop (new key resets old 'closed' choice)
  setSide(isDrawer() ? false : saved !== 'closed', true);
  let wasDrawer = isDrawer(); addEventListener('resize', () => { const d = isDrawer(); if (d !== wasDrawer) { wasDrawer = d; setSide(d ? false : localStorage.getItem('pp-side2') !== 'closed', true); } });
}
function setSide(open, silent) {
  const changed = document.body.classList.contains('side-collapsed') === open;
  document.body.classList.toggle('side-collapsed', !open); document.body.classList.toggle('side-on', open && !isDrawer());
  fab?.setAttribute('aria-expanded', String(open));
  if (changed) [80, 600].forEach(t => setTimeout(() => dispatchEvent(new Event('resize')), t));
  chBar?.querySelector('.ch-side')?.setAttribute('aria-expanded', String(open));
  side?.toggleAttribute('inert', !open);
  if (!silent && !isDrawer()) localStorage.setItem('pp-side2', open ? 'open' : 'closed');
  if (open && isDrawer() && !silent) side.querySelector('.ppt-item.active')?.focus();
}
function stepChapter(d) { const i = CH.findIndex(c => c.id === chapterOpen); openChapter(CH[(i + d + CH.length) % CH.length].id, true, null, true); }
function openChapter(id, push, focusEl, replace) {
  const c = chById(id); if (!c) return;
  const was = chapterOpen; chapterOpen = id;
  $$('.chapter', panel).forEach(s => s.classList.toggle('ch-active', s.dataset.ch === id));
  slideI = CH.indexOf(c); goSlide(slideI, true);
  const ci = CH.indexOf(c), pi = was ? CH.findIndex(x => x.id === was) : -1;
  chBar.querySelector('.ch-now').innerHTML = `<b>${c.num}</b><span class="ch-tot"> / ${String(CH.length).padStart(2, '0')}</span> <span class="ch-lbl">${c.label}</span>`;
  const nx = CH[(ci + 1) % CH.length]; chBar.querySelector('.ch-next').innerHTML = `<span class="ch-nx">다음 · ${nx.label} </span>→`;
  $$('.ppt-item').forEach(b => { const on = b.dataset.ppt === id; b.classList.toggle('active', on); if (on) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); if (on) b.scrollIntoView({ block: 'nearest' }); });
  const sec = $('.chapter.ch-active', panel);
  if (sec && was && was !== id && !reduce) { sec.classList.remove('ppt-in-next', 'ppt-in-prev'); void sec.offsetWidth; sec.classList.add(ci > pi ? 'ppt-in-next' : 'ppt-in-prev'); }
  document.body.classList.add('ch-open'); panel.classList.add('open'); chBar.classList.add('open');
  lenis?.stop(); panel.scrollTop = 0;
  if (push) { const url = '#ch-' + id; if (replace || was) history.replaceState({ ch: id }, '', url); else { history.pushState({ ch: id }, '', url); pushedOpen = true; } }
  setNavActive(c.sec);
  requestAnimationFrame(() => { if (typeof onChapterShown === 'function' && canAnimReady) onChapterShown(); if (focusEl) panel.scrollTo({ top: focusEl.getBoundingClientRect().top - panel.getBoundingClientRect().top + panel.scrollTop - 120, behavior: 'smooth' }); });
  playSlideVideo();
  setTimeout(() => $('.sec-head h2', $('.chapter.ch-active', panel))?.setAttribute('tabindex', '-1'), 0);
}
function closeChapter(push, restore = true) {
  if (!chapterOpen) return;
  chapterOpen = null; document.body.classList.remove('ch-open');
  $$('.ppt-item').forEach(b => { const on = 'intro' in b.dataset; b.classList.toggle('active', on); on ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current'); }); panel.classList.remove('open'); chBar.classList.remove('open');
  $$('video', panel).forEach(v => v.pause());
  lenis?.start();
  if (push) { if (pushedOpen && history.state?.ch) { pushedOpen = false; history.back(); } else history.replaceState(null, '', '#chapters'); }
  setNavActive('');
  if (restore) { const y = deck.getBoundingClientRect().top + scrollY - ($('.nav').offsetHeight + 12); lenis ? lenis.scrollTo(y, { immediate: true }) : scrollTo(0, y); $('.deck-stage', deck)?.focus({ preventScroll: true }); }
  playSlideVideo();
}
function syncHash() {
  const m = location.hash.match(/^#ch-(\w+)/);
  if (m && chById(m[1])) openChapter(m[1], false);
  else if (chapterOpen) { pushedOpen = false; closeChapter(false); }
}
addEventListener('popstate', syncHash);

/* nav + anchors */
/* nav: sliding gradient indicator follows the active tab, previews on hover */
const navLinks = $('.nav-links'), navInd = document.createElement('span'); navInd.className = 'nav-ind'; navInd.setAttribute('aria-hidden', 'true'); navLinks.prepend(navInd);
function moveInd(a) { if (!a) { navInd.style.opacity = '0'; return; } navInd.style.opacity = '1'; navInd.style.width = a.offsetWidth + 'px'; navInd.style.transform = `translateX(${a.offsetLeft}px)`; }
const activeLink = () => $('.nav-links a.active');
navLinks.addEventListener('pointerover', e => { const a = e.target.closest('a'); if (a && e.pointerType === 'mouse') { navLinks.classList.add('hovering'); $$('.nav-links a').forEach(x => x.classList.toggle('ind-on', x === a)); moveInd(a); } });
navLinks.addEventListener('pointerleave', () => { navLinks.classList.remove('hovering'); $$('.nav-links a').forEach(x => x.classList.remove('ind-on')); moveInd(activeLink()); });
new MutationObserver(() => { if (!navLinks.classList.contains('hovering')) moveInd(activeLink()); }).observe(navLinks, { subtree: true, attributes: true, attributeFilter: ['class'] });
addEventListener('resize', () => moveInd(activeLink())); document.fonts?.ready.then(() => moveInd(activeLink()));
function setNavActive(sec) { $$('.nav-links a').forEach(a => { const on = a.dataset.spy === sec; a.classList.toggle('active', on); if (on && innerWidth <= 1020) a.parentElement.scrollTo({ left: a.offsetLeft - 20, behavior: 'smooth' }); }); }
document.addEventListener('click', e => {
  const a = e.target.closest('a[href^="#"]'); if (!a || a.closest('.deck')) return; const id = a.getAttribute('href');
  if (id === '#top') { e.preventDefault(); closeMenu(); if (chapterOpen) closeChapter(true, false); lenis ? lenis.scrollTo(0) : scrollTo({ top: 0, behavior: 'smooth' }); return; }
  const el = $(id); if (!el) return; e.preventDefault(); closeMenu(); scrollToEl(el);
  if (!(deckMode && panel.contains(el))) history.replaceState(history.state, '', id);
});
const menuBtn = $('.nav-menu'), menu = $('#mobile-menu');
function closeMenu() { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.textContent = 'Menu'; document.body.style.overflow = ''; }
menuBtn.onclick = () => { const o = menu.hidden; menu.hidden = !o; menuBtn.setAttribute('aria-expanded', String(o)); menuBtn.textContent = o ? 'Close' : 'Menu'; document.body.style.overflow = o ? 'hidden' : ''; };
addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) closeMenu(); if (e.key === 'Escape' && !chapterOpen && isDrawer() && !document.body.classList.contains('side-collapsed')) setSide(false); });
const spy = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting && !chapterOpen) setNavActive(e.target.id); }), { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => spy.observe(s));

/* init deck mode (JS 없으면 모든 섹션이 일반 페이지로 보임) */
deckMode = true; document.body.classList.add('deck-mode'); buildDeck(); buildPanel(); syncHash();

/* ---------- keyword band: gradient highlight one at a time ---------- */
const band = $('.kw-band');
if (band && !reduce) {
  const kws = $$('.kw', band); let k = -1, kwTimer, bandOn = false;
  const stepKw = () => {
    kws.forEach(w => w.classList.remove('was')); if (k >= 0) { kws[k].classList.remove('on'); kws[k].classList.add('was'); }
    k = (k + 1) % kws.length; const w = kws[k]; w.classList.add('on');
    const br = band.getBoundingClientRect(), r = w.getBoundingClientRect();
    band.style.setProperty('--x', `${r.left - br.left + r.width / 2}px`);
  };
  new IntersectionObserver(([e]) => { bandOn = e.isIntersecting; clearInterval(kwTimer); if (bandOn) { stepKw(); kwTimer = setInterval(stepKw, 1500); } }).observe(band);
}

/* ---------- kinetic hero type ---------- */
const kin = $('[data-kinetic]');
if (kin) {
  kin.innerHTML = [...kin.textContent].map(c => `<span class="ch">${c}</span>`).join('');
  const chs = $$('.ch', kin);
  if (fine && !reduce) {
    addEventListener('pointermove', e => {
      if (e.clientY > innerHeight * 1.1) return;
      chs.forEach(ch => { const r = ch.getBoundingClientRect(); const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2)); const k = Math.max(0, 1 - d / 420);
        ch.style.fontVariationSettings = `'wght' ${Math.round(850 - k * 650)}`; ch.style.transform = `translateY(${-k * 14}px)`; });
    }, { passive: true });
  }
}

/* ---------- cursor + magnetic ---------- */
if (fine && !reduce) {
  const cur = $('.cursor'), label = $('.cursor-label'); let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  const LBL = { Play: '▶ 재생', Open: '열기', View: 'View ↗', Mail: 'Mail ↗', Sound: 'Sound' };
  const pick = el => { if (!el?.closest) return null; const d = el.closest('[data-cursor]'); if (d) return d.dataset.cursor;
    if (el.closest('.spot-media, .fslot.vcard-like[data-play], .vcard')) return 'Play';
    if (el.closest('a, button, input')) return null;
    if (el.closest('.slide')) return 'Open';
    if (el.closest('.tile.proj')) return 'View';
    return null; };
  let curKey = null, lastT = null;
  function applyKey(k) { if (k === curKey) return; curKey = k; cur.classList.toggle('big', !!k); cur.classList.toggle('play', k === 'Play'); if (k) label.textContent = LBL[k] || k; }
  addEventListener('pointermove', e => { if (e.pointerType && e.pointerType !== 'mouse') return; x = e.clientX; y = e.clientY;
    lastT = e.target; applyKey(pick(e.target)); }, { passive: true });
  window.PP_cursorRefresh = () => applyKey(pick(lastT));
  document.addEventListener('pointerleave', () => { curKey = null; cur.classList.remove('big', 'play'); });
  (function loop() { cx += (x - cx) * .17; cy += (y - cy) * .17; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  $$('.magnetic').forEach(m => { m.addEventListener('pointermove', e => { const r = m.getBoundingClientRect(); m.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .22}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; }); m.addEventListener('pointerleave', () => m.style.transform = ''); });
}


/* ---------- kinetic section headings ---------- */
const scrollerOf = el => (deckMode && panel.contains(el)) ? panel : window;
function splitHeading(h) {
  const label = h.textContent.replace(/\s+/g, ' ').trim(); h.setAttribute('aria-label', label);
  const frag = document.createDocumentFragment();
  [...h.childNodes].forEach(node => {
    if (node.nodeType === 3) {
      node.textContent.split(/(\s+)/).forEach(part => {
        if (!part) return; if (/^\s+$/.test(part)) { frag.append(document.createTextNode(' ')); return; }
        const w = document.createElement('span'); w.className = 'kh-w'; w.setAttribute('aria-hidden', 'true');
        [...part].forEach(ch => { const c = document.createElement('span'); c.className = 'kh-c'; c.textContent = ch; w.append(c); });
        frag.append(w);
      });
    } else if (node.nodeName === 'EM') {
      const mask = document.createElement('span'); mask.className = 'kh-em'; mask.setAttribute('aria-hidden', 'true'); mask.append(node.cloneNode(true)); frag.append(mask);
    } else frag.append(node.cloneNode(true));
  });
  h.textContent = ''; h.append(frag); h.classList.add('kh');
}
const bigHeads = $$('.sec-head h2');
if (!reduce) {
  bigHeads.forEach(h => { h.classList.remove('reveal'); splitHeading(h); });
  const contactLines = $$('.contact-title > span'); contactLines.forEach(l => { const m = document.createElement('span'); m.className = 'kh-line'; l.before(m); m.append(l); });
  // hover: variable-weight wave through the letters
  if (fine) bigHeads.forEach(h => {
    const cs = $$('.kh-c', h);
    h.addEventListener('pointermove', e => cs.forEach(c => { const r = c.getBoundingClientRect(); const k = Math.max(0, 1 - Math.abs(e.clientX - (r.left + r.width / 2)) / 160);
      c.style.fontVariationSettings = `'wght' ${Math.round(850 - k * 600)}`; c.style.transform = `translateY(${-k * 6}px)`; }));
    h.addEventListener('pointerleave', () => cs.forEach(c => { c.style.fontVariationSettings = ''; c.style.transform = ''; }));
  });
}

/* ---------- GSAP reveals (챕터 안 요소는 처음 열 때 생성 — 숨겨진 상태에서 만들면 위치 계산이 꼬임) ---------- */
const canAnim = !!(window.gsap && window.ScrollTrigger && !reduce);
const animated = new WeakSet();
function setupReveals(root) {
  if (!canAnim || animated.has(root)) return; animated.add(root);
  const sc = scrollerOf(root), inPanel = sc !== window;
  const own = el => inPanel ? true : !(deckMode && panel.contains(el));
  $$('.sec-head h2.kh', root).filter(own).forEach(h => {
    const head = h.closest('.sec-head'), num = head && $('.sec-num', head), em = $('.kh-em em', h), sub = head && $('.sec-sub', head);
    const done = () => { gsap.set($$('.kh-c', h), { clearProps: 'transform' }); h.classList.add('kh-done'); };
    const tl = inPanel ? gsap.timeline({ delay: .12, onComplete: done }) : gsap.timeline({ scrollTrigger: { trigger: h, scroller: sc, start: 'top 92%', once: true }, onComplete: done });
    tl.from($$('.kh-c', h), { yPercent: 115, rotate: 6, duration: .9, ease: 'expo.out', stagger: .028 }, 0);
    if (em) tl.fromTo(em, { clipPath: 'inset(0 100% 0 0)', skewX: -16, x: -18, opacity: 0 }, { clipPath: 'inset(0 0% 0 0)', skewX: 0, x: 0, opacity: 1, duration: 1.1, ease: 'power3.out' }, .3);
    if (num) { const target = parseInt(num.dataset.n || num.textContent, 10) || 0, o = { v: 0 }; num.dataset.n = target; num.textContent = '00';
      tl.from(num, { scale: .4, opacity: 0, duration: .6, ease: 'back.out(2.4)' }, 0)
        .to(o, { v: target, duration: .7, ease: 'power2.out', onUpdate: () => num.textContent = String(Math.round(o.v)).padStart(2, '0') }, .05); }
    if (sub) { sub.classList.remove('reveal'); tl.from(sub, { y: 20, opacity: 0, duration: .8, ease: 'power3.out' }, .45); }
  });
  $$('.kh-line > span', root).filter(own).forEach((l, i) => gsap.from(l, { yPercent: 105, duration: 1.1, ease: 'expo.out', delay: i * .14, scrollTrigger: { trigger: l.closest('.contact-title'), scroller: sc, start: 'top 90%', once: true } }));
  const rev = [...$$('.reveal', root).filter(own).map(el => [el, 40]), ...$$('.tile, .spotlight, .fslot', root).filter(own).map(el => [el, 50])];
  if (inPanel) { // inside the presenter: IntersectionObserver on the panel (robust), plus a safety net so nothing stays hidden
    const tws = new Map(rev.map(([el, y]) => [el, gsap.from(el, { y, opacity: 0, duration: .9, ease: 'power3.out', paused: true })]));
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { tws.get(e.target)?.play(); io.unobserve(e.target); } }), { root: panel, threshold: .05 });
    tws.forEach((_, el) => io.observe(el));
    setTimeout(() => { tws.forEach((tw, el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && !tw.isActive() && tw.progress() === 0) tw.play(); }); }, 2500);
  } else rev.forEach(([el, y]) => gsap.from(el, { y, opacity: 0, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: el, scroller: sc, start: 'top 95%', once: true } }));
}
if (canAnim) {
  gsap.registerPlugin(ScrollTrigger); lenis?.on('scroll', ScrollTrigger.update);
  gsap.from('.hero-title .line', { yPercent: 110, opacity: 0, duration: 1.2, ease: 'expo.out', stagger: .12, delay: .1 });
  gsap.from(['.hero-copy', '.hero-card', '.hero-meta'], { y: 30, opacity: 0, duration: 1, ease: 'power3.out', stagger: .1, delay: .5 });
  gsap.to('.hero-title', { yPercent: -18, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
  setupReveals(document.body);
  canAnimReady = true; if (chapterOpen) onChapterShown();
}
function onChapterShown() { const sec = $('.chapter.ch-active', panel); if (!sec || !canAnim) return; setupReveals(sec); ScrollTrigger.refresh(); }
})();
