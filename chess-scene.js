import * as THREE from 'three';

const SQ = 0.055, FRAME = 0.034, SLAB = 0.028;
const BOARD_W = SQ * 8 + FRAME * 2;

const M = {
  walnut: new THREE.MeshStandardMaterial({ name: 'walnut', color: 0x5b3820, roughness: 0.42, metalness: 0.0 }),
  walnutDark: new THREE.MeshStandardMaterial({ name: 'walnut_dark', color: 0x3f2413, roughness: 0.38 }),
  oak: new THREE.MeshStandardMaterial({ name: 'oak', color: 0xd8bd8c, roughness: 0.5 }),
  ivory: new THREE.MeshPhysicalMaterial({ name: 'ivory_lacquer', color: 0xf1e6d2, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.08 }),
  ebony: new THREE.MeshPhysicalMaterial({ name: 'black_lacquer', color: 0x14110f, roughness: 0.13, clearcoat: 1, clearcoatRoughness: 0.06 }),
  brass: new THREE.MeshStandardMaterial({ name: 'brass', color: 0xc67139, roughness: 0.3, metalness: 0.85 })
};

function lathe(profile, mat, name, seg = 48) {
  const pts = profile.map(([x, y]) => new THREE.Vector2(Math.max(x, 0.0004), y));
  const g = new THREE.LatheGeometry(pts, seg);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.name = name; m.castShadow = true; m.receiveShadow = true;
  return m;
}

// profiles: [radius, height] from base upward, in metres
const PROFILES = {
  pawn: [[0.0, 0], [0.014, 0], [0.0145, 0.004], [0.011, 0.009], [0.0075, 0.016], [0.0072, 0.026], [0.0105, 0.030], [0.0072, 0.033], [0.0062, 0.036], [0.010, 0.043], [0.0075, 0.050], [0.0, 0.053]],
  rook: [[0.0, 0], [0.0165, 0], [0.017, 0.005], [0.012, 0.011], [0.0105, 0.030], [0.0125, 0.042], [0.0175, 0.046], [0.0175, 0.056], [0.0135, 0.056], [0.0135, 0.050], [0.0, 0.050]],
  bishop: [[0.0, 0], [0.0165, 0], [0.017, 0.005], [0.0115, 0.012], [0.0082, 0.030], [0.0078, 0.046], [0.0135, 0.052], [0.0105, 0.058], [0.0092, 0.062], [0.0115, 0.068], [0.0085, 0.076], [0.004, 0.080], [0.0045, 0.084], [0.0, 0.088]],
  queen: [[0.0, 0], [0.019, 0], [0.0195, 0.006], [0.013, 0.013], [0.0092, 0.036], [0.0088, 0.056], [0.0165, 0.064], [0.0155, 0.072], [0.0175, 0.086], [0.0125, 0.086], [0.0125, 0.090], [0.0055, 0.094], [0.0075, 0.100], [0.0, 0.104]],
  king: [[0.0, 0], [0.020, 0], [0.0205, 0.006], [0.0135, 0.014], [0.0095, 0.040], [0.009, 0.062], [0.017, 0.070], [0.016, 0.080], [0.0185, 0.096], [0.013, 0.096], [0.0125, 0.102], [0.006, 0.106], [0.0, 0.107]],
  knightBase: [[0.0, 0], [0.0165, 0], [0.017, 0.005], [0.0125, 0.012], [0.011, 0.028], [0.0125, 0.034], [0.0, 0.036]]
};

function makePiece(type, mat) {
  const g = new THREE.Group();
  g.name = type;
  if (type === 'knight') {
    g.add(lathe(PROFILES.knightBase, mat, 'knight_base'));
    const neck = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.030, 0.020), mat);
    neck.name = 'knight_neck'; neck.position.set(0, 0.048, -0.001); neck.rotation.x = 0.22;
    neck.castShadow = true;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.014, 0.030), mat);
    head.name = 'knight_head'; head.position.set(0, 0.062, 0.006); head.rotation.x = -0.15;
    head.castShadow = true;
    const mane = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.026, 0.010), mat);
    mane.name = 'knight_mane'; mane.position.set(0, 0.058, -0.012); mane.rotation.x = 0.35;
    mane.castShadow = true;
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.010, 12), mat);
    ear.name = 'knight_ear'; ear.position.set(0, 0.072, -0.002);
    ear.castShadow = true;
    g.add(neck, head, mane, ear);
  } else if (type === 'king') {
    g.add(lathe(PROFILES.king, mat, 'king_body'));
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.0035, 0.0035), mat);
    bar.name = 'king_cross_bar'; bar.position.y = 0.118; bar.castShadow = true;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.0035, 0.022, 0.0035), mat);
    post.name = 'king_cross_post'; post.position.y = 0.117; post.castShadow = true;
    g.add(bar, post);
  } else {
    g.add(lathe(PROFILES[type], mat, type + '_body'));
    if (type === 'queen') {
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 24, 16), mat);
      orb.name = 'queen_orb'; orb.position.y = 0.108; orb.castShadow = true;
      g.add(orb);
    }
  }
  return g;
}

function buildBoard() {
  const board = new THREE.Group();
  board.name = 'board';
  const slab = new THREE.Mesh(new THREE.BoxGeometry(BOARD_W, SLAB, BOARD_W), M.walnut);
  slab.name = 'board_frame'; slab.castShadow = true; slab.receiveShadow = true;
  slab.position.y = SLAB / 2;
  board.add(slab);

  const inlay = new THREE.Mesh(new THREE.BoxGeometry(SQ * 8 + 0.008, 0.002, SQ * 8 + 0.008), M.brass);
  inlay.name = 'brass_inlay'; inlay.position.y = SLAB + 0.0005; inlay.receiveShadow = true;
  board.add(inlay);

  const tiles = new THREE.Group(); tiles.name = 'squares';
  const tileGeo = new THREE.BoxGeometry(SQ, 0.003, SQ);
  for (let f = 0; f < 8; f++) {
    for (let r = 0; r < 8; r++) {
      const dark = (f + r) % 2 === 0;
      const t = new THREE.Mesh(tileGeo, dark ? M.walnutDark : M.oak);
      t.name = (dark ? 'square_dark_' : 'square_light_') + f + r;
      t.position.set((f - 3.5) * SQ, SLAB + 0.0025, (r - 3.5) * SQ);
      t.receiveShadow = true;
      tiles.add(t);
    }
  }
  board.add(tiles);
  return board;
}

const CAST = [
  { type: 'rook', side: 'w', f: 0, r: 0 },
  { type: 'knight', side: 'w', f: 1, r: 0 },
  { type: 'bishop', side: 'w', f: 2, r: 0 },
  { type: 'queen', side: 'w', f: 3, r: 0 },
  { type: 'king', side: 'w', f: 4, r: 0 },
  { type: 'pawn', side: 'w', f: 4, r: 3 },
  { type: 'pawn', side: 'b', f: 4, r: 4 },
  { type: 'queen', side: 'b', f: 3, r: 7 },
  { type: 'king', side: 'b', f: 4, r: 7 }
];

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const easeInOut = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);

class ChessScene extends HTMLElement {
  connectedCallback() {
    if (this._init) return;
    this._init = true;
    this.style.display = 'block';
    this.style.width = '100%';
    this.style.height = '100%';

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.domElement.style.cssText = 'width:100%;height:100%;display:block';
    this.appendChild(renderer.domElement);
    this.renderer = renderer;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 20);
    scene.add(camera);

    scene.add(new THREE.HemisphereLight(0xfff3e2, 0x8a7a63, 1.15));
    const key = new THREE.DirectionalLight(0xfff6ea, 2.1);
    key.position.set(0.45, 0.85, 0.4);
    key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048);
    const c = key.shadow.camera;
    c.left = -0.45; c.right = 0.45; c.top = 0.45; c.bottom = -0.45; c.near = 0.1; c.far = 3;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffd9b0, 0.8);
    rim.position.set(-0.6, 0.35, -0.5);
    scene.add(rim);

    const ground = new THREE.Mesh(new THREE.PlaneGeometry(3, 3), new THREE.ShadowMaterial({ opacity: 0.22 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const root = new THREE.Group();
    root.name = 'mason64_set';
    root.add(buildBoard());
    scene.add(root);

    this.pieces = CAST.map((p, i) => {
      const g = makePiece(p.type, p.side === 'w' ? M.ivory : M.ebony);
      g.name = `${p.side}_${p.type}_${p.f}${p.r}`;
      g.position.set((p.f - 3.5) * SQ, SLAB + 0.004, (p.r - 3.5) * SQ);
      if (p.side === 'b') g.rotation.y = Math.PI;
      root.add(g);
      return { g, start: 0.16 + i * 0.072, baseY: SLAB + 0.004 };
    });

    this.scene = scene; this.camera = camera;
    this.track = this.closest('[data-scroll-track]');
    this.p = 0; this.pTarget = 0;

    const onScroll = () => {
      const t = this.track;
      if (!t) { this.pTarget = 0; return; }
      const r = t.getBoundingClientRect();
      const span = Math.max(1, r.height - innerHeight);
      this.pTarget = clamp(-r.top / span, 0, 1);
    };
    this._onScroll = onScroll;
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll);
    onScroll();
    this.p = this.pTarget;

    const ro = new ResizeObserver(() => this.resize());
    ro.observe(this);
    this._ro = ro;
    this.resize();

    let raf;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      this.frame();
    };
    loop();
    this._stop = () => { cancelAnimationFrame(raf); ro.disconnect(); removeEventListener('scroll', onScroll); removeEventListener('resize', onScroll); };
  }

  disconnectedCallback() { this._stop && this._stop(); }

  resize() {
    const w = this.clientWidth || 800, h = this.clientHeight || 600;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  frame() {
    const t = performance.now() / 1000;
    this.p += (this.pTarget - this.p) * 0.09;
    const p = this.p;
    const e = easeInOut(p);

    const elev = THREE.MathUtils.lerp(87, 24, e) * Math.PI / 180;
    const azim = (-28 + e * 66) * Math.PI / 180 + t * 0.05;
    const rad = THREE.MathUtils.lerp(1.46, 1.02, e);
    const wide = this.clientWidth > 900;
    const shift = wide ? THREE.MathUtils.lerp(0.30, 0.09, e) : 0;
    const cam = this.camera;
    cam.position.set(
      rad * Math.cos(elev) * Math.sin(azim),
      rad * Math.sin(elev) + 0.02,
      rad * Math.cos(elev) * Math.cos(azim)
    );
    cam.lookAt(0, THREE.MathUtils.lerp(0.01, 0.05, e), 0);
    const right = new THREE.Vector3().crossVectors(cam.getWorldDirection(new THREE.Vector3()), cam.up).normalize();
    cam.position.addScaledVector(right, -shift);

    for (const pc of this.pieces) {
      const k = clamp((p - pc.start) / 0.14, 0, 1);
      const s = easeOut(k);
      pc.g.visible = k > 0.001;
      pc.g.position.y = pc.baseY + (1 - s) * 0.34;
      pc.g.scale.setScalar(0.6 + 0.4 * s);
      pc.g.rotation.x = (1 - s) * 0.5;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

customElements.define('chess-scene', ChessScene);
