/* 배경 음악: window.MUSIC.src 가 있으면 그 파일, 없으면 Web Audio로 만든 앰비언트/로파이 음악 */
(() => {
const CFG = Object.assign({ src: '', volume: 0.5, title: 'Ambient' }, window.MUSIC || {});
const TRACKS = (Array.isArray(CFG.tracks) && CFG.tracks.filter(t => t && t.src).length) ? CFG.tracks.filter(t => t && t.src) : (CFG.src ? [{ src: CFG.src, title: CFG.title }] : []);
let ti = 0; const curTitle = () => TRACKS[ti]?.title || CFG.title;
const KEY = 'gk-sound';
const btn = document.querySelector('.sound-toggle'), hint = document.querySelector('.sound-hint');
if (!btn) return;
const AC = window.AudioContext || window.webkitAudioContext;
let ctx, master, enabled = false, started = false, ducks = new Set(), suspendTimer, hintTimer, audioEl, engine;
const vol = () => Math.max(0, Math.min(1, +CFG.volume || .5));

function store(v) { try { localStorage.setItem(KEY, v); } catch {} }
function stored() { try { return localStorage.getItem(KEY); } catch { return null; } }
function ui() {
  btn.setAttribute('aria-pressed', String(enabled));
  btn.setAttribute('aria-label', enabled ? '배경 음악 끄기' : '배경 음악 켜기');
  btn.querySelector('.sound-state b').textContent = enabled ? 'On' : 'Off';
  btn.classList.toggle('ducked', enabled && ducks.size > 0);
  document.querySelector('.sound-dock')?.classList.toggle('playing', enabled);
}
function showHint(text, ms, clickable) {
  if (!hint) return; clearTimeout(hintTimer);
  hint.textContent = text; hint.hidden = false; hint.dataset.click = clickable ? '1' : '';
  hintTimer = setTimeout(() => hint.hidden = true, ms);
}

/* ---------- audio graph ---------- */
function init() {
  if (ctx) return true; if (!AC) return false;
  ctx = new AC();
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
  master = ctx.createGain(); master.gain.value = 0;
  master.connect(comp); comp.connect(ctx.destination);
  if (TRACKS.length) {
    audioEl = new Audio(); audioEl.src = TRACKS[0].src; audioEl.loop = TRACKS.length === 1; audioEl.preload = 'auto';
    audioEl.addEventListener('ended', () => nextTrack(false));
    try { ctx.createMediaElementSource(audioEl).connect(master); } catch {}
    audioEl.addEventListener('error', () => { console.warn('[music] 파일을 불러오지 못해 기본 앰비언트 음악으로 재생합니다:', audioEl?.src); nextBtn && (nextBtn.hidden = true); audioEl = null; engine = synth(); if (enabled && !ducks.size) engine.start(); });
  } else engine = synth();
  return true;
}

function impulse(sec, decay) {
  const len = ctx.sampleRate * sec, b = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let c = 0; c < 2; c++) { const d = b.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  return b;
}
function synth() {
  const out = ctx.createGain(); out.gain.value = .9; out.connect(master);
  const verb = ctx.createConvolver(); verb.buffer = impulse(4.5, 2.6);
  const verbGain = ctx.createGain(); verbGain.gain.value = .55; verb.connect(verbGain); verbGain.connect(out);
  const BPM = 72, beat = 60 / BPM, step = beat / 2;
  const delay = ctx.createDelay(2); delay.delayTime.value = beat * .75;
  const fb = ctx.createGain(); fb.gain.value = .38; const dlp = ctx.createBiquadFilter(); dlp.type = 'lowpass'; dlp.frequency.value = 2200;
  delay.connect(dlp); dlp.connect(fb); fb.connect(delay); dlp.connect(out); dlp.connect(verb);
  // warm low-pass "tape" filter on everything musical
  const tape = ctx.createBiquadFilter(); tape.type = 'lowpass'; tape.frequency.value = 5200; tape.connect(out); tape.connect(verb);
  const lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = .05; lfoG.gain.value = 350; lfo.connect(lfoG); lfo.start();
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  // A minor: Am9 → Fmaj7 → Cmaj9 → Em7 (2 bars each, 26.7s loop, endlessly varied melody)
  const CHORDS = [[45, 52, 55, 59, 60], [41, 48, 52, 57, 59], [48, 55, 59, 62, 64], [40, 47, 50, 55, 59]];
  const PENTA = [69, 72, 74, 76, 79, 81, 84, 86, 88];
  let noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate); { const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }

  function pad(notes, t, dur) {
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 850; f.Q.value = .6; lfoG.connect(f.frequency);
    const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.075, t + 2.2); g.gain.setValueAtTime(.075, t + dur - .4); g.gain.linearRampToValueAtTime(0, t + dur + 2.6);
    f.connect(g); g.connect(tape);
    notes.slice(1).forEach(n => ['sawtooth', 'triangle'].forEach((type, k) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = hz(n); o.detune.value = (k ? 7 : -7) + (Math.random() * 4 - 2);
      const og = ctx.createGain(); og.gain.value = type === 'sawtooth' ? .18 : .5; o.connect(og); og.connect(f); o.start(t); o.stop(t + dur + 2.8);
    }));
    const b = ctx.createOscillator(), bg = ctx.createGain(); b.type = 'sine'; b.frequency.value = hz(notes[0]);
    bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(.16, t + .8); bg.gain.setTargetAtTime(0, t + dur - .3, .6);
    b.connect(bg); bg.connect(out); b.start(t); b.stop(t + dur + 3);
    setTimeout(() => { try { lfoG.disconnect(f); } catch {} }, (dur + 4) * 1000 + (t - ctx.currentTime) * 1000);
  }
  function pluck(n, t, v) {
    const o = ctx.createOscillator(), g = ctx.createGain(), f = ctx.createBiquadFilter();
    o.type = 'triangle'; o.frequency.value = hz(n); f.type = 'lowpass'; f.frequency.setValueAtTime(3200, t); f.frequency.exponentialRampToValueAtTime(600, t + .5);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 1.4);
    o.connect(f); f.connect(g); g.connect(tape); g.connect(delay); o.start(t); o.stop(t + 1.5);
  }
  function kick(t) {
    const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(42, t + .18);
    g.gain.setValueAtTime(.22, t); g.gain.exponentialRampToValueAtTime(.0001, t + .45); o.connect(g); g.connect(out); o.start(t); o.stop(t + .5);
  }
  function hat(t, v) {
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; f.type = 'highpass'; f.frequency.value = 7000;
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + .06); s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + .08);
  }
  // vinyl crackle bed
  let crackle;
  function startCrackle() {
    const len = ctx.sampleRate * 3, b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() < .0009 ? (Math.random() * 2 - 1) * .6 : (Math.random() * 2 - 1) * .006;
    crackle = ctx.createBufferSource(); crackle.buffer = b; crackle.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2500; const g = ctx.createGain(); g.gain.value = .35;
    crackle.connect(f); f.connect(g); g.connect(out); crackle.start();
  }
  let timer, next = 0, idx = 0, last = 76;
  function tick() {
    while (next < ctx.currentTime + .4) {
      const bar = Math.floor(idx / 8), s = idx % 8, chord = CHORDS[Math.floor(bar / 2) % 4];
      if (s === 0 && bar % 2 === 0) pad(chord, next, step * 16);
      const section = Math.floor(idx / 128) % 2; // every 4 chords, beat comes in / out
      if (section === 1) { if (s === 0 || (s === 5 && Math.random() < .5)) kick(next); if (s % 2 === 1) hat(next, .025 + Math.random() * .015); }
      if (Math.random() < (s % 2 ? .28 : .5)) {
        const tones = PENTA.filter(p => chord.some(c => (p - c) % 12 === 0) || Math.random() < .5);
        let n = tones[Math.floor(Math.random() * tones.length)] || last; if (Math.abs(n - last) > 9) n = last + (n > last ? 5 : -5); last = n;
        const swing = s % 2 ? step * .12 : 0;
        pluck(n, next + swing, .05 + Math.random() * .04);
      }
      next += step; idx++;
    }
  }
  return {
    start() { if (timer) return; next = ctx.currentTime + .1; if (!crackle) startCrackle(); tick(); timer = setInterval(tick, 120); },
    stop() { clearInterval(timer); timer = null; }
  };
}

/* ---------- playlist ---------- */
const nextBtn = TRACKS.length > 1 ? (() => { const b = document.createElement('button'); b.className = 'sound-next magnetic'; b.type = 'button'; b.setAttribute('aria-label', '다음 곡'); b.dataset.cursor = 'Next';
  b.innerHTML = '<svg class="sn-ico" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M2 3l6 5-6 5zM8 3l6 5-6 5z" fill="currentColor"/></svg><span class="sn-title"></span>'; btn.after(b); return b; })() : null;
function setTitleUI() { if (nextBtn) { nextBtn.querySelector('.sn-title').textContent = curTitle(); nextBtn.title = '다음 곡 · 지금: ' + curTitle(); } }
function nextTrack(user) {
  if (!audioEl || TRACKS.length < 2) return; ti = (ti + 1) % TRACKS.length; audioEl.src = TRACKS[ti].src; setTitleUI();
  if (enabled && !ducks.size) { audioEl.play().catch(() => {}); if (!nextBtn) showHint('♪ ' + curTitle(), 2400); } else if (user && !enabled) setEnabled(true, true);
}
nextBtn?.addEventListener('click', () => nextTrack(true)); setTitleUI();

/* ---------- play / fade ---------- */
function fadeTo(v, sec) { const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(v, t + sec); }
async function play() {
  if (!init()) return false;
  clearTimeout(suspendTimer);
  try { await ctx.resume(); } catch {}
  if (ctx.state !== 'running') return false;
  if (audioEl) { try { await audioEl.play(); } catch { return false; } } else engine.start();
  started = true; fadeTo(vol() * (audioEl ? 1 : .8), 2.2); return true;
}
function quiet(sec = 1.2) {
  if (!ctx) return; fadeTo(0, sec); clearTimeout(suspendTimer);
  suspendTimer = setTimeout(() => { if (audioEl) audioEl.pause(); else engine?.stop(); ctx.suspend().catch(() => {}); }, sec * 1000 + 150);
}
async function setEnabled(on, user) {
  enabled = on; ui(); if (user) store(on ? 'on' : 'off');
  if (hint && user) hint.hidden = true;
  if (on) { if (!ducks.size) { const ok = await play(); if (ok && user && !nextBtn) showHint('♪ ' + curTitle(), 2600); if (!ok) armGesture(); } }
  else quiet();
}
function armGesture() {
  const go = () => { ['pointerdown', 'keydown', 'touchstart'].forEach(e => removeEventListener(e, go, true)); if (enabled && !ducks.size) play(); };
  ['pointerdown', 'keydown', 'touchstart'].forEach(e => addEventListener(e, go, { capture: true, once: true }));
}

/* ---------- ducking: video modal / any unmuted video / YouTube ---------- */
function duck(reason) { ducks.add(reason); ui(); if (enabled && started) quiet(.6); }
function unduck(reason) { if (!ducks.delete(reason)) return; ui(); if (enabled && !ducks.size) play(); }
const dlg = document.querySelector('dialog.player');
if (dlg) new MutationObserver(() => { if (dlg.open) return duck('modal'); ducks.delete('media'); unduck('modal'); }).observe(dlg, { attributes: true, attributeFilter: ['open'] });
const loud = v => !v.muted && v.volume > 0;
document.addEventListener('play', e => { if (e.target instanceof HTMLMediaElement && e.target !== audioEl && loud(e.target)) duck('media'); }, true);
['pause', 'ended', 'emptied'].forEach(ev => document.addEventListener(ev, e => {
  if (!(e.target instanceof HTMLMediaElement) || e.target === audioEl) return;
  if (![...document.querySelectorAll('video,audio')].some(v => !v.paused && loud(v))) unduck('media');
}, true));
document.addEventListener('volumechange', e => { const v = e.target; if (v instanceof HTMLMediaElement && v !== audioEl && !v.paused) loud(v) ? duck('media') : unduck('media'); }, true);
document.addEventListener('visibilitychange', () => document.hidden ? duck('hidden') : unduck('hidden'));

/* ---------- UI wiring ---------- */
btn.addEventListener('click', () => setEnabled(!enabled, true));
hint?.addEventListener('click', () => { if (hint.dataset.click) setEnabled(true, true); hint.hidden = true; });
const pref = stored();
if (pref === 'on') { enabled = true; ui(); armGesture(); }
else { ui(); if (pref === null) setTimeout(() => { if (!enabled && stored() === null) showHint('🎧 음악과 함께 보면 더 좋아요', 7000, true); }, 3500); }
window.BGM = { on: () => setEnabled(true, true), off: () => setEnabled(false, true), duck, unduck, get state() { return { enabled, ducked: [...ducks], ctx: ctx?.state, gain: master?.gain.value, mode: audioEl ? 'file' : 'synth', track: curTitle(), src: audioEl?.currentSrc, time: audioEl?.currentTime }; }, next: () => nextTrack(true) };
})();
