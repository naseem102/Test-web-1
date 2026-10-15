/* Velora — cinematic scroll WebGL reel
   Video-matched: glass cards with titles, dense particles, 3D one-by-one roll */

const PROJECTS = [
  { id: "aurora", cat: "websites", title: "AURORA DRIFT", short: "AURORA", kicker: "Website", year: "2026", line: "A homepage that breathes with the cursor.", story: "Northline wanted weather, not a template. A river of glass planes — each chapter pulled by scroll like a tide.", hue: 210 },
  { id: "tidal", cat: "installations", title: "TIDAL ARCHIVE", short: "TIDAL", kicker: "Installation", year: "2025", line: "Crystal columns that remember footsteps.", story: "Twelve columns rise when a room goes quiet and break into light when a crowd arrives.", hue: 280 },
  { id: "halo", cat: "xr", title: "HALO PROTOCOL", short: "HALO", kicker: "XR / VR / AR", year: "2026", line: "A ring you can walk through.", story: "A brass ring the size of a plaza writes constellations you can hand to someone beside you.", hue: 190 },
  { id: "nebula", cat: "metaverse", title: "NEBULA COURT", short: "NEBULA", kicker: "Metaverse", year: "2024", line: "Islands that connect only if you look together.", story: "Bridges form when two people watch the same star. Leave, and your island keeps the weather.", hue: 320 },
  { id: "ember", cat: "games", title: "EMBER CIRCUIT", short: "EMBER", kicker: "Game", year: "2025", line: "A race run on molten glass.", story: "The track is a shader. Speed heats the world. Slow down and it cools into a sculpture.", hue: 25 },
];

const FILTERS = [
  ["all", "Everything"],
  ["websites", "Websites"],
  ["installations", "Installations"],
  ["xr", "XR / VR / AR"],
  ["metaverse", "Metaverse"],
  ["games", "Games"],
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
$("to-work").onclick = () => go(0.48);
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
    go(0.48);
    paintFocus();
  };
  li.appendChild(b);
  filterHost.appendChild(li);
});

function focusAt(p) {
  const list = visible();
  let local = 0;
  if (p <= 0.38) local = 0;
  else if (p >= 0.72) local = 1;
  else local = (p - 0.38) / 0.34;
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
    go(0.38 + local * 0.34);
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
  alpha: false,
});
let mobile = innerWidth < 760;
const updateMobile = () => {
  mobile = (window.innerWidth || document.documentElement.clientWidth) < 760;
};
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.35 : 1.75));
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.35;
renderer.setClearColor(0x07080c);

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07080c, 0.028);
const camera = new THREE.PerspectiveCamera(38, innerWidth / innerHeight, 0.1, 60);
camera.position.set(0, 0.15, 8.2);

scene.add(new THREE.AmbientLight(0xffffff, 0.28));
const addPoint = (c, x, y, z, i) => {
  const l = new THREE.PointLight(c, i, 22);
  l.position.set(x, y, z);
  scene.add(l);
};
addPoint(0xffc27a, 3.4, 2.4, 4.2, 48);
addPoint(0xff4d9a, -3.6, -0.5, 3.2, 34);
addPoint(0x9ad7ff, 0.2, 2.8, 1.2, 22);

function makeCardTexture(project) {
  const w = 1024;
  const h = 640;
  const cnv = document.createElement("canvas");
  cnv.width = w;
  cnv.height = h;
  const ctx = cnv.getContext("2d");

  const g = ctx.createLinearGradient(0, 0, w, h);
  const hue = project.hue;
  g.addColorStop(0, `hsla(${hue}, 70%, 18%, 1)`);
  g.addColorStop(0.35, `hsla(${hue + 40}, 80%, 28%, 1)`);
  g.addColorStop(0.65, `hsla(${hue + 80}, 60%, 22%, 1)`);
  g.addColorStop(1, `hsla(${hue + 20}, 50%, 12%, 1)`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 80; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const r = 40 + Math.random() * 180;
    const ng = ctx.createRadialGradient(x, y, 0, x, y, r);
    ng.addColorStop(0, `hsla(${hue + Math.random() * 60}, 90%, ${50 + Math.random() * 30}%, ${0.08 + Math.random() * 0.15})`);
    ng.addColorStop(1, "transparent");
    ctx.fillStyle = ng;
    ctx.fillRect(0, 0, w, h);
  }

  const sheen = ctx.createLinearGradient(0, 0, w, 0);
  sheen.addColorStop(0, "transparent");
  sheen.addColorStop(0.4, "rgba(255,255,255,0.06)");
  sheen.addColorStop(0.55, "rgba(255,255,255,0.18)");
  sheen.addColorStop(0.7, "rgba(255,255,255,0.06)");
  sheen.addColorStop(1, "transparent");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = "rgba(231,194,122,0.85)";
  ctx.font = "600 28px Outfit, system-ui, sans-serif";
  ctx.fillText(project.kicker.toUpperCase(), 72, 90);

  ctx.fillStyle = "rgba(255,250,245,0.95)";
  ctx.font = "800 92px Big Shoulders Display, Impact, sans-serif";
  const words = project.title.split(" ");
  let ty = h * 0.42;
  words.forEach((word) => {
    ctx.fillText(word, 72, ty);
    ty += 96;
  });

  ctx.fillStyle = "rgba(163,155,144,0.9)";
  ctx.font = "400 26px Outfit, system-ui, sans-serif";
  ctx.fillText(project.year, 72, h - 70);

  ctx.strokeStyle = "rgba(255,255,255,0.22)";
  ctx.lineWidth = 3;
  ctx.strokeRect(18, 18, w - 36, h - 36);

  const tex = new THREE.CanvasTexture(cnv);
  if (THREE.SRGBColorSpace) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const cardGeo = new THREE.PlaneGeometry(2.9, 1.82, 1, 1);
const cards = PROJECTS.map((project, i) => {
  const map = makeCardTexture(project);
  const mat = new THREE.MeshPhysicalMaterial({
    map,
    color: 0xffffff,
    roughness: 0.22,
    metalness: 0.08,
    transmission: 0.55,
    thickness: 0.35,
    transparent: true,
    opacity: 0.92,
    side: THREE.DoubleSide,
    depthWrite: false,
    emissive: new THREE.Color().setHSL(project.hue / 360, 0.5, 0.12),
    emissiveIntensity: 0.35,
  });
  const mesh = new THREE.Mesh(cardGeo, mat);
  mesh.userData = { id: project.id, index: i, project };
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

const count = mobile ? 3200 : 11000;
const positions = new Float32Array(count * 3);
const seeds = new Float32Array(count);
const sizes = new Float32Array(count);
const colors = new Float32Array(count * 3);
const palette = [
  [0.97, 0.78, 0.45],
  [1.0, 0.96, 0.9],
  [1.0, 0.38, 0.62],
  [0.45, 0.9, 0.72],
  [0.65, 0.78, 1.0],
  [0.9, 0.5, 1.0],
];
for (let i = 0; i < count; i++) {
  const r = Math.cbrt(Math.random()) * 3.6;
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  positions[i * 3] = r * Math.sin(ph) * Math.cos(th);
  positions[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
  positions[i * 3 + 2] = r * Math.cos(ph);
  seeds[i] = Math.random();
  sizes[i] = 0.75 + Math.random() * 2.6;
  const col = palette[i % palette.length];
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
      vColor = aColor;
      float seed = aSeed;
      vec3 p = position;
      float spin = uTime * (0.12 + seed * 0.05);
      float cs = cos(spin), sn = sin(spin);
      vec3 q = vec3(p.x * cs - p.z * sn, p.y, p.x * sn + p.z * cs);
      float intro   = 1.0 - smoothstep(0.0, 0.20, uProgress);
      float burst   = smoothstep(0.03, 0.16, uProgress) * (1.0 - smoothstep(0.24, 0.40, uProgress));
      float studio  = smoothstep(0.14, 0.26, uProgress) * (1.0 - smoothstep(0.38, 0.50, uProgress));
      float gallery = smoothstep(0.34, 0.48, uProgress) * (1.0 - smoothstep(0.70, 0.84, uProgress));
      float lab     = smoothstep(0.66, 0.80, uProgress) * (1.0 - smoothstep(0.90, 0.98, uProgress));
      float outro   = smoothstep(0.88, 1.0, uProgress);
      float t = seed * 6.2831853 + uTime * 0.26;
      float s = sin(t), c = cos(t), den = 1.0 + s * s;
      vec3 loop = vec3((c / den) * 2.9, (s * c / den) * 2.9, sin(t * 2.0) * 0.3);
      q = mix(q, loop, max(intro, outro) * 0.97);
      q += normalize(p + 0.001) * burst * (2.6 + seed * 5.0);
      q.y += sin(uTime * 2.0 + seed * 18.0) * burst * 1.0;
      q = mix(q, p * 1.08 + vec3(sin(uTime * 0.35 + seed * 8.0) * 0.4, cos(uTime * 0.28 + seed * 5.0) * 0.3, 0.0), studio * 0.75);
      float fall = fract(seed * 17.3 + uTime * 0.18);
      float fx = (fract(seed * 7.13) - 0.5) * 9.0;
      float fz = (fract(seed * 3.91) - 0.5) * 5.5;
      vec3 rain = vec3(fx, 4.0 - fall * 9.5, fz);
      q = mix(q, rain, gallery * 0.92);
      vec3 scatter = vec3((fract(seed * 4.2) - 0.5) * 6.5, (fract(seed * 2.9) - 0.5) * 3.2, -0.4 - fract(seed * 8.1) * 2.5);
      q = mix(q, scatter, gallery * 0.28);
      float ang = seed * 18.0 + uTime * 0.6;
      float rad = 0.45 + fract(seed * 4.4) * 1.2;
      q = mix(q, vec3(cos(ang) * rad, (fract(seed * 9.0) - 0.5) * 3.0, sin(ang) * rad), lab);
      q.x += uPointer.x * 0.7;
      q.y += uPointer.y * 0.38;
      vec4 mv = modelViewMatrix * vec4(q, 1.0);
      gl_Position = projectionMatrix * mv;
      float sz = aSize * (1.0 + burst * 1.6 + gallery * 0.9);
      gl_PointSize = clamp(sz * (280.0 / max(1.0, -mv.z)), 0.8, 18.0);
      vAlpha = smoothstep(32.0, 1.5, -mv.z) * (0.7 + 0.3 * sin(uTime * 2.2 + seed * 12.0));
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec3 vColor;
    varying float vAlpha;
    void main(){
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      if (d > 0.5) discard;
      float core = pow(smoothstep(0.5, 0.0, d), 1.55);
      float halo = pow(smoothstep(0.5, 0.0, d), 0.5) * 0.4;
      vec3 col = vColor * (1.2 + core * 1.0);
      gl_FragColor = vec4(col, (core + halo) * vAlpha);
    }
  `,
});
scene.add(new THREE.Points(pGeo, pMat));

function makeLoopGeo() {
  const pts = [];
  for (let i = 0; i <= 240; i++) {
    const t = (i / 240) * Math.PI * 2;
    const s = Math.sin(t), c = Math.cos(t), d = 1 + s * s;
    pts.push(new THREE.Vector3((c / d) * 2.65, (s * c / d) * 2.65, Math.sin(t * 2) * 0.24));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 240, 0.02, 8, true);
}
const loopMat = new THREE.MeshBasicMaterial({
  color: 0xe7c27a,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
});
const loop = new THREE.Mesh(makeLoopGeo(), loopMat);
scene.add(loop);

const lab = new THREE.Group();
lab.add(
  new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.15, 2.8, 48, 1, true),
    new THREE.MeshPhysicalMaterial({
      color: 0xd5ecff,
      roughness: 0.06,
      transmission: 0.88,
      thickness: 0.45,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    })
  )
);
const heartPts = [];
for (let i = 0; i <= 220; i++) {
  const t = (i / 220) * Math.PI * 2;
  const s = Math.sin(t);
  heartPts.push(
    new THREE.Vector3(
      16 * s * s * s * 0.044,
      (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 0.044,
      0
    )
  );
}
const heart = new THREE.Mesh(
  new THREE.TubeGeometry(new THREE.CatmullRomCurve3(heartPts, true), 220, 0.014, 8, true),
  new THREE.MeshStandardMaterial({ color: 0xffd0ea, emissive: 0xff4d9a, emissiveIntensity: 2.4 })
);
lab.add(heart);
for (let i = 0; i < 10; i++) {
  const a = (i / 10) * Math.PI * 2;
  const y = (i - 4.5) * 0.26;
  lab.add(
    new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(Math.cos(a) * 1.05, y, Math.sin(a) * 1.05),
          new THREE.Vector3(Math.cos(a) * 2.2, y + 0.45, Math.sin(a) * 2.2),
          new THREE.Vector3(Math.cos(a) * 3.5, -1.35, Math.sin(a) * 3.3),
        ]),
        32, 0.013, 5, false
      ),
      new THREE.MeshStandardMaterial({ color: 0x8ab4ff, metalness: 0.75, roughness: 0.22 })
    )
  );
}
const floorGeo = new THREE.PlaneGeometry(0.24, 0.24);
const floorMat = new THREE.MeshStandardMaterial({ color: 0x1a1e28, metalness: 0.45, roughness: 0.55 });
const floor = new THREE.InstancedMesh(floorGeo, floorMat, 900);
const dummy = new THREE.Object3D();
let fi = 0;
for (let x = -14; x <= 14; x++) {
  for (let z = -14; z <= 14; z++) {
    if (fi >= 900) break;
    dummy.position.set(x * 0.28, -1.45, z * 0.28);
    dummy.updateMatrix();
    floor.setMatrixAt(fi++, dummy.matrix);
  }
}
lab.add(floor);
scene.add(lab);

function frame() {
  requestAnimationFrame(frame);
  const t = performance.now() * 0.001;
  world.p += (world.target - world.p) * 0.055;
  world.sx += (world.mx - world.sx) * 0.055;
  world.sy += (world.my - world.sy) * 0.055;
  const p = world.p;

  pMat.uniforms.uTime.value = t;
  pMat.uniforms.uProgress.value = p;
  pMat.uniforms.uPointer.value.set(world.sx, world.sy);

  const intro = Math.max(0, 1 - Math.min(1, p / 0.26));
  const outro = Math.min(1, Math.max(0, (p - 0.88) / 0.12));
  const burst =
    Math.min(1, Math.max(0, (p - 0.05) / 0.12)) *
    (1 - Math.min(1, Math.max(0, (p - 0.26) / 0.16)));
  const midGlow =
    Math.min(1, Math.max(0, (p - 0.22) / 0.16)) *
    (1 - Math.min(1, Math.max(0, (p - 0.66) / 0.14))) * 0.5;
  const s = 0.12 + Math.max(intro, outro) * 1.2 + burst * 1.6 + midGlow;
  loop.scale.setScalar(s);
  loop.rotation.y = t * 0.16;
  loop.visible = s > 0.12;
  loopMat.opacity = Math.min(1, Math.max(intro, outro) + burst * 0.5 + midGlow);

  const { local, list } = focusAt(p);
  const f = local * Math.max(0, list.length - 1);
  const gallery =
    Math.min(1, Math.max(0, (p - 0.34) / 0.12)) *
    (1 - Math.min(1, Math.max(0, (p - 0.74) / 0.1)));
  const radius = mobile ? 3.4 : 4.6;
  const angleStep = mobile ? 0.72 : 0.62;

  cards.forEach((mesh, i) => {
    const idx = list.findIndex((item) => item.id === PROJECTS[i].id);
    const match = idx >= 0;
    const delta = match ? idx - f : 0;
    const ang = delta * angleStep;
    const targetX = Math.sin(ang) * radius;
    const targetZ = -Math.cos(ang) * radius + radius * 0.55;
    const targetY = match ? 0.35 + Math.cos(ang) * 0.15 : -3.0;
    const targetRotY = -ang * 0.95;
    const targetRotX = match ? Math.sin(ang) * 0.08 : 0.4;

    mesh.position.x += (targetX + world.sx * 0.2 - mesh.position.x) * 0.09;
    mesh.position.y += (targetY + world.sy * 0.12 - mesh.position.y) * 0.09;
    mesh.position.z += (targetZ - mesh.position.z) * 0.09;
    mesh.rotation.y += (targetRotY - mesh.rotation.y) * 0.1;
    mesh.rotation.x += (targetRotX - mesh.rotation.x) * 0.1;

    const focusBoost = match ? 1.0 - Math.min(Math.abs(delta), 1.5) * 0.18 : 0;
    const sc = match ? (0.92 + focusBoost * 0.28) * (0.12 + gallery * 0.88) : 0.001;
    mesh.scale.setScalar(Math.max(0.0001, mesh.scale.x + (sc - mesh.scale.x) * 0.1));

    const active = match && Math.abs(delta) < 0.55 ? 1 : 0;
    mesh.material.emissiveIntensity += (0.25 + active * 0.55 - mesh.material.emissiveIntensity) * 0.08;
    mesh.material.opacity = 0.75 + active * 0.2;
  });

  const labIn =
    Math.min(1, Math.max(0, (p - 0.68) / 0.12)) *
    (1 - Math.min(1, Math.max(0, (p - 0.92) / 0.06)));
  lab.visible = labIn > 0.02;
  lab.scale.setScalar(0.5 + labIn * 0.7);
  heart.rotation.y = t * 0.38;

  const zTarget =
    8.2 -
    Math.min(1, p / 0.32) * 1.15 -
    labIn * 2.3 +
    Math.min(1, Math.max(0, (p - 0.88) / 0.1)) * 1.6;
  camera.position.z += (zTarget - camera.position.z) * 0.055;
  camera.position.x += (world.sx * 0.6 - camera.position.x) * 0.055;
  camera.lookAt(world.sx * 0.18, 0.05, 0);

  const chapter =
    p < 0.13 ? "intro" : p < 0.36 ? "manifesto" : p < 0.70 ? "work" : p < 0.88 ? "lab" : "contact";

  $("hero").style.opacity = String(fade(p, 0, 0.02, 0.11, 0.22));
  $("manifesto").style.opacity = String(fade(p, 0.13, 0.22, 0.34, 0.46));
  $("work").style.opacity = String(fade(p, 0.36, 0.46, 0.68, 0.80));
  $("finder").style.opacity = String(fade(p, 0.36, 0.46, 0.68, 0.80));
  $("lab-copy").style.opacity = String(fade(p, 0.66, 0.76, 0.86, 0.95));
  $("contact").style.opacity = String(fade(p, 0.85, 0.91, 1.1, 1.2));

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
  const baseFov = 38;
  if (aspect > 1.9) camera.fov = baseFov * 0.9;
  else if (aspect < 0.65) camera.fov = baseFov * 1.1;
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
