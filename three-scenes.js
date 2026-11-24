import * as THREE from 'three';
/* HERO: 파티클 유리 구 (GPU 셰이더) — 수천 개 입자로 된 반투명 구, 오른쪽으로 흘러나가는 파티클 리본,
   포인터 회피·패럴랙스, 스크롤하면 흩어짐 증가. 화면 밖이면 멈춤. 모양 버튼(구/매듭/물결/은하)은 보조 기능. */
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const NOISE = `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}`;
const PALETTE = `const vec3 SAGE=vec3(.74,.80,.62);const vec3 GREY=vec3(.66,.70,.75);const vec3 LAV=vec3(.68,.61,.87);
vec3 pal(float g){g=clamp(g,0.,1.);return g<.5?mix(SAGE,GREY,g*2.):mix(GREY,LAV,(g-.5)*2.);}`;

(function hero() {
  const canvas = document.querySelector('.hero-canvas'), hero = document.querySelector('.hero'); if (!canvas || !hero) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' }); } catch { return; }
  const PR = Math.min(devicePixelRatio, 1.6); renderer.setPixelRatio(PR);
  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(40, 1, .1, 100); camera.position.z = 8;
  const group = new THREE.Group(); scene.add(group);
  const mobile = innerWidth < 720, N = mobile ? 12000 : 24000;

  /* shapes: 0 glass sphere (surface + frosted interior), 1 knot, 2 wave, 3 galaxy */
  const shapes = [0, 1, 2, 3].map(k => { const a = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { let x, y, z; const u = (i + .5) / N;
      if (k === 0) {
        if (i % 12 === 0) { const r = 2 * Math.cbrt(.25 + Math.random() * .6), th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1); x = r * Math.sin(ph) * Math.cos(th); y = r * Math.sin(ph) * Math.sin(th); z = r * Math.cos(ph); }
        else { const phi = Math.acos(1 - 2 * u), th = Math.PI * (1 + Math.sqrt(5)) * i, r = 2 + (Math.random() - .5) * .015; x = Math.sin(phi) * Math.cos(th) * r; y = Math.sin(phi) * Math.sin(th) * r; z = Math.cos(phi) * r; }
      } else if (k === 1) { const tt = u * Math.PI * 2, R = 1.3 + .5 * Math.cos(3 * tt), j = () => (Math.random() - .5) * .3; x = R * Math.cos(2 * tt) + j(); y = R * Math.sin(2 * tt) + j(); z = .8 * Math.sin(3 * tt) + j(); }
      else if (k === 2) { const cols = Math.round(Math.sqrt(N * 2.6)), rows = Math.ceil(N / cols), gx = (i % cols) / cols - .5, gz = Math.floor(i / cols) / rows - .5; x = gx * 14 - 1.8; z = gz * 5; y = Math.sin(gx * 20) * Math.cos(gz * 8) * .5; }
      else { const arm = i % 3, rr = Math.pow(Math.random(), .7) * 3, ang = rr * 1.6 + arm * Math.PI * 2 / 3; x = Math.cos(ang) * rr + (Math.random() - .5) * .3; z = Math.sin(ang) * rr + (Math.random() - .5) * .3; y = (Math.random() - .5) * .25 * (3 - rr); }
      a[i*3] = x; a[i*3+1] = y; a[i*3+2] = z; } return a; });
  const A = new Float32Array(shapes[0]), B = new Float32Array(shapes[0]), R = new Float32Array(N * 4);
  for (let i = 0; i < N * 4; i++) R[i] = Math.random();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(A, 3)); // bounding only
  geo.setAttribute('aA', new THREE.BufferAttribute(A, 3)); geo.setAttribute('aB', new THREE.BufferAttribute(B, 3)); geo.setAttribute('aR', new THREE.BufferAttribute(R, 4));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
  const U = { uTime: { value: 0 }, uMix: { value: 1 }, uPeel: { value: .14 }, uRot: { value: new THREE.Matrix3() }, uMouse: { value: new THREE.Vector3(99, 99, 99) },
    uSize: { value: mobile ? 35 : 30 }, uPR: { value: PR }, uIntro: { value: 0 } };
  const mat = new THREE.ShaderMaterial({ uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: NOISE + PALETTE + `
      attribute vec3 aA; attribute vec3 aB; attribute vec4 aR;
      uniform float uTime,uMix,uPeel,uSize,uPR,uIntro; uniform mat3 uRot; uniform vec3 uMouse;
      varying vec3 vCol; varying float vA;
      const vec3 VIO=vec3(.58,.44,.96);const vec3 PNK=vec3(.86,.50,.90);const vec3 LIM=vec3(.80,1.,.26);const vec3 LAVW=vec3(.74,.70,.98);
      void main(){
        vec3 base = mix(aA, aB, uMix);
        vec3 p = uRot * base;
        float r = length(p) + 1e-4; vec3 n = p / r;
        float sw = snoise(n * 2.3 + vec3(0., uTime * .12, uTime * .08));
        // peel: particles on the right/back side leave the sphere and flow into a ribbon, then re-form
        float dir = aR.y < uPeel * .42 ? -1. : 1.;                    // irregular symmetry: ~42% drift left, 58% right
        float side = smoothstep(-.2, .9, n.x * dir + (aR.w - .5) * .7);
        float pick = step(aR.y, uPeel * side);
        float t = fract(uTime * (.035 + .05 * aR.z) + aR.x);
        vec3 trail = vec3(0.);
        if (pick > .5) {
          vec3 q = p * .6 + vec3(t * 2.4, 0., 0.);
          float cy = snoise(q + vec3(0., uTime * .09, 1.7)), cz = snoise(q + vec3(5.2, uTime * .09, 0.));
          float lane = floor(aR.w * 7.) / 6.;                         // particles share lanes -> wispy filaments
          float reach = (dir < 0. ? .72 : 1.) * (.7 + .55 * (snoise(vec3(lane * 3.1, dir * 2.3, uTime * .05)) * .5 + .5));
          trail.x = dir * (t * t * 3.4 + t * 1.3) * reach;
          float ly = snoise(vec3(t * 1.5 - uTime * .1, lane * 6.1, 0.)), lz = snoise(vec3(t * 1.5 - uTime * .1, lane * 6.1, 9.));
          float k = smoothstep(0., .45, t);
          trail.y = -p.y * k * (dir < 0. ? .7 : .95) + ((lane - .5) * 1.5 + ly * 1.3) * t - dir * .35 * t * t + cy * (dir < 0. ? .4 : .05) * t;
          trail.z = -p.z * k * .8 + lz * .9 * t + cz * .05;
        }
        vec3 pos = p + trail;
        pos *= mix(3.5, 1., smoothstep(0., 1., uIntro));                 // intro: gather from a wide cloud
        vec3 d = pos - uMouse; float dl = length(d);
        pos += d / (dl + 1e-4) * smoothstep(1.3, 0., dl) * .55;           // pointer repel
        vec4 mv = modelViewMatrix * vec4(pos, 1.);
        vec3 nv = normalize(normalMatrix * n); vec3 vd = normalize(-mv.xyz);
        float rim = pow(1. - abs(dot(nv, vd)), 2.4);
        // watercolor: soft bleeding patches of violet / pink-violet / sage-lime, drifting slowly
        float w1 = snoise(base * .42 + vec3(0., uTime * .05, 0.));
        float w2 = snoise(base * .5 + vec3(17., -uTime * .04, 3.));
        float w3 = snoise(base * .9 + vec3(-4., 8., uTime * .07));
        vec3 col = mix(VIO, PNK, smoothstep(-.2, .45, w1));
        col = mix(col, LIM, smoothstep(-.05, .55, w2));
        col = mix(col, LAVW, smoothstep(.3, .9, w3) * .5);
        vCol = col * (1. + max(sw, 0.) * .12 + rim * .15);
        float glass = .55 + rim * .35 + max(sw, 0.) * .2 + smoothstep(.2, .8, w2) * .12;
        vA = mix(glass * .64, (1. - t * .8) * smoothstep(1., .75, t) * .52, pick) * uIntro;
        gl_PointSize = uSize * (.7 + aR.z * .45) * (1. + rim * .25) * mix(1., 1.15 + t * .7, pick) * uPR / -mv.z;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: `varying vec3 vCol; varying float vA;
      void main(){ float d = length(gl_PointCoord - .5); if (d > .5) discard; float core = smoothstep(.5, .28, d), halo = smoothstep(.5, 0., d); float a = (core * .75 + halo * .25) * vA; gl_FragColor = vec4(vCol * a, a); }` });
  const pts = new THREE.Points(geo, mat); pts.frustumCulled = false; group.add(pts);

  /* frosted glass shell: fresnel rim + faint fill */
  const shellU = { uOp: { value: 1 }, uTime: U.uTime };
  const shell = new THREE.Mesh(new THREE.SphereGeometry(2.04, 64, 48), new THREE.ShaderMaterial({ uniforms: shellU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); vP = position; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: PALETTE + `uniform float uOp,uTime; varying vec3 vN; varying vec3 vV; varying vec3 vP;
      void main(){ float f = pow(1. - max(dot(vN, vV), 0.), 3.); float g = .5 - vP.y * .2 + vP.x * .1;
        float lam = pow(max(dot(vN, normalize(vec3(-.55,.65,.5))), 0.), 2.) * .45;
        float under = pow(max(dot(vN, normalize(vec3(.5,-.6,.4))), 0.), 2.) * .36;
        float a = (f * .16 + lam * .35 + under * .35) * uOp; g += under * 4. - lam * 3.; gl_FragColor = vec4(pal(g) * a, a); }` }));
  group.add(shell);

  /* shape control (secondary) */
  let shape = 0, mixT = 1; const btns = [...document.querySelectorAll('.hero-shapes button')];
  function setShape(k) {
    if (k === shape) return;
    const m = U.uMix.value; for (let i = 0; i < N * 3; i++) A[i] = A[i] + (B[i] - A[i]) * m; // freeze current blend into A
    B.set(shapes[k]); geo.attributes.aA.needsUpdate = true; geo.attributes.aB.needsUpdate = true; U.uMix.value = 0; mixT = 0; shape = k;
    btns.forEach(b => b.classList.toggle('on', +b.dataset.shape === k));
  }
  btns.forEach(b => b.addEventListener('click', () => setShape(+b.dataset.shape)));
  hero.addEventListener('click', e => { if (e.target.closest('a,button,input,.hero-card,.hero-shapes,.sound-dock')) return; setShape((shape + 1) % 4); });
  document.querySelectorAll('[data-goto-shape]').forEach(b => b.addEventListener('click', () => { setShape(+b.dataset.gotoShape); document.querySelector('.teaser-go')?.click(); }));

  /* pointer: repel + parallax */
  const ray = new THREE.Raycaster(), plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), ndc = new THREE.Vector2(), hit = new THREE.Vector3(), tilt = new THREE.Vector2(), tiltT = new THREE.Vector2(); let hasMouse = false;
  hero.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height * 2 - 1)); tiltT.copy(ndc); hasMouse = true; }, { passive: true });
  hero.addEventListener('pointerleave', () => { hasMouse = false; tiltT.set(0, 0); });

  let mob = false; const basePos = new THREE.Vector3();
  function size() { const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    const m = w < 720; mob = m; basePos.set(m ? .95 : Math.min(1.6, camera.aspect * .74), m ? 2.35 : .1, 0); group.position.copy(basePos); group.scale.setScalar(m ? .5 : .82); }
  size(); addEventListener('resize', size);
  let on = true; new IntersectionObserver(([e]) => on = e.isIntersecting).observe(hero);
  const m4 = new THREE.Matrix4(), rx = new THREE.Matrix4(); let rotY = 0, prev = performance.now(), t = 0; const t0 = prev;
  (function loop(now) { requestAnimationFrame(loop); if (!on || document.hidden) { prev = now; return; }
    const dt = Math.min((now - prev) / 1000, .05); prev = now; if (!reduce) t += dt;
    U.uTime.value = t; U.uIntro.value = reduce ? 1 : Math.min(1, (now - t0) / 2600);
    if (mixT < 1) { mixT = Math.min(1, mixT + dt * .55); U.uMix.value = mixT * mixT * (3 - 2 * mixT); }
    shellU.uOp.value += ((shape === 0 ? 1 : 0) - shellU.uOp.value) * .05;
    if (!reduce) rotY += dt * .09;
    tilt.lerp(tiltT, .05);
    m4.makeRotationY((shape === 2 ? Math.sin(t * .15) * .12 : rotY) + tilt.x * .35); rx.makeRotationX(-.18 - tilt.y * .2 + (shape >= 2 ? .5 : 0)); m4.premultiply(rx); U.uRot.value.setFromMatrix4(m4);
    group.rotation.set(tilt.y * .06, tilt.x * .08, 0);
    if (mob) { const ty = shape === 2 ? .9 : basePos.y, tx = shape === 2 ? 1.6 : basePos.x; group.position.y += (ty - group.position.y) * .05; group.position.x += (tx - group.position.x) * .05; }
    const s = Math.min(scrollY / innerHeight, 1); U.uPeel.value = .14 + s * .3;
    if (hasMouse) { ray.setFromCamera(ndc, camera); if (ray.ray.intersectPlane(plane, hit)) { group.updateMatrixWorld(); U.uMouse.value.copy(group.worldToLocal(hit.clone())); } } else U.uMouse.value.set(99, 99, 99);
    renderer.render(scene, camera); })(prev);
})();
