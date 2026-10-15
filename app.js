const PROJECTS = [
  { id: "aurora", cat: "websites", title: "Aurora Drift", kicker: "Website", year: "2026", line: "A homepage that breathes with the cursor.", story: "Northline wanted weather, not a template. A river of glass planes — each chapter pulled by scroll like a tide.", v: 0 },
  { id: "tidal", cat: "installations", title: "Tidal Archive", kicker: "Installation", year: "2025", line: "Crystal columns that remember footsteps.", story: "Twelve columns rise when a room goes quiet and break into light when a crowd arrives.", v: 1 },
  { id: "halo", cat: "xr", title: "Halo Protocol", kicker: "XR / VR / AR", year: "2026", line: "A ring you can walk through.", story: "A brass ring the size of a plaza writes constellations you can hand to someone beside you.", v: 2 },
  { id: "nebula", cat: "metaverse", title: "Nebula Court", kicker: "Metaverse", year: "2024", line: "Islands that connect only if you look together.", story: "Bridges form when two people watch the same star. Leave, and your island keeps the weather.", v: 3 },
  { id: "ember", cat: "games", title: "Ember Circuit", kicker: "Game", year: "2025", line: "A race run on molten glass.", story: "The track is a shader. Speed heats the world. Slow down and it cools into a sculpture.", v: 4 }
];
const FILTERS = [
  ["all", "Everything"],
  ["websites", "Websites"],
  ["installations", "Installations"],
  ["xr", "XR / VR / AR"],
  ["metaverse", "Metaverse"],
  ["games", "Games"]
];

const world = { p: 0, target: 0, mx: 0, my: 0, sx: 0, sy: 0 };
let filter = "all";
let focusId = PROJECTS[0].id;
let booted = false;

const $ = (id) => document.getElementById(id);
const visible = () => (filter === "all" ? PROJECTS : PROJECTS.filter((p) => p.cat === filter));
const fade = (p, a, b, c, d) => {
  const inn = Math.min(1, Math.max(0, (p - a) / (b - a || 1)));
  const out = 1 - Math.min(1, Math.max(0, (p - c) / (d - c || 1)));
  return inn * out;
};
const go = (t) => {
  const max = document.documentElement.scrollHeight - innerHeight;
  scrollTo({ top: Math.max(0, max) * t, behavior: "smooth" });
};

$("home").onclick = () => go(0);
$("to-work").onclick = () => go(0.52);
$("to-contact").onclick = () => go(0.96);
document.querySelectorAll(".rail button").forEach((btn) => {
  btn.onclick = () => go(Number(btn.dataset.at));
});

const filterHost = $("filters");
FILTERS.forEach(([id, label]) => {
  const li = document.createElement("li");
  const b = document.createElement("button");
  b.type = "button";
  b.dataset.id = id;
  b.innerHTML = `<span>–</span>${label}`;
  b.onclick = () => {
    filter = id;
    go(0.5);
    paintFocus();
  };
  li.appendChild(b);
  filterHost.appendChild(li);
});

function focusAt(p) {
  const list = visible();
  let local = 0;
  if (p <= 0.4) local = 0;
  else if (p >= 0.72) local = 1;
  else local = (p - 0.4) / 0.32;
  const index = list.length <= 1 ? 0 : Math.round(local * (list.length - 1));
  return { list, index, project: list[index] || PROJECTS[0], local };
}

function paintFocus() {
  const { list, index, project } = focusAt(world.p);
  focusId = project.id;
  $("work-meta").textContent = `${String(PROJECTS.indexOf(project) + 1).padStart(2, "0")} / 05 · ${project.year}`;
  $("work-title").textContent = project.title;
  $("work-line").textContent = project.line;
  document.querySelectorAll("#filters button").forEach((b) => {
    const on = b.dataset.id === filter;
    b.classList.toggle("on", on);
    b.querySelector("span").textContent = on ? "–" : "→";
  });
  $("next-piece").onclick = () => {
    const next = (index + 1) % list.length;
    const local = list.length <= 1 ? 0.5 : next / (list.length - 1);
    go(0.4 + local * 0.32);
  };
}

function openCase(id) {
  const project = PROJECTS.find((p) => p.id === id) || PROJECTS[0];
  $("d-kicker").textContent = `${project.kicker} · ${project.year}`;
  $("d-title").textContent = project.title;
  $("d-line").textContent = project.line;
  $("d-story").textContent = project.story;
  $("dialog").classList.add("open");
  $("d-next").onclick = () => {
    const i = PROJECTS.indexOf(project);
    openCase(PROJECTS[(i + 1) % PROJECTS.length].id);
  };
}

$("open-case").onclick = () => openCase(focusId);
$("d-close").onclick = () => $("dialog").classList.remove("open");
$("dialog").onclick = (e) => {
  if (e.target.id === "dialog") $("dialog").classList.remove("open");
};

$("signal").onsubmit = (e) => {
  e.preventDefault();
  const data = new FormData(e.target);
  const name = String(data.get("name") || "").trim();
  const idea = String(data.get("idea") || "").trim();
  if (!name || !idea) return;
  const note = `${name} — ${idea}`;
  localStorage.setItem("velora-signal", note);
  e.target.outerHTML = `<div class="sent"><p class="eyebrow">Signal kept</p><p>${note.replace(/</g, "<")}</p></div>`;
};

addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  world.target = max <= 0 ? 0 : scrollY / max;
}, { passive: true });

addEventListener("pointermove", (e) => {
  world.mx = (e.clientX / innerWidth) * 2 - 1;
  world.my = -((e.clientY / innerHeight) * 2 - 1);
}, { passive: true });

addEventListener("keydown", (e) => {
  const tag = (e.target && e.target.tagName) || "";
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (e.key === "Escape") $("dialog").classList.remove("open");
  if (e.key === "ArrowDown") {
    e.preventDefault();
    window.scrollBy({ top: innerHeight * 0.72, behavior: "smooth" });
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    window.scrollBy({ top: -innerHeight * 0.72, behavior: "smooth" });
  }
});

if (typeof THREE === "undefined") {
  $("veil").querySelector("p").textContent = "Three.js failed to load";
  throw new Error("THREE missing");
}

const canvas = $("c");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance",
});
let mobile = innerWidth < 760;
const updateMobile = () => { mobile = (window.innerWidth || document.documentElement.clientWidth) < 760; };
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.35 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.28;
renderer.setClearColor(0x07080c);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07080c, 0.035);
const camera = new THREE.PerspectiveCamera(37, innerWidth / innerHeight, 0.1, 48);
camera.position.set(0, 0.2, 7.5);

scene.add(new THREE.AmbientLight(0xffffff, 0.25));
const addPoint = (c, x, y, z, i) => {
  const l = new THREE.PointLight(c, i, 20);
  l.position.set(x, y, z);
  scene.add(l);
};
addPoint(0xffc27a, 3.2, 2.2, 4, 40);
addPoint(0xff4d9a, -3.4, -0.6, 3, 28);
addPoint(0x9ad7ff, 0, 2.6, 1, 18);

const count = mobile ? 2800 : 9000;
const positions = new Float32Array(count * 3);
const seeds = new Float32Array(count);
const sizes = new Float32Array(count);
const colors = new Float32Array(count * 3);
const palette = [
  [0.97, 0.78, 0.45],
  [1, 0.96, 0.9],
  [1, 0.38, 0.62],
  [0.45, 0.9, 0.72],
  [0.65, 0.78, 1],
];
for (let i = 0; i < count; i++) {
  const r = Math.cbrt(Math.random()) * 3.4;
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
  positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
  positions[i * 3 + 2] = r * Math.cos(ph);
  seeds[i] = Math.random();
  sizes[i] = 0.7 + Math.random() * 2.4;
  const col = palette[i % 5];
  colors[i * 3] = col[0];
  colors[i * 3 + 1] = col[1];
  colors[i * 3 + 2] = col[2];
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
pGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
pGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
pGeo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));

const pMat = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPointer: { value: new THREE.Vector2() },
  },
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  vertexShader: `
    attribute float aSeed; attribute float aSize; attribute vec3 aColor;
    uniform float uTime; uniform float uProgress; uniform vec2 uPointer;
    varying vec3 vColor; varying float vAlpha;
    void main(){
      vColor=aColor; float seed=aSeed; vec3 p=position;
      float spin=uTime*(0.14+seed*0.06); float cs=cos(spin), sn=sin(spin);
      vec3 q=vec3(p.x*cs-p.z*sn,p.y,p.x*sn+p.z*cs);
      float intro=1.0-smoothstep(0.0,0.22,uProgress);
      float burst=smoothstep(0.04,0.18,uProgress)*(1.0-smoothstep(0.26,0.42,uProgress));
      float studio=smoothstep(0.16,0.28,uProgress)*(1.0-smoothstep(0.40,0.52,uProgress));
      float gallery=smoothstep(0.36,0.50,uProgress)*(1.0-smoothstep(0.70,0.82,uProgress));
      float lab=smoothstep(0.68,0.82,uProgress)*(1.0-smoothstep(0.90,0.98,uProgress));
      float outro=smoothstep(0.88,1.0,uProgress);
      float t=seed*6.2831853+uTime*0.28; float s=sin(t), c=cos(t), den=1.0+s*s;
      vec3 loop=vec3((c/den)*2.8,(s*c/den)*2.8,sin(t*2.0)*0.28);
      q=mix(q,loop,max(intro,outro)*0.96);
      q+=normalize(p+0.001)*burst*(2.2+seed*4.5);
      q.y+=sin(uTime*1.8+seed*20.0)*burst*0.85;
      q=mix(q, p*1.05 + vec3(sin(uTime*0.4+seed*9.0)*0.35, cos(uTime*0.3+seed*5.0)*0.25, 0.0), studio*0.7);
      float fall = fract(seed*13.7 + uTime*0.12);
      vec3 rain = vec3((fract(seed*7.13)-0.5)*7.5, 3.2 - fall*7.5, (fract(seed*3.1)-0.5)*4.0);
      q=mix(q, rain, gallery*0.85);
      q=mix(q, vec3((fract(seed*4.2)-0.5)*5.0, (fract(seed*2.9)-0.5)*2.6, -0.5-fract(seed*8.1)*2.0), gallery*0.35);
      float ang=seed*18.0+uTime*0.55; float rad=0.4+fract(seed*4.4)*1.1;
      q=mix(q,vec3(cos(ang)*rad,(fract(seed*9.0)-0.5)*2.9,sin(ang)*rad),lab);
      q.x+=uPointer.x*0.65; q.y+=uPointer.y*0.35;
      vec4 mv=modelViewMatrix*vec4(q,1.0);
      gl_Position=projectionMatrix*mv;
      float sz = aSize * (1.0 + burst*1.4 + gallery*0.6);
      gl_PointSize=clamp(sz*(260.0/max(1.0,-mv.z)),0.7,16.0);
      vAlpha=smoothstep(30.0,1.8,-mv.z)*(0.75+0.25*sin(uTime*2.0+seed*10.0));
    }`,
  fragmentShader: `
    precision highp float; varying vec3 vColor; varying float vAlpha;
    void main(){
      vec2 uv=gl_PointCoord-0.5; float d=length(uv);
      if(d>0.5) discard;
      float core = pow(smoothstep(0.5,0.0,d), 1.6);
      float halo = pow(smoothstep(0.5,0.0,d), 0.55)*0.35;
      vec3 col = vColor * (1.15 + core*0.9);
      gl_FragColor=vec4(col, (core+halo)*vAlpha);
    }`,
});
scene.add(new THREE.Points(pGeo, pMat));

function makeLoopGeo() {
  const pts = [];
  for (let i = 0; i <= 220; i++) {
    const t = (i / 220) * Math.PI * 2;
    const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s;
    pts.push(new THREE.Vector3((c / d) * 2.55, (s * c / d) * 2.55, Math.sin(t * 2) * 0.22));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 220, 0.018, 8, true);
}
const loopMat = new THREE.MeshBasicMaterial({
  color: 0xe7c27a,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
});
const loop = new THREE.Mesh(makeLoopGeo(), loopMat);
scene.add(loop);

const cardFrag = `
  precision highp float; varying vec2 vUv;
  uniform float uTime; uniform float uVariant; uniform float uActive;
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y); }
  float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.15; a*=.5; } return v; }
  void main(){
    vec2 uv=vUv;
    float n=fbm(uv*3.6+uTime*.15);
    float n2=fbm(uv*8.0-uTime*.08);
    vec3 col;
    if(uVariant<0.5){
      col=vec3(0.06,0.10,0.18)+vec3(0.45,0.75,1.0)*n+vec3(1.0,0.75,0.35)*pow(n,3.0);
      col+=vec3(0.6,0.85,1.0)*pow(1.0-abs(uv.y-0.5)*2.0,6.0)*0.25;
    } else if(uVariant<1.5){
      col=vec3(0.12,0.04,0.14)+vec3(1.0,0.28,0.62)*n+vec3(0.95,0.9,1.0)*pow(1.0-abs(uv.y-.5)*2.,5.)*0.45;
      col+=vec3(1.0,0.5,0.8)*n2*0.2;
    } else if(uVariant<2.5){
      float r=length(uv-0.5);
      col=vec3(0.04,0.07,0.12)+vec3(0.55,0.9,1.0)*smoothstep(0.55,0.08,r)*n*2.2;
      col+=vec3(0.8,0.95,1.0)*pow(smoothstep(0.5,0.0,r),3.0)*0.4;
    } else if(uVariant<3.5){
      col=vec3(0.03,0.09,0.11)+vec3(0.15,1.0,0.7)*n+vec3(1.0,0.85,0.3)*step(0.82,fract(uv.x*10.0+uTime*0.4))*0.5;
      col+=vec3(0.2,0.9,0.8)*n2*0.25;
    } else {
      float g=smoothstep(0.07,0.0,min(abs(fract(uv.x*18.)-0.5),abs(fract(uv.y*11.)-0.5)));
      col=vec3(0.05,0.02,0.01)+vec3(1.0,0.38,0.08)*g+vec3(1.0,0.65,0.2)*n;
      col+=vec3(1.0,0.5,0.15)*n2*0.3;
    }
    vec2 r=abs(uv*2.0-1.0)-vec2(0.88);
    float dist=length(max(r,0.0))+min(max(r.x,r.y),0.0)-0.12;
    float mask=smoothstep(0.025,0.0,dist);
    float rim=smoothstep(0.1,0.0,abs(dist));
    col+=vec3(1.0,0.94,0.82)*rim*(0.35+uActive*0.85);
    float sweep=smoothstep(0.0,0.15,abs(uv.x-fract(uTime*0.08)-0.1))*smoothstep(0.4,0.0,abs(uv.y-0.45));
    col+=vec3(1.0)*sweep*0.12*(0.4+uActive);
    col=mix(col, col*1.35+vec3(0.15,0.12,0.08), uActive*0.5);
    if(mask<0.02) discard;
    gl_FragColor=vec4(col, mask*(0.88+uActive*0.12));
  }`;

const cards = PROJECTS.map((project) => {
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
    fragmentShader: cardFrag,
    uniforms: {
      uTime: { value: 0 },
      uVariant: { value: project.v },
      uActive: { value: 0 },
    },
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2.7, 1.7), mat);
  mesh.userData = { id: project.id };
  scene.add(mesh);
  return mesh;
});

const ray = new THREE.Raycaster();
canvas.addEventListener("pointerdown", (e) => {
  const rect = canvas.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  );
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(cards, false)[0];
  if (hit) openCase(hit.object.userData.id);
});

const lab = new THREE.Group();
lab.add(
  new THREE.Mesh(
    new THREE.CylinderGeometry(1.12, 1.12, 2.7, 40, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: 0xd5ecff,
      roughness: 0.08,
      transmission: 0.86,
      thickness: 0.4,
      transparent: true,
      opacity: 0.4,
      side: THREE.DoubleSide,
    })
  )
);
const heartPts = [];
for (let i = 0; i <= 200; i++) {
  const t = (i / 200) * Math.PI * 2;
  const s = Math.sin(t);
  heartPts.push(
    new THREE.Vector3(
      16 * s * s * s * 0.042,
      (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.042,
      0
    )
  );
}
const heart = new THREE.Mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(heartPts, true), 200, 0.012, 8, true),
  new THREE.MeshStandardMaterial({ color: 0xffd0ea, emissive: 0xff4d9a, emissiveIntensity: 2.2 })
);
lab.add(heart);
for (let i = 0; i < 8; i++) {
  const a = (i / 8) * Math.PI * 2;
  const y = (i - 3.5) * 0.28;
  lab.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(Math.cos(a) * 1.02, y, Math.sin(a) * 1.02),
          new THREE.Vector3(Math.cos(a) * 2.1, y + 0.4, Math.sin(a) * 2.1),
          new THREE.Vector3(Math.cos(a) * 3.4, -1.3, Math.sin(a) * 3.2),
        ]),
        28,
        0.012,
        5,
        false
      ),
      new THREE.MeshStandardMaterial({ color: 0x8ab4ff, metalness: 0.7, roughness: 0.25 })
    )
  );
}
const floorGeo = new THREE.PlaneGeometry(0.22, 0.22);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1e28, metalness: 0.4, roughness: 0.6 });
const floor = new THREE.InstancedMesh(floorGeo, floorMat, 784);
const dummy = new THREE.Object3D();
let fi = 0;
for (let x = -13; x <= 13; x++) {
  for (let z = -13; z <= 13; z++) {
    dummy.position.set(x * 0.28, -1.42, z * 0.28);
    dummy.updateMatrix();
    floor.setMatrixAt(fi++, dummy.matrix);
  }
}
lab.add(floor);
scene.add(lab);

function frame() {
  requestAnimationFrame(frame);
  const t = performance.now() * 0.001;
  world.p += (world.target - world.p) * 0.06;
  world.sx += (world.mx - world.sx) * 0.06;
  world.sy += (world.my - world.sy) * 0.06;
  const p = world.p;

  pMat.uniforms.uTime.value = t;
  pMat.uniforms.uProgress.value = p;
  pMat.uniforms.uPointer.value.set(world.sx, world.sy);

  const intro = Math.max(0, 1 - Math.min(1, p / 0.28));
  const outro = Math.min(1, Math.max(0, (p - 0.86) / 0.14));
  const burst =
    Math.min(1, Math.max(0, (p - 0.06) / 0.14)) *
    (1 - Math.min(1, Math.max(0, (p - 0.28) / 0.18)));
  const midGlow = Math.min(1, Math.max(0, (p - 0.25) / 0.18)) * (1 - Math.min(1, Math.max(0, (p - 0.68) / 0.16))) * 0.55;
  const s = 0.15 + Math.max(intro, outro) * 1.15 + burst * 1.55 + midGlow;
  loop.scale.setScalar(s);
  loop.rotation.y = t * 0.18;
  loop.visible = s > 0.15;
  loopMat.opacity = Math.min(1, Math.max(intro, outro) + burst * 0.45 + midGlow);

  const { local } = focusAt(p);
  const list = visible();
  const f = local * Math.max(0, list.length - 1);
  const gallery =
    Math.min(1, Math.max(0, (p - 0.32) / 0.14)) *
    (1 - Math.min(1, Math.max(0, (p - 0.74) / 0.12)));
  const spread = mobile ? 2.0 : 3.15;

  cards.forEach((mesh, i) => {
    const idx = list.findIndex((item) => item.id === PROJECTS[i].id);
    const match = idx >= 0;
    const delta = match ? idx - f : 0;
    mesh.position.x += (delta * spread + world.sx * 0.18 - mesh.position.x) * 0.08;
    mesh.position.y += ((match ? 0.55 : -2.4) + world.sy * 0.12 - mesh.position.y) * 0.09;
    mesh.position.z += (-Math.abs(delta) * 0.9 - mesh.position.z) * 0.08;
    mesh.rotation.y += (delta * -0.48 - mesh.rotation.y) * 0.09;
    const sc = match
      ? (1.02 - Math.min(Math.abs(delta), 1.4) * 0.16) * (0.15 + gallery * 0.85)
      : 0.001;
    mesh.scale.setScalar(Math.max(0.0001, mesh.scale.x + (sc - mesh.scale.x) * 0.08));
    mesh.material.uniforms.uTime.value = t;
    mesh.material.uniforms.uActive.value +=
      ((match && Math.abs(delta) < 0.45 ? 1 : 0) - mesh.material.uniforms.uActive.value) * 0.08;
  });

  const labIn =
    Math.min(1, Math.max(0, (p - 0.7) / 0.14)) *
    (1 - Math.min(1, Math.max(0, (p - 0.93) / 0.07)));
  lab.visible = labIn > 0.02;
  lab.scale.setScalar(0.55 + labIn * 0.62);
  heart.rotation.y = t * 0.35;

  const zTarget =
    7.8 -
    Math.min(1, p / 0.35) * 1.0 -
    labIn * 2.1 +
    Math.min(1, Math.max(0, (p - 0.88) / 0.1)) * 1.5;
  camera.position.z += (zTarget - camera.position.z) * 0.06;
  camera.position.x += (world.sx * 0.55 - camera.position.x) * 0.06;
  camera.lookAt(world.sx * 0.15, 0, 0);

  const chapter =
    p < 0.14 ? "intro" : p < 0.38 ? "manifesto" : p < 0.70 ? "work" : p < 0.88 ? "lab" : "contact";

  $("hero").style.opacity = String(fade(p, 0, 0.02, 0.12, 0.24));
  $("manifesto").style.opacity = String(fade(p, 0.14, 0.24, 0.38, 0.50));
  $("work").style.opacity = String(fade(p, 0.38, 0.50, 0.70, 0.82));
  $("finder").style.opacity = String(fade(p, 0.38, 0.50, 0.70, 0.82));
  $("lab-copy").style.opacity = String(fade(p, 0.68, 0.78, 0.88, 0.96));
  $("contact").style.opacity = String(fade(p, 0.86, 0.92, 1.1, 1.2));

  $("manifesto").classList.toggle("hidden", chapter !== "manifesto");
  $("finder").classList.toggle("hidden", chapter !== "work");
  $("work").classList.toggle("hidden", chapter !== "work");
  $("lab-copy").classList.toggle("hidden", chapter !== "lab");
  $("contact").classList.toggle("hidden", chapter !== "contact");

  $("chapter").textContent = chapter;
  $("bar").style.transform = `scaleX(${Math.max(0.04, p)})`;
  document.querySelectorAll(".rail button").forEach((btn) => {
    const at = Number(btn.dataset.at);
    const on =
      (chapter === "intro" && at === 0) ||
      (chapter === "manifesto" && at === 0.24) ||
      (chapter === "work" && at === 0.5) ||
      (chapter === "lab" && at === 0.8) ||
      (chapter === "contact" && at === 0.94);
    btn.classList.toggle("on", on);
  });

  const nextFocus = focusAt(p).project.id;
  if (nextFocus !== focusId) paintFocus();

  renderer.render(scene, camera);
  if (!booted) {
    booted = true;
    $("veil").classList.add("off");
  }
}

paintFocus();
function getSize() {
  const vv = window.visualViewport;
  const w = Math.max(1, Math.floor(vv ? vv.width : innerWidth));
  const h = Math.max(1, Math.floor(vv ? vv.height : innerHeight));
  return { w, h };
}

function onResize() {
  updateMobile();
  const { w, h } = getSize();
  const aspect = w / h;
  camera.aspect = aspect;
  const baseFov = 37;
  if (aspect > 1.9) camera.fov = baseFov * 0.92;
  else if (aspect < 0.65) camera.fov = baseFov * 1.08;
  else camera.fov = baseFov;
  camera.updateProjectionMatrix();
  const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.75);
  renderer.setPixelRatio(dpr);
  renderer.setSize(w, h, false);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
}

let resizeRaf = 0;
const scheduleResize = () => {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    onResize();
  });
};

addEventListener("resize", scheduleResize, { passive: true });
addEventListener("orientationchange", () => setTimeout(scheduleResize, 120), { passive: true });
if (window.visualViewport) {
  visualViewport.addEventListener("resize", scheduleResize, { passive: true });
  visualViewport.addEventListener("scroll", scheduleResize, { passive: true });
}
onResize();
frame();
