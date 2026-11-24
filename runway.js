import * as THREE from 'three';
/* Three.js 패션쇼 런웨이 공간 — 챕터 표지(패션·광고 영상·영상 스토리)에 쓰임.
   광택 바닥 + 반사, 스포트라이트 콘, 헤이즈 파티클, 양옆에 포스터 스크린(호버=미리보기, 클릭=재생).
   슬라이드가 보일 때만 생성, 떠나면 dispose. 모바일/저사양/동작줄이기 → 기존 정적 표지 유지. */
const P = window.PORTFOLIO;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const lowPower = () => innerWidth < 760 || (navigator.deviceMemory && navigator.deviceMemory < 4) || reduce;
const ROOMS = { fashion: 1, ad: 1, story: 1 };
const LIME = new THREE.Color('#d4ff3a'), LIME2 = new THREE.Color('#b9e04a'), GREY = new THREE.Color('#9aa0a6'), VIO = new THREE.Color('#9b85f0');

function itemsFor(id) {
  if (id === 'fashion') return (window.FASHION || []).map(f => f.soon ? { soon: true } : { thumb: f.poster, preview: f.preview, film: f.film, title: f.title });
  return P.WORKS.filter(w => w.cat === id && (w.film || w.yt) && w.thumb).map(w => ({ thumb: w.thumb, preview: w.preview, film: w.film, yt: w.yt, title: w.title }));
}
function soonTexture() {
  const c = document.createElement('canvas'); c.width = 256; c.height = 410; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 256, 410); gr.addColorStop(0, '#15151c'); gr.addColorStop(1, '#0c0c11'); g.fillStyle = gr; g.fillRect(0, 0, 256, 410);
  g.strokeStyle = 'rgba(212,255,58,.25)'; g.lineWidth = 2; g.setLineDash([8, 8]); g.strokeRect(14, 14, 228, 382);
  g.fillStyle = 'rgba(243,242,236,.85)'; g.font = '700 22px Pretendard, sans-serif'; g.textAlign = 'center'; g.fillText('준비 중', 128, 200);
  g.fillStyle = 'rgba(185,224,74,.9)'; g.font = '500 15px monospace'; g.fillText('COMING SOON', 128, 230);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function coverFit(tex, w, h) { // object-fit: cover on a plane
  const img = tex.image; if (!img || !img.width) return; const ia = (img.videoWidth || img.width) / (img.videoHeight || img.height), pa = w / h;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  if (ia > pa) { tex.repeat.set(pa / ia, 1); tex.offset.set((1 - pa / ia) / 2, 0); } else { tex.repeat.set(1, ia / pa); tex.offset.set(0, (1 - ia / pa) / 2); }
}
const coneMat = col => new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { uCol: { value: col }, uT: { value: 0 } },
  vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = uv.y; vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'uniform vec3 uCol; uniform float uT; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float edge = pow(abs(dot(vN, vV)), 1.4); float a = vY * vY * .55 * edge * (.85 + .15*sin(uT*1.3)); gl_FragColor = vec4(uCol * a, a); }' });

function build(host, id) {
  const canvas = document.createElement('canvas'); canvas.className = 'runway-canvas'; host.prepend(canvas); host.classList.add('has-runway');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5)); renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor('#07070a');
  const scene = new THREE.Scene(); scene.fog = new THREE.FogExp2('#07070a', .055);
  const cam = new THREE.PerspectiveCamera(54, 1, .1, 80);
  const disposables = [], videos = [];
  const add = o => { scene.add(o); return o; };
  const track = x => { disposables.push(x); return x; };
  // lights
  add(new THREE.HemisphereLight('#a99bd8', '#0b0b10', .35));
  const L = 26;
  // floor (glossy, slightly transparent so the mirrored world shows through = reflection)
  const floor = add(new THREE.Mesh(track(new THREE.PlaneGeometry(14, L + 20)), track(new THREE.MeshStandardMaterial({ color: '#0b0b10', roughness: .22, metalness: .75, transparent: true, opacity: .86 }))));
  floor.rotation.x = -Math.PI / 2; floor.position.z = -L / 2 + 4;
  // runway strip + edge light lines
  const strip = add(new THREE.Mesh(track(new THREE.PlaneGeometry(2.2, L + 12)), track(new THREE.MeshStandardMaterial({ color: '#16161e', roughness: .12, metalness: .55, emissive: '#0d0f08', transparent: true, opacity: .92 }))));
  strip.rotation.x = -Math.PI / 2; strip.position.set(0, .002, -L / 2 + 2);
  [-1.1, 1.1].forEach((x, i) => { const line = add(new THREE.Mesh(track(new THREE.PlaneGeometry(.035, L + 12)), track(new THREE.MeshBasicMaterial({ color: i ? LIME : LIME2, transparent: true, opacity: .9 }))));
    line.rotation.x = -Math.PI / 2; line.position.set(x, .004, -L / 2 + 2); });
  // floor marker dots along the runway
  const dotG = track(new THREE.CircleGeometry(.05, 12)), dotM = track(new THREE.MeshBasicMaterial({ color: LIME, transparent: true, opacity: .55 }));
  for (let z = 2; z > -L; z -= 1.2) [-1.4, 1.4].forEach(x => { const d = add(new THREE.Mesh(dotG, dotM)); d.rotation.x = -Math.PI / 2; d.position.set(x, .005, z); });
  // panels (screens) on both sides
  const items = itemsFor(id); const panels = []; const loader = new THREE.TextureLoader();
  const PW = 1.5, PH = 2.4, gap = 3.1;
  const n = Math.max(items.length, 4), list = Array.from({ length: Math.max(6, n + (n % 2)) }, (_, i) => items[i % items.length] || { soon: true });
  const planeG = track(new THREE.PlaneGeometry(PW, PH)), frameG = track(new THREE.PlaneGeometry(PW + .08, PH + .08));
  list.forEach((it, i) => {
    const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
    const g = new THREE.Group(); g.position.set(side * 2.55, PH / 2 + .05, -row * gap - .8); g.rotation.y = -side * .42; add(g);
    const frame = new THREE.Mesh(frameG, track(new THREE.MeshBasicMaterial({ color: side < 0 ? LIME2 : VIO, transparent: true, opacity: .35 }))); frame.position.z = -.01; g.add(frame);
    const mat = track(new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }));
    if (it.soon) { mat.map = track(soonTexture()); mat.color.set('#cfcfd6'); }
    else loader.load(it.thumb, t => { t.colorSpace = THREE.SRGBColorSpace; coverFit(t, PW, PH); mat.map = track(t); mat.needsUpdate = true; });
    mat.color.multiplyScalar(.82);
    const m = new THREE.Mesh(planeG, mat); m.userData = { it, g, frame, mat, base: g.position.clone() }; g.add(m); if (!it.soon) panels.push(m);
    // mirrored reflection under the floor
    const r = new THREE.Mesh(planeG, track(new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .16, toneMapped: false, depthWrite: false })));
    if (!it.soon) loader.load(it.thumb, t => { t.colorSpace = THREE.SRGBColorSpace; coverFit(t, PW, PH); r.material.map = track(t); r.material.needsUpdate = true; }); else r.material.map = mat.map;
    r.scale.y = -1; r.position.set(side * 2.55, -PH / 2 - .05, -row * gap - .8); r.rotation.y = -side * .42; add(r);
    // a spot light per panel pair for the glossy floor
    if (i % 2 === 0 && row < 4) { const sp = new THREE.SpotLight(row % 2 ? VIO : LIME, 22, 12, .5, .6, 1.6); sp.position.set(0, 5.5, -row * gap - .8); sp.target.position.set(0, 0, -row * gap - .8); add(sp); add(sp.target); }
  });
  // spotlight cones (volumetric look)
  const cones = []; const coneG = track(new THREE.ConeGeometry(1.25, 5.4, 40, 1, true));
  for (let k = 0; k < 5; k++) { const c = add(new THREE.Mesh(coneG, track(coneMat((k % 2 ? VIO : LIME).clone().multiplyScalar(k % 2 ? .9 : .75))))); c.position.set((k % 2 ? .35 : -.35), 2.75, -k * gap * 1.05 - .4); cones.push(c); }
  // haze particles
  const HN = 900, hp = new Float32Array(HN * 3), hc = new Float32Array(HN * 3);
  for (let i = 0; i < HN; i++) { hp[i * 3] = (Math.random() - .5) * 9; hp[i * 3 + 1] = Math.random() * 4.5; hp[i * 3 + 2] = 4 - Math.random() * (L + 4); const c = [LIME, GREY, VIO][i % 3]; hc.set([c.r, c.g, c.b], i * 3); }
  const hg = track(new THREE.BufferGeometry()); hg.setAttribute('position', new THREE.BufferAttribute(hp, 3)); hg.setAttribute('color', new THREE.BufferAttribute(hc, 3));
  const haze = add(new THREE.Points(hg, track(new THREE.PointsMaterial({ size: .045, vertexColors: true, transparent: true, opacity: .55, blending: THREE.AdditiveBlending, depthWrite: false }))));
  // interaction
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(9, 9), par = new THREE.Vector2(), parT = new THREE.Vector2(); let hover = null;
  function setHover(m) {
    if (hover === m) return;
    if (hover) { const u = hover.userData; u.video?.pause(); if (u.thumbTex) { u.mat.map = u.thumbTex; u.mat.needsUpdate = true; } u.frame.material.opacity = .35; }
    hover = m; host.dataset.cursor = m ? 'Play' : 'Open'; window.PP_cursorRefresh?.();
    if (m) { const u = m.userData; u.frame.material.opacity = .95;
      if (u.it.preview && !reduce) { if (!u.video) { const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.crossOrigin = 'anonymous'; v.src = u.it.preview; u.video = v; videos.push(v);
          const vt = track(new THREE.VideoTexture(v)); vt.colorSpace = THREE.SRGBColorSpace; u.vtex = vt; v.addEventListener('loadeddata', () => coverFit(vt, PW, PH), { once: true }); }
        u.thumbTex = u.thumbTex || u.mat.map; u.video.play().then(() => { if (hover === m) { u.mat.map = u.vtex; u.mat.needsUpdate = true; } }).catch(() => {}); } }
  }
  const onMove = e => { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); parT.set(ndc.x, ndc.y); };
  const onLeave = () => { ndc.set(9, 9); parT.set(0, 0); setHover(null); };
  const onClick = e => { if (!hover) return; e.stopPropagation(); e.preventDefault(); const it = hover.userData.it; if (it.film) window.PP?.openFilm(it.film); else if (it.yt) window.PP?.openYT(it.yt); };
  canvas.addEventListener('pointermove', onMove); canvas.addEventListener('pointerleave', onLeave); canvas.addEventListener('click', onClick);
  // size + loop
  function size() { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  const ro = new ResizeObserver(size); ro.observe(host); size();
  let raf = 0, t = 0, prev = performance.now(), alive = true;
  const end = -(Math.ceil(list.length / 2) - 1) * gap - 1.5;
  function loop(now) { if (!alive) return; raf = requestAnimationFrame(loop);
    const dt = Math.min((now - prev) / 1000, .05); prev = now; t += dt;
    // camera slowly dollies down the runway and back (ping-pong), with mouse parallax
    const ph = (Math.sin(t * .09 - Math.PI / 2) + 1) / 2, z = 7.4 + (end + 3.5 - 7.4) * ph;
    par.lerp(parT, .05);
    cam.position.set(par.x * .7, 1.75 + par.y * .35, z); cam.lookAt(par.x * .25, 1.35, z - 7);
    cones.forEach((c, k) => { c.material.uniforms.uT.value = t + k; });
    const pa = hg.attributes.position.array; for (let i = 0; i < HN; i++) { pa[i * 3 + 1] += Math.sin(t * .6 + i) * .0012; pa[i * 3] += Math.cos(t * .3 + i * .7) * .0008; } hg.attributes.position.needsUpdate = true;
    panels.forEach(m => { const u = m.userData, k = m === hover ? 1 : 0; u.s = (u.s || 0) + (k - (u.s || 0)) * .12; u.g.scale.setScalar(1 + u.s * .08); u.g.position.y = u.base.y + u.s * .12; });
    ray.setFromCamera(ndc, cam); const hit = ray.intersectObjects(panels, false)[0]; setHover(hit ? hit.object : null);
    renderer.render(scene, cam); }
  raf = requestAnimationFrame(loop);
  host.dataset.cursor = 'Open';
  return function dispose() {
    alive = false; cancelAnimationFrame(raf); ro.disconnect();
    canvas.removeEventListener('pointermove', onMove); canvas.removeEventListener('pointerleave', onLeave); canvas.removeEventListener('click', onClick);
    videos.forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); });
    disposables.forEach(d => d.dispose?.()); renderer.dispose(); renderer.forceContextLoss?.(); canvas.remove(); host.classList.remove('has-runway');
  };
}

let current = null; // { el, dispose }
function sync(d) {
  const want = d && d.visible && ROOMS[d.id] && !lowPower() ? d.el : null;
  if (current && current.el === want) return;
  if (current) { current.dispose(); current = null; }
  if (want) { try { current = { el: want, dispose: build(want, d.id) }; } catch (e) { console.warn('runway fallback', e); current = null; } }
}
document.addEventListener('deck:slide', e => sync(e.detail));
window.PP_RUNWAY = { sync, active: () => !!current };
if (window.PP_LAST_SLIDE) sync(window.PP_LAST_SLIDE);
