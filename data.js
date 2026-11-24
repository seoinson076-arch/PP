/* ==========================================================
   ★ 프로젝트 링크 설정 — 배포 주소는 여기서만 고치면 됩니다 ★
   demoUrl : 배포(라이브) 주소. 모르면 '' 로 두면 "라이브 링크 준비 중"으로 표시
   repoUrl : GitHub 주소 (보조 링크). 비공개 저장소면 '' 로 두기
   chapter : 'web' = 05 웹페이지 챕터 / 'vibe' = 04 바이브코딩 챕터
   ========================================================== */
window.PROJECTS = [
  { id: 'jobsaba', chapter: 'web', title: '잡사바 FOOD', demoUrl: 'https://jobsaba.vercel.app', repoUrl: 'https://github.com/gj3130-stack/jobsaba',
    status: 'Live', kind: '웹 서비스', tools: 'Next.js · TypeScript · Supabase', shot: 'shots/proj-jobsaba.png',
    hook: '참기름·액젓·장류를 파는 식품 쇼핑몰',
    desc: '참기름·액젓·장류·반찬을 파는 식품 쇼핑몰. 결제 등 외부 연동은 모의 구현 단계입니다.' },
  { id: 'golmok', chapter: 'web', title: '골목맛집', demoUrl: 'https://golmok-matzip-app.vercel.app', repoUrl: 'https://github.com/gj3130-stack/golmok-matzip',
    status: 'Live', kind: '모바일 웹', tools: 'TypeScript · 지도 · 공공데이터', shot: 'shots/proj-golmok.png', phone: true,
    hook: '내 주변 500m·1km·3km 맛집을 지도로 찾기',
    desc: '내 주변 500m·1km·3km 안의 음식점과 카페를 지도로 바로 찾아보는 동네 맛집 탐색 서비스.' },
  { id: 'auto_video', chapter: 'vibe', title: 'AI Video Studio Pro', demoUrl: '', repoUrl: '',
    status: '개발 중', kind: '데스크톱 앱', tools: 'Electron · React · FastAPI', art: ['AI', 'VIDEO', 'STUDIO'],
    hook: 'Gemini로 스토리를 기획하는 AI 영상 제작 앱',
    desc: 'Gemini 스토리 기획 엔진과 장면 수정·재배치를 갖춘 데스크톱 AI 영상 제작 앱. 이미지·영상 생성 연결은 다음 단계입니다.' },
  { id: 'memory-plus', chapter: 'vibe', title: 'AskMemo · memory+', demoUrl: '', repoUrl: '',
    status: '개발 중', kind: 'Android 앱', tools: 'Kotlin · Jetpack Compose', art: ['Ask', 'Memo', '+'],
    hook: '자연어로 물으면 메모를 찾아 주는 메모 앱',
    desc: '사진·영상·음성까지 원터치로 기록하고, 자연어로 물으면 관련 메모를 찾아 주는 Android 메모 앱.' }
];

/* ==========================================================
   👗 패션 챕터 (03 Fashion Space) 작품 목록
   - 작품이 생기면 { soon: true } 칸을 아래 형식으로 바꾸면 됩니다.
     { title: '작품명', desc: '한 줄 설명', status: '작업 중' 또는 '공개',
       poster: 'thumbs/파일.jpg', preview: 'thumbs/파일-preview.mp4', film: 'FILMS의 id' }
     (영상이 아니라 링크라면 film 대신 href: 'https://...')
   - { soon: true } 는 "준비 중 — 곧 공개" 빈 칸으로 표시됩니다.
   ========================================================== */
window.FASHION = [
  { title: '3D 패션쇼 런웨이', desc: '가상 공간과 패션을 연결하는 런웨이 프리비즈', status: '작업 중',
    poster: 'thumbs/runway.jpg', preview: 'thumbs/runway-preview.mp4', film: 'runway' },
  { soon: true },
  { soon: true },
  { soon: true }
];

/* 포트폴리오 데이터 — 내용을 바꾸려면 이 파일만 고치면 됩니다. */
/* ==========================================================
   ♪ 배경 음악 설정
   src    : 음악 파일 경로. 비워 두면('') 사이트가 직접 만드는 앰비언트 음악이 재생됩니다.
            예) mp3를 portfolio-v2 폴더에 넣고  src: 'music.mp3'
   volume : 0 ~ 1 (기본 0.5)
   title  : 사운드 버튼 옆에 잠깐 보이는 곡 이름
   ========================================================== */
/* tracks : 플레이리스트(위에서부터 재생, 끝나면 다음 곡 → 처음으로). 비우면 src / 앰비언트 사용 */
window.MUSIC = { volume: 0.5, title: 'Geumge Ambient — Night Studio', tracks: [
  { src: 'audio/studio-lofi.mp3', title: 'Studio Lo-fi — Night Desk' },   // 기본 곡: 일정한 볼륨의 차분한 로파이 그루브 (~90 BPM)
  { src: 'audio/soft-bloom.mp3',  title: 'Soft Bloom — Quiet Design' }    // 잔잔하게 시작해 점점 피어나는 앰비언트 (~80 BPM)
] };

window.PORTFOLIO = (() => {
  const GENRES = [
    { id: 'ad',      label: '광고 · 브랜드',     en: 'Commercial',    hook: '15초 안에 마음을 사로잡는 이야기' },
    { id: 'history', label: '역사 · 헤리티지',    en: 'Heritage',      hook: '잠들어 있던 시간을 다시 깨우다' },
    { id: 'story',   label: '스토리 · 애니메이션', en: 'Story & Anim',  hook: '바다, 동물, 그리고 고양이의 이야기' },
    { id: 'drama',   label: '감성 숏필름',        en: 'Short Film',    hook: '오래 남는 장면, 조용한 울림' },
    { id: 'shorts',  label: 'YouTube Shorts',    en: 'Shorts',        hook: '세로 화면 속 짧고 강한 한 방' }
  ];
  // [id, 제목, 파일, 장르, 길이(초), 방향 h/v, 클릭 유도 한 줄]
  const FILMS = [
    ['chicken', '새벽 1시, 치킨과 스마트워치', '새벽1시_치킨과스마트워치.mp4', 'ad', 42.8, 'h', '새벽 1시, 치킨 앞에서 울린 알림의 정체는?'],
    ['noad', 'NO.AD 정수기 광고', 'NO.AD정수기 광고.mp4', 'ad', 56.2, 'h', '물 한 잔이 광고가 되는 순간'],
    ['nouveau', '누보 로스팅 커피 광고', '누보로스팅커피광고.mp4', 'ad', 65.4, 'v', '노을 끝에서 내린 커피 한 잔의 온도'],
    ['danwon', '단원 김홍도', '단원 김홍도.mp4', 'history', 415.8, 'h', '붓 끝 하나로 조선의 하루를 그린 사람'],
    ['moment', '모든 찰나의 순간이 역사로 남는다', '모든 찰나의 순간이 역사로 남는다. 0827.mp4', 'history', 166.5, 'h', '흑백 사진 속 그날의 거리, 다시 걸어볼까요?'],
    ['celadon', '경서동 녹청자요지', '경서동_녹청자요지 최종본.mp4', 'history', 111.6, 'v', '땅속에 잠든 가마가 다시 불을 지핀다면'],
    ['dokdo', '독도에 사는 강치이야기', '독도에 사는 강치이야기.mp4', 'story', 59.9, 'h', '독도의 오랜 주민, 강치를 기억하나요?'],
    ['sea', '바다이야기', '바다이야기.mp4', 'story', 60.0, 'h', '문어·돌고래·해마, 바닷속 주민들의 하루'],
    ['bungeo', '황금잉어빵 · 1화', '황금잉어빵_1화.mp4', 'story', 67.6, 'h', '고양이와 잉어빵, 1화부터 심상치 않다'],
    ['spring', '봄바람이 분다', '봄바람이 분다(최종완성본).mp4', 'drama', 409.1, 'h', '말하지 못한 마음에도 봄바람은 분다'],
    ['tree', '한 그루의 시간', '한 그루의 시간.mp4', 'drama', 172.9, 'v', '씨앗 하나가 숲이 되기까지의 시간'],
    ['runway', '3D 패션쇼 런웨이', 'fashion_runway_show.mp4', 'fashion', 8.7, 'v', '가상 런웨이의 첫 워킹 · 작업 중']
  ].map(([id, title, file, genre, dur, ratio, hook]) => ({ id, title, file, genre, dur, ratio, hook,
      poster: `thumbs/${id}.jpg`, preview: `thumbs/${id}-preview.mp4`, src: 'Movie/' + id + '.mp4' }));
  const SHORTS = [
    { id: 'JmnpKyzdCiM', thumb: 'oardefault', title: '네이버 비행단, 하늘에 쓰다', hook: '넾다세일 AI 광고제 출품작 · 하늘에 쓴 메시지' },
    { id: '0DsgG8vvZWU', thumb: 'oardefault', title: '혜택 폭발!! 누리호편', hook: '#넾다세일 누리호, 혜택을 싣고 발사' },
    { id: 'JB_QJqrMM5o', thumb: 'hqdefault', title: '인생 브이로그', hook: '짧은 세로 화면에 담은 인생 한 편' }
  ];
  const fmt = s => { s = Math.round(s); const m = Math.floor(s / 60); return `${m}:${String(s % 60).padStart(2, '0')}`; };
  const genreOf = id => GENRES.find(g => g.id === id);
  /* 프로젝트 CTA: 라이브 주소가 있으면 '라이브 보기'가 주 버튼, 없으면 중립 '준비 중' 표시. GitHub은 보조 */
  function projectCtas(p) {
    const c = [p.demoUrl ? { label: '라이브 보기 ↗', href: p.demoUrl, primary: true } : { label: '라이브 링크 준비 중', pending: true }];
    if (p.repoUrl) c.push({ label: 'GitHub', href: p.repoUrl, minor: true });
    return c;
  }

  /* 챕터: 01 광고 영상 · 02 영상 스토리 · 03 패션 · 04 바이브코딩 · 05 웹페이지 · 06 About · 07 Contact */
  const CHAPTERS = [
    { id: 'ad',      sec: 'ads',     num: '01', label: '광고 영상',   title: 'Brand', em: 'Films',   hook: '광고·브랜드 필름과 유튜브 쇼츠. 15초 안에 마음을 사로잡는 이야기.' },
    { id: 'story',   sec: 'stories', num: '02', label: '영상 스토리', title: 'Story', em: 'Films',   hook: '역사·애니메이션·감성 숏필름. 오래 남는 장면들.' },
    { id: 'fashion', sec: 'fashion', num: '03', label: '패션',       title: 'Fashion', em: 'Space', hook: '가상 쇼룸과 런웨이. 패션과 공간을 잇는 새 작업이 이어집니다.' },
    { id: 'vibe',    sec: 'vibe',    num: '04', label: '바이브코딩', title: 'Vibe', em: 'Coded',    hook: 'AI와 함께 만드는 앱, Three.js 3D 인터랙션과 AI 기술 연구.' },
    { id: 'web',     sec: 'web',     num: '05', label: '웹페이지',   title: 'Web', em: 'Live',      hook: '지금 바로 접속해 볼 수 있는 배포된 웹사이트.' },
    { id: 'about',   sec: 'about',   num: '06', label: 'About',      title: 'Behind', em: 'the work', hook: '디자인의 감각과 기획력, AI 기술로 새로운 경험을 만듭니다.' },
    { id: 'contact', sec: 'contact', num: '07', label: 'Contact',    title: "Let's", em: 'talk',    hook: '새로운 아이디어, 흥미로운 협업을 기다립니다.' }
  ];

  /* 전체 작업 인덱스: 모든 카드가 같은 구조(썸네일·제목·태그·도구·길이·한 줄·CTA). cat = 챕터 id */
  const catOfGenre = g => g === 'ad' || g === 'shorts' ? 'ad' : 'story';
  const WORKS = [
    ...FILMS.filter(f => f.genre !== 'fashion').map(f => ({
      cat: catOfGenre(f.genre), sub: f.genre, title: f.title, tag: genreOf(f.genre).label, meta: fmt(f.dur) + (f.ratio === 'v' ? ' · 세로' : ''),
      tools: 'AI 영상', hook: f.hook, thumb: f.poster, preview: f.preview, film: f.id,
      ctas: [{ label: '▶ 영상 보기', film: f.id, primary: true }] })),
    ...SHORTS.map(s => ({
      cat: 'ad', sub: 'shorts', title: s.title, tag: 'YouTube Shorts', meta: 'Shorts · 세로', tools: 'YouTube', hook: s.hook,
      thumb: `https://i.ytimg.com/vi/${s.id}/${s.thumb}.jpg`, yt: s.id,
      ctas: [{ label: '▶ 쇼츠 보기', yt: s.id, primary: true }, { label: 'YouTube ↗', href: `https://www.youtube.com/shorts/${s.id}` }] })),
    ...window.FASHION.filter(f => !f.soon).map(f => ({
      cat: 'fashion', title: f.title, tag: '패션 · ' + (f.status || '공개'), meta: f.film ? fmt((FILMS.find(x => x.id === f.film) || {}).dur || 0) + ' · 세로' : '', tools: '3D · AI 영상', hook: f.desc,
      thumb: f.poster, preview: f.preview, film: f.film,
      ctas: f.film ? [{ label: '▶ 영상 보기', film: f.film, primary: true }, { label: '챕터 →', jump: '#fashion' }] : [{ label: '보기 ↗', href: f.href, primary: true }] })),
    ...window.PROJECTS.filter(p => p.chapter === 'vibe').map(p => ({
      cat: 'vibe', title: p.title, tag: '바이브코딩 · ' + p.status, meta: p.kind, tools: p.tools, hook: p.hook,
      thumb: p.shot, art: p.shot ? '' : 'code', artText: p.art, ctas: [{ label: '자세히 →', jump: '#vibe', primary: true }, ...projectCtas(p).filter(c => !c.pending)] })),
    { cat: 'vibe', title: 'Particle Morph', tag: 'Three.js · 3D 인터랙션', meta: '실시간 데모', tools: 'Three.js · WebGL', hook: '첫 화면 배경 · 포인터에 반응해 모양이 바뀌는 파티클',
      art: 'particles', ctas: [{ label: '◎ 데모 체험', jump: '#top', primary: true }, { label: '설명 →', jump: '#vibe' }] },
    { cat: 'vibe', title: '3D 인터랙션 연구', tag: 'Three.js · 3D 인터랙션', meta: '연구', tools: 'Three.js · Shader · GSAP', hook: '포인터·스크롤·터치에 반응하는 웹 3D 장면',
      art: 'orbit', ctas: [{ label: '자세히 →', jump: '#vibe', primary: true }] },
    { cat: 'vibe', title: '새로운 AI 기술 연구', tag: 'AI 리서치', meta: '연구', tools: 'ComfyUI · Tripo · Kling', hook: '이미지·영상·3D 생성 AI를 작업 흐름에 연결',
      art: 'ai', ctas: [{ label: '자세히 →', jump: '#vibe', primary: true }] },
    ...window.PROJECTS.filter(p => p.chapter === 'web').map(p => ({
      cat: 'web', title: p.title, tag: '웹페이지 · ' + p.status, meta: p.kind, tools: p.tools, hook: p.hook,
      thumb: p.shot, thumbPos: p.phone ? 'top' : '', art: p.shot ? '' : 'code', artText: p.art, live: !!p.demoUrl,
      ctas: projectCtas(p) }))
  ];
  const CATS = [{ id: 'all', label: '전체' }, ...CHAPTERS.slice(0, 5).map(c => ({ id: c.id, label: c.label }))];
  const SUBS = { ad: ['ad', 'shorts'], story: ['history', 'story', 'drama'] };
  const SKILLS = [['LLM & Agent','ChatGPT · Gemini · Claude · Cursor'],['Creative AI','Grok · Flow · Seedance · MiniMax · Higgsfield · Kling · Midjourney · ChatGPT Image · Nano Banana · Tripo'],['TTS','Google AI Studio · ElevenLabs · Vrew · Typecast'],['Music','Suno AI'],['Editor','CapCut'],['Workflow AI','ComfyUI'],['Vibe Coding','Antigravity · Codex · Cowork · Three.js · Previs · Cursor'],['IDE · DB · Deploy','VS Code · Supabase · GitHub · Vercel']];
  return { PROJECTS: window.PROJECTS, FASHION: window.FASHION, projectCtas, GENRES, FILMS, SHORTS, WORKS, CATS, SUBS, CHAPTERS, SKILLS, fmt, genreOf };
})();
