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
  if (e.target === $("dialog")) $("dialog").classList.remove("open");
};

$("signal").onsubmit = (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const payload = { name: fd.get("name"), idea: fd.get("idea"), at: Date.now() };
  try {
    const prev = JSON.parse(localStorage.getItem("velora-signals") || "[]");
    prev.push(payload);
    localStorage.setItem("velora-signals", JSON.stringify(prev.slice(-20)));
  } catch (_) {}
  e.target.reset();
  e.target.innerHTML = `<p class="sent">Signal received. We'll answer soon.</p><button type="button" id="again">Send another</button>`;
  $("again").onclick = () => location.reload();
};

addEventListener("keydown", (e) => {
  if (e.key === "Escape") $("dialog").classList.remove("open");
  if (e.key === "ArrowDown" || e.key === "PageDown") go(Math.min(1, world.p + 0.12));
  if (e.key === "ArrowUp" || e.key === "PageUp") go(Math.max(0, world.p - 0.12));
});

addEventListener("pointermove", (e) => {
  world.mx = (e.clientX / innerWidth) * 2 - 1;
  world.my = (e.clientY / innerHeight) * 2 - 1;
});

// ——— Three.js scene ———
const canvas = $("c");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.setClearColor(0x07080c, 1);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, innerWidth / innerHeight, 0.1, 80);
camera.position.set(0, 0, 6.2);

const clock = new THREE.Clock();

// Particles
const COUNT = 4200;
const pos = new Float32Array(COUNT * 3);
const phase = new Float32Array(COUNT);
const size = new Float32Array(COUNT);
for (let i = 0; i < COUNT; i++) {
  const i3 = i * 3;
  const r = 0.4 + Math.random() * 4.8;
  const th = Math.random() * Math.PI * 2;
  const ph = (Math.random() - 0.5) * Math.PI;
  pos[i3] = r * Math.cos(th) * Math.cos(ph);
  pos[i3 + 1] = r * Math.sin(ph) * 0.7;
  pos[i3 + 2] = r * Math.sin(th) * Math.cos(ph);
  phase[i] = Math.random() * Math.PI * 2;
  size[i] = 0.6 + Math.random() * 1.8;
}
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
pGeo.setAttribute("aPhase", new THREE.BufferAttribute(phase, 1));
pGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));

const pMat = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPixelRatio: { value: Math.min(devicePixelRatio, 2) }
  },
  vertexShader: `
    attribute float aPhase;
    attribute float aSize;
    uniform float uTime;
    uniform float uProgress;
    uniform float uPixelRatio;
    varying float vAlpha;
    varying vec3 vCol;
    void main() {
      vec3 p = position;
      float t = uTime * 0.35 + aPhase;
      float intro = smoothstep(0.0, 0.18, uProgress);
      float burst = smoothstep(0.12, 0.32, uProgress) * (1.0 - smoothstep(0.38, 0.55, uProgress));
      float gallery = smoothstep(0.4, 0.55, uProgress) * (1.0 - smoothstep(0.7, 0.82, uProgress));
      float lab = smoothstep(0.7, 0.85, uProgress);
      float outro = smoothstep(0.9, 1.0, uProgress);

      // soft swirl
      float ang = t * 0.4 + p.y * 0.3;
      p.xz = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * p.xz;

      // intro expand
      p *= mix(0.15, 1.0, intro);

      // burst outward
      p += normalize(p + 0.001) * burst * 2.4 * (0.5 + 0.5 * sin(aPhase * 3.0));

      // gallery — settle into vertical ribbons
      float ribbon = sin(p.x * 1.8 + t) * 0.35 * gallery;
      p.y += ribbon;
      p.x *= mix(1.0, 0.55, gallery);

      // lab — collapse toward center heart-ish
      float heart = lab * (1.0 - length(p.xz) * 0.18);
      p *= mix(1.0, 0.35 + heart * 0.4, lab);
      p.y += lab * 0.6 * sin(aPhase + t * 2.0);

      // outro drift
      p.y += outro * 1.8 * (aPhase - 1.5);
      p.x += outro * sin(aPhase) * 0.8;

      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      float s = aSize * (1.0 + burst * 1.4) * (1.0 - outro * 0.5);
      gl_PointSize = s * uPixelRatio * (180.0 / -mv.z);
      vAlpha = (0.35 + 0.45 * intro) * (1.0 - outro * 0.7) * (0.55 + 0.45 * gallery + 0.3 * lab);
      vCol = mix(vec3(0.9, 0.75, 0.45), vec3(1.0, 0.35, 0.65), aPhase / 6.28);
      vCol = mix(vCol, vec3(0.7, 0.85, 1.0), lab * 0.5);
    }
  `,
  fragmentShader: `
    varying float vAlpha;
    varying vec3 vCol;
    void main() {
      vec2 uv = gl_PointCoord - 0.5;
      float d = length(uv);
      if (d > 0.5) discard;
      float soft = 1.0 - smoothstep(0.15, 0.5, d);
      gl_FragColor = vec4(vCol, vAlpha * soft);
    }
  `
});
const particles = new THREE.Points(pGeo, pMat);
scene.add(particles);

// Infinity / figure-8 loop
const loopPts = [];
for (let i = 0; i <= 240; i++) {
  const t = (i / 240) * Math.PI * 2;
  const scale = 1.65;
  const x = scale * Math.sin(t);
  const y = scale * Math.sin(t) * Math.cos(t) * 0.55;
  const z = scale * Math.cos(t) * 0.35;
  loopPts.push(new THREE.Vector3(x, y, z));
}
const loopGeo = new THREE.BufferGeometry().setFromPoints(loopPts);
const loopMat = new THREE.LineBasicMaterial({ color: 0xe7c27a, transparent: true, opacity: 0.55 });
const loop = new THREE.Line(loopGeo, loopMat);
scene.add(loop);

// Holographic glass cards
const cardGroup = new THREE.Group();
scene.add(cardGroup);
const cardMats = [];
const cardMeshes = [];
const CARD_COUNT = 5;

function makeCard(variant) {
  const geo = new THREE.PlaneGeometry(1.4, 1.9, 1, 1);
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uActive: { value: 0 },
      uVariant: { value: variant }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uActive;
      uniform float uVariant;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        float a = hash(i); float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0)); float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
      }
      float fbm(vec2 p) {
        float v = 0.0; float a = 0.5;
        for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
        return v;
      }
      // rounded rect SDF
      float sdRoundBox(vec2 p, vec2 b, float r) {
        vec2 q = abs(p) - b + r;
        return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
      }
      void main() {
        vec2 uv = vUv;
        vec2 p = (uv - 0.5) * 2.0;
        float d = sdRoundBox(p, vec2(0.92, 0.94), 0.12);
        if (d > 0.02) discard;
        float edge = 1.0 - smoothstep(-0.02, 0.02, d);
        float n = fbm(uv * 4.0 + uTime * 0.15 + uVariant);
        float n2 = fbm(uv * 7.0 - uTime * 0.1);
        vec3 colA = vec3(0.15, 0.12, 0.2);
        vec3 colB = mix(vec3(0.9, 0.7, 0.4), vec3(1.0, 0.3, 0.6), uVariant * 0.25);
        vec3 col = mix(colA, colB, n * 0.55 + 0.2);
        col += vec3(0.2, 0.35, 0.55) * n2 * 0.35;
        // scanlines + holographic sheen
        float scan = 0.92 + 0.08 * sin(uv.y * 90.0 + uTime * 3.0);
        float sheen = pow(1.0 - abs(p.x * 0.7 + p.y * 0.3), 3.0) * (0.35 + 0.4 * uActive);
        col *= scan;
        col += sheen * vec3(0.95, 0.85, 0.7);
        float alpha = edge * (0.55 + 0.35 * uActive + 0.15 * n);
        // dark backing so text overlay reads
        float back = smoothstep(0.5, -0.1, d) * 0.45;
        col = mix(col, vec3(0.04, 0.05, 0.08), back);
        gl_FragColor = vec4(col, alpha);
      }
    `
  });
  const mesh = new THREE.Mesh(geo, mat);
  cardMats.push(mat);
  cardMeshes.push(mesh);
  cardGroup.add(mesh);
  return mesh;
}

for (let i = 0; i < CARD_COUNT; i++) makeCard(i * 0.22);

// Lab specimen — transmission-like cylinder + heart points
const labGroup = new THREE.Group();
scene.add(labGroup);
const cylGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.8, 48, 1, true);
const cylMat = new THREE.MeshPhysicalMaterial({
  color: 0x88aacc,
  metalness: 0.05,
  roughness: 0.12,
  transmission: 0.85,
  thickness: 0.6,
  transparent: true,
  opacity: 0.55,
  side: THREE.DoubleSide
});
const cyl = new THREE.Mesh(cylGeo, cylMat);
labGroup.add(cyl);

const heartCount = 900;
const hPos = new Float32Array(heartCount * 3);
for (let i = 0; i < heartCount; i++) {
  const t = Math.random() * Math.PI * 2;
  const u = Math.random();
  // parametric heart
  const x = 16 * Math.pow(Math.sin(t), 3);
  const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
  const s = 0.028 * (0.7 + 0.3 * u);
  hPos[i * 3] = x * s + (Math.random() - 0.5) * 0.08;
  hPos[i * 3 + 1] = y * s + (Math.random() - 0.5) * 0.08;
  hPos[i * 3 + 2] = (Math.random() - 0.5) * 0.25;
}
const hGeo = new THREE.BufferGeometry();
hGeo.setAttribute("position", new THREE.BufferAttribute(hPos, 3));
const hMat = new THREE.PointsMaterial({ color: 0xff4d9a, size: 0.035, transparent: true, opacity: 0.85, depthWrite: false, blending: THREE.AdditiveBlending });
const heart = new THREE.Points(hGeo, hMat);
labGroup.add(heart);

// soft floor grid for lab
const floorGeo = new THREE.PlaneGeometry(8, 8, 28, 28);
const floorMat = new THREE.MeshBasicMaterial({ color: 0x1a1c24, transparent: true, opacity: 0.35, wireframe: true });
const floor = new THREE.Mesh(floorGeo, floorMat);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.15;
labGroup.add(floor);

// ambient + key lights
scene.add(new THREE.AmbientLight(0x334455, 0.55));
const key = new THREE.DirectionalLight(0xffe0b0, 1.1);
key.position.set(3, 4, 5);
scene.add(key);
const rim = new THREE.DirectionalLight(0x88aaff, 0.45);
rim.position.set(-4, 1, -3);
scene.add(rim);

// scroll progress
function updateProgress() {
  const max = document.documentElement.scrollHeight - innerHeight;
  world.target = max > 0 ? scrollY / max : 0;
  world.p += (world.target - world.p) * 0.08;
}

function frame() {
  requestAnimationFrame(frame);
  updateProgress();
  const t = clock.getElapsedTime();
  const p = world.p;
  world.sx += (world.mx - world.sx) * 0.06;
  world.sy += (world.my - world.sy) * 0.06;

  pMat.uniforms.uTime.value = t;
  pMat.uniforms.uProgress.value = p;

  // loop opacity + rotation
  loop.rotation.y = t * 0.12;
  loop.rotation.x = Math.sin(t * 0.2) * 0.15;
  loopMat.opacity = 0.25 + 0.45 * fade(p, 0.08, 0.2, 0.35, 0.5);

  // cards layout
  const { list, index, local } = focusAt(p);
  const workOn = fade(p, 0.38, 0.48, 0.72, 0.82);
  cardGroup.visible = workOn > 0.01;
  cardGroup.position.z = -0.4;
  for (let i = 0; i < CARD_COUNT; i++) {
    const mesh = cardMeshes[i];
    const mat = cardMats[i];
    const proj = list[i] || PROJECTS[i % PROJECTS.length];
    const offset = (i - index) - (local - 0.5) * 0.4;
    const targetX = offset * 1.75;
    const targetY = Math.sin(offset * 0.8) * 0.25;
    const targetZ = -Math.abs(offset) * 0.55;
    const targetRot = offset * 0.22;
    mesh.position.x += (targetX - mesh.position.x) * 0.1;
    mesh.position.y += (targetY - mesh.position.y) * 0.1;
    mesh.position.z += (targetZ - mesh.position.z) * 0.1;
    mesh.rotation.y += (targetRot - mesh.rotation.y) * 0.1;
    mesh.rotation.x = world.sy * 0.08;
    mesh.scale.setScalar(0.85 + (i === index ? 0.22 : 0) * workOn);
    mat.uniforms.uTime.value = t;
    mat.uniforms.uActive.value = (i === index ? 1 : 0.25) * workOn;
    mesh.visible = i < list.length;
  }

  // lab
  const labOn = fade(p, 0.68, 0.8, 0.92, 1.0);
  labGroup.visible = labOn > 0.01;
  labGroup.position.set(0, -0.2, 0);
  labGroup.rotation.y = t * 0.25;
  cyl.material.opacity = 0.25 + labOn * 0.4;
  heart.rotation.y = -t * 0.4;
  heart.material.opacity = 0.4 + labOn * 0.5;
  floor.material.opacity = 0.12 + labOn * 0.25;

  // camera path
  const zTarget = 6.2 - p * 1.8 + Math.sin(p * Math.PI) * 0.4;
  camera.position.z += (zTarget - camera.position.z) * 0.06;
  camera.position.x += (world.sx * 0.55 - camera.position.x) * 0.06;
  camera.lookAt(world.sx * 0.15, 0, 0);

  const chapter =
    p < 0.16 ? "intro" : p < 0.4 ? "manifesto" : p < 0.72 ? "work" : p < 0.9 ? "lab" : "contact";

  $("hero").style.opacity = String(fade(p, 0, 0.02, 0.16, 0.3));
  $("manifesto").style.opacity = String(fade(p, 0.14, 0.24, 0.4, 0.5));
  $("work").style.opacity = String(fade(p, 0.4, 0.5, 0.7, 0.8));
  $("finder").style.opacity = String(fade(p, 0.4, 0.5, 0.7, 0.8));
  $("lab-copy").style.opacity = String(fade(p, 0.72, 0.82, 0.9, 0.96));
  $("contact").style.opacity = String(fade(p, 0.9, 0.96, 1.2, 1.3));

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
addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
frame();
