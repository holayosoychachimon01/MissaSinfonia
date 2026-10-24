/* =========================================================
   MOTOR DE JUEGOS POR BLOQUES (estilo Scratch)
   - Editor: Blockly (bloques en español)
   - Escenario: canvas de 480x360, centro (0,0), y hacia arriba
   - Proyecto: { titulo, vars:[nombres], sprites:[{name,img,x,y,size,ws}] }
   ========================================================= */

/* ---------- Catálogo de imágenes y teclas ---------- */
const CATALOGO = [
  ["🦈 Tiburón", "e:🦈"], ["🪙 Moneda", "e:🪙"], ["👾 Alien", "e:👾"], ["⭐ Estrella", "e:⭐"],
  ["🚀 Cohete", "e:🚀"], ["💣 Bomba", "e:💣"], ["🍎 Manzana", "e:🍎"],
  ["Missa", "i:missa-no-sinfonia.png"], ["Missa sin sistema", "i:no hay sistema missa.png"],
  ["Rosa", "i:r0sa de guadalupe.jpg"], ["Perfil", "i:OIP.webp"]
];
const IMG_VALIDAS = CATALOGO.map(c => c[1]);
const TECLAS = [["espacio", " "], ["flecha izquierda", "arrowleft"], ["flecha derecha", "arrowright"],
  ["flecha arriba", "arrowup"], ["flecha abajo", "arrowdown"], ["a", "a"], ["d", "d"], ["w", "w"],
  ["s", "s"], ["e", "e"], ["q", "q"], ["z", "z"], ["x", "x"]];
const SONIDOS = [["missasinfonia", "missasinfonia.mp3"], ["misanosinfonia", "misanosinfonia.mp3"],
  ["soy un tiburón", "soy_un_tiburon.mp3"]];

let NOMBRES = []; // nombres de los objetos del proyecto (para el bloque "tocando")

/* ---------- Definición de bloques ---------- */
const C = { ev: "#FFBF00", mov: "#4C97FF", look: "#9966FF", snd: "#CF63CF", ctl: "#FFAB19", sen: "#5CB1D6", op: "#59C059", vr: "#FF8C1A" };
Blockly.Extensions.register("gorro", function () { this.hat = "cap"; });

const nIn = n => ({ type: "input_value", name: n, check: "Number" });
const aIn = n => ({ type: "input_value", name: n });
const dd = (name, options) => ({ type: "field_dropdown", name, options });
const txt = (name, v) => ({ type: "field_input", name, text: v });
const bl = (type, message0, colour, args0, extra) =>
  Object.assign({ type, message0, args0: args0 || [], colour, inputsInline: true }, extra);
const pila = { previousStatement: null, nextStatement: null };
const num = { output: "Number" };

Blockly.defineBlocksWithJsonArray([
  bl("ev_flag", "al hacer clic en 🏁", C.ev, [], { nextStatement: null, extensions: ["gorro"] }),
  bl("ev_key", "al presionar tecla %1", C.ev, [dd("KEY", TECLAS)], { nextStatement: null, extensions: ["gorro"] }),
  bl("ev_click", "al hacer clic en este objeto", C.ev, [], { nextStatement: null, extensions: ["gorro"] }),
  bl("ev_msg", "al recibir mensaje %1", C.ev, [txt("MSG", "mensaje1")], { nextStatement: null, extensions: ["gorro"] }),
  bl("ev_send", "enviar mensaje %1", C.ev, [txt("MSG", "mensaje1")], pila),

  bl("mv_mover", "mover %1 pasos", C.mov, [nIn("N")], pila),
  bl("mv_der", "girar ↻ %1 grados", C.mov, [nIn("N")], pila),
  bl("mv_izq", "girar ↺ %1 grados", C.mov, [nIn("N")], pila),
  bl("mv_ir", "ir a x: %1 y: %2", C.mov, [nIn("X"), nIn("Y")], pila),
  bl("mv_azar", "ir a posición aleatoria", C.mov, [], pila),
  bl("mv_dir", "apuntar en dirección %1", C.mov, [nIn("N")], pila),
  bl("mv_cx", "cambiar x en %1", C.mov, [nIn("N")], pila),
  bl("mv_cy", "cambiar y en %1", C.mov, [nIn("N")], pila),
  bl("mv_fx", "fijar x a %1", C.mov, [nIn("N")], pila),
  bl("mv_fy", "fijar y a %1", C.mov, [nIn("N")], pila),
  bl("mv_reb", "rebotar si toca el borde", C.mov, [], pila),
  bl("mv_x", "posición x", C.mov, [], num),
  bl("mv_y", "posición y", C.mov, [], num),
  bl("mv_dirv", "dirección", C.mov, [], num),

  bl("lk_decir", "decir %1", C.look, [aIn("T")], pila),
  bl("lk_decirpor", "decir %1 por %2 segundos", C.look, [aIn("T"), nIn("S")], pila),
  bl("lk_tam", "fijar tamaño a %1 %", C.look, [nIn("N")], pila),
  bl("lk_ctam", "cambiar tamaño en %1", C.look, [nIn("N")], pila),
  bl("lk_mostrar", "mostrar", C.look, [], pila),
  bl("lk_esconder", "esconder", C.look, [], pila),
  bl("lk_img", "cambiar imagen a %1", C.look, [dd("IMG", CATALOGO)], pila),
  bl("lk_fondo", "fijar color de fondo %1", C.look, [{ type: "field_colour", name: "COLOR", colour: "#ffffff" }], pila),
  bl("sn_play", "reproducir sonido %1", C.snd, [dd("SND", SONIDOS)], pila),

  bl("ct_espera", "esperar %1 segundos", C.ctl, [nIn("S")], pila),
  bl("ct_siempre", "por siempre", C.ctl, [], { message1: "%1", args1: [{ type: "input_statement", name: "DO" }], previousStatement: null }),
  bl("ct_fin", "terminar juego: %1", C.ctl, [txt("MSG", "¡Fin del juego!")], pila),

  bl("se_tecla", "¿tecla %1 presionada?", C.sen, [dd("KEY", TECLAS)], { output: "Boolean" }),
  bl("se_mx", "x del mouse", C.sen, [], num),
  bl("se_my", "y del mouse", C.sen, [], num),
  bl("se_mclick", "¿mouse presionado?", C.sen, [], { output: "Boolean" }),
  bl("se_tiempo", "temporizador", C.sen, [], num)
]);

Blockly.Blocks["se_toca"] = {
  init: function () {
    this.appendDummyInput().appendField("¿tocando")
      .appendField(new Blockly.FieldDropdown(() => [["borde", "borde"], ...NOMBRES.map(n => [n, n])]), "OBJ")
      .appendField("?");
    this.setOutput(true, "Boolean");
    this.setColour(C.sen);
  }
};

/* ---------- Caja de herramientas ---------- */
const sh = (type, fields) => ({ shadow: { type, fields } });
const n = v => sh("math_number", { NUM: v });
const t = v => sh("text", { TEXT: v });
const b = (type, inputs, extra) => Object.assign({ kind: "block", type }, inputs ? { inputs } : {}, extra);
const cat = (name, colour, contents) => ({ kind: "category", name, colour, contents });

const TOOLBOX = {
  kind: "categoryToolbox",
  contents: [
    cat("Eventos", C.ev, [b("ev_flag"), b("ev_key"), b("ev_click"), b("ev_msg"), b("ev_send")]),
    cat("Movimiento", C.mov, [b("mv_mover", { N: n(10) }), b("mv_der", { N: n(15) }), b("mv_izq", { N: n(15) }),
      b("mv_ir", { X: n(0), Y: n(0) }), b("mv_azar"), b("mv_dir", { N: n(90) }), b("mv_cx", { N: n(10) }),
      b("mv_cy", { N: n(10) }), b("mv_fx", { N: n(0) }), b("mv_fy", { N: n(0) }), b("mv_reb"),
      b("mv_x"), b("mv_y"), b("mv_dirv")]),
    cat("Apariencia", C.look, [b("lk_decir", { T: t("¡Hola!") }), b("lk_decirpor", { T: t("¡Hola!"), S: n(2) }),
      b("lk_tam", { N: n(100) }), b("lk_ctam", { N: n(10) }), b("lk_mostrar"), b("lk_esconder"),
      b("lk_img"), b("lk_fondo")]),
    cat("Sonido", C.snd, [b("sn_play")]),
    cat("Control", C.ctl, [b("ct_espera", { S: n(1) }), b("ct_siempre"), b("controls_repeat_ext", { TIMES: n(10) }),
      b("controls_if"), b("controls_if", null, { extraState: { hasElse: true } }),
      b("controls_whileUntil", null, { fields: { MODE: "UNTIL" } }), b("ct_fin")]),
    cat("Sensores", C.sen, [b("se_toca"), b("se_tecla"), b("se_mx"), b("se_my"), b("se_mclick"), b("se_tiempo")]),
    cat("Operadores", C.op, [b("math_number"), b("math_arithmetic", { A: n(1), B: n(1) }),
      b("math_modulo", { DIVIDEND: n(10), DIVISOR: n(3) }), b("math_random_int", { FROM: n(1), TO: n(10) }),
      b("logic_compare", { A: n(0), B: n(0) }), b("logic_operation"), b("logic_negate"), b("logic_boolean"),
      b("text"), b("text_join", null, { extraState: { itemCount: 2 } })]),
    { kind: "category", name: "Variables", colour: C.vr, custom: "VARIABLE" }
  ]
};

const TEMA = Blockly.Theme.defineTheme("missa", {
  base: Blockly.Themes.Zelos,
  blockStyles: {
    loop_blocks: { colourPrimary: C.ctl }, logic_blocks: { colourPrimary: C.ctl },
    math_blocks: { colourPrimary: C.op }, text_blocks: { colourPrimary: C.op },
    variable_blocks: { colourPrimary: C.vr }
  }
});

/* ---------- Generador de código ---------- */
const gen = javascript.javascriptGenerator;
const O = javascript.Order;
const F = gen.forBlock;
gen.INFINITE_LOOP_TRAP = "await G.tick();\n"; // todo bucle cede un fotograma: el juego nunca se congela
gen.addReservedWords("G,S");

const val = (blk, name, def) => gen.valueToCode(blk, name, O.NONE) || def;
const S1 = (type, metodo) => { F[type] = blk => `S.${metodo}(${val(blk, "N", 0)});\n`; };
S1("mv_mover", "mover"); S1("mv_der", "girar"); S1("mv_dir", "apuntar"); S1("mv_cx", "cx"); S1("mv_cy", "cy");
S1("mv_fx", "fx"); S1("mv_fy", "fy"); S1("lk_tam", "tam"); S1("lk_ctam", "ctam");
F.mv_izq = blk => `S.girar(-(${val(blk, "N", 0)}));\n`;
F.mv_ir = blk => `S.ir(${val(blk, "X", 0)}, ${val(blk, "Y", 0)});\n`;
F.mv_azar = () => "S.irAzar();\n";
F.mv_reb = () => "S.rebotar();\n";
F.lk_decir = blk => `S.decir(${val(blk, "T", "''")});\n`;
F.lk_decirpor = blk => `await S.decirPor(${val(blk, "T", "''")}, ${val(blk, "S", 1)});\n`;
F.lk_mostrar = () => "S.visible = true;\n";
F.lk_esconder = () => "S.visible = false;\n";
F.lk_img = blk => `S.img = ${gen.quote_(blk.getFieldValue("IMG"))};\n`;
F.lk_fondo = blk => `G.fondo = ${gen.quote_(blk.getFieldValue("COLOR"))};\n`;
F.sn_play = blk => `G.sonido(${gen.quote_(blk.getFieldValue("SND"))});\n`;
F.ct_espera = blk => `await G.esperar(${val(blk, "S", 1)});\n`;
F.ct_siempre = blk => `while (true) {\n${gen.addLoopTrap(gen.statementToCode(blk, "DO"), blk)}}\n`;
F.ct_fin = blk => `G.terminar(${gen.quote_(blk.getFieldValue("MSG"))});\n`;
F.ev_send = blk => `G.enviar(${gen.quote_(blk.getFieldValue("MSG"))});\n`;

const R = (type, codigo) => { F[type] = blk => [typeof codigo === "function" ? codigo(blk) : codigo, O.FUNCTION_CALL]; };
R("mv_x", "S.x"); R("mv_y", "S.y"); R("mv_dirv", "S.dir"); R("se_mx", "G.mx"); R("se_my", "G.my");
R("se_mclick", "G.mdown"); R("se_tiempo", "G.tiempo()");
R("se_toca", blk => `S.toca(${gen.quote_(blk.getFieldValue("OBJ"))})`);
R("se_tecla", blk => `G.tecla(${gen.quote_(blk.getFieldValue("KEY"))})`);

// Las variables son globales entre todos los objetos: viven en G.vars
const vn = blk => JSON.stringify(blk.getField("VAR").getText());
F.variables_get = blk => [`G.v(${vn(blk)})`, O.FUNCTION_CALL];
F.variables_set = blk => `G.setv(${vn(blk)}, ${val(blk, "VALUE", 0)});\n`;
F.math_change = blk => `G.setv(${vn(blk)}, G.v(${vn(blk)}) + (Number(${val(blk, "DELTA", 0)}) || 0));\n`;

const HATS = {
  ev_flag: () => ["flag", null],
  ev_key: blk => ["key", blk.getFieldValue("KEY")],
  ev_click: () => ["click", null],
  ev_msg: blk => ["msg", blk.getFieldValue("MSG")]
};

// Convierte el proyecto en JavaScript. Solo se generan los scripts que empiezan con un bloque de evento.
function compilar(proyecto) {
  NOMBRES = proyecto.sprites.map(s => s.name);
  let codigo = "";
  proyecto.sprites.forEach((s, i) => {
    const ws = new Blockly.Workspace();
    try {
      Blockly.serialization.workspaces.load(s.ws, ws);
      gen.init(ws);
      let cuerpo = "";
      ws.getTopBlocks(true).forEach(h => {
        if (!HATS[h.type]) return;
        const [tipo, arg] = HATS[h.type](h);
        const sig = h.getNextBlock();
        cuerpo += `G.hat(S, ${JSON.stringify(tipo)}, ${JSON.stringify(arg)}, async function () {\n${sig ? gen.blockToCode(sig) : ""}});\n`;
      });
      codigo += `(function (S) {\n${gen.finish(cuerpo)}\n})(G.sprites[${i}]);\n`;
    } finally {
      ws.dispose();
    }
  });
  return codigo;
}

/* ---------- Motor del escenario ---------- */
const ANCHO = 480, ALTO = 360;
const limitar = (v, mn, mx) => Math.max(mn, Math.min(mx, v));

class Actor {
  constructor(G, d) {
    this.G = G;
    this.name = String(d.name);
    this.img = IMG_VALIDAS.includes(d.img) ? d.img : IMG_VALIDAS[0];
    this.size = limitar(Number(d.size) || 100, 5, 500);
    this.dir = 90;
    this.visible = true;
    this.bubble = "";
    this.x = 0; this.y = 0;
    this.ir(d.x, d.y);
  }
  get w() { return 60 * this.size / 100; }
  ir(x, y) {
    const m = this.w / 2;
    this.x = limitar(Number(x) || 0, -ANCHO / 2 + m, ANCHO / 2 - m);
    this.y = limitar(Number(y) || 0, -ALTO / 2 + m, ALTO / 2 - m);
  }
  mover(p) { const r = this.dir * Math.PI / 180; this.ir(this.x + Number(p) * Math.sin(r), this.y + Number(p) * Math.cos(r)); }
  girar(g) { this.dir = (this.dir + (Number(g) || 0)) % 360; }
  apuntar(g) { this.dir = (Number(g) || 0) % 360; }
  cx(v) { this.ir(this.x + (Number(v) || 0), this.y); }
  cy(v) { this.ir(this.x, this.y + (Number(v) || 0)); }
  fx(v) { this.ir(v, this.y); }
  fy(v) { this.ir(this.x, v); }
  irAzar() { this.ir(Math.random() * ANCHO - ANCHO / 2, Math.random() * ALTO - ALTO / 2); }
  tam(v) { this.size = limitar(Number(v) || 100, 5, 500); }
  ctam(v) { this.tam(this.size + (Number(v) || 0)); }
  decir(txt) { this.bubble = String(txt); }
  async decirPor(txt, s) { this.decir(txt); await this.G.esperar(s); if (this.bubble === String(txt)) this.decir(""); }
  rebotar() {
    const m = this.w / 2;
    if (this.x <= -ANCHO / 2 + m || this.x >= ANCHO / 2 - m) this.dir = -this.dir;
    if (this.y <= -ALTO / 2 + m || this.y >= ALTO / 2 - m) this.dir = 180 - this.dir;
  }
  toca(otro) {
    if (!this.visible) return false;
    const m = this.w / 2;
    if (otro === "borde") return Math.abs(this.x) >= ANCHO / 2 - m - 1 || Math.abs(this.y) >= ALTO / 2 - m - 1;
    const a = this.G.sprites.find(s => s !== this && s.name === otro);
    if (!a || !a.visible) return false;
    const d = (this.w + a.w) * 0.4;
    return Math.abs(this.x - a.x) < d && Math.abs(this.y - a.y) < d;
  }
}

class Motor {
  constructor(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext("2d");
    this.imgs = {};
    this.keys = new Set();
    this.sprites = []; this.hats = []; this.vars = {}; this.waiters = [];
    this.running = false; this.fin = null; this.fondo = "#ffffff";
    this.mx = 0; this.my = 0; this.mdown = false; this.t0 = 0;
    canvas.tabIndex = 0;

    canvas.addEventListener("keydown", e => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
      if (e.repeat) return;
      this.keys.add(k);
      this.hats.filter(h => h.tipo === "key" && h.arg === k).forEach(h => this.lanzar(h));
    });
    canvas.addEventListener("keyup", e => this.keys.delete(e.key.toLowerCase()));
    canvas.addEventListener("blur", () => this.keys.clear());
    canvas.addEventListener("mousemove", e => this.puntero(e));
    canvas.addEventListener("mousedown", e => { this.puntero(e); this.mdown = true; });
    window.addEventListener("mouseup", () => { this.mdown = false; });
    canvas.addEventListener("click", e => {
      canvas.focus();
      this.puntero(e);
      const a = [...this.sprites].reverse().find(s => s.visible &&
        Math.abs(this.mx - s.x) < s.w / 2 && Math.abs(this.my - s.y) < s.w / 2);
      if (a) this.hats.filter(h => h.tipo === "click" && h.S === a).forEach(h => this.lanzar(h));
    });
    this.bucle();
  }

  puntero(e) {
    const r = this.cv.getBoundingClientRect();
    this.mx = Math.round((e.clientX - r.left) * ANCHO / r.width - ANCHO / 2);
    this.my = Math.round(ALTO / 2 - (e.clientY - r.top) * ALTO / r.height);
  }

  // ----- API que usan los bloques -----
  hat(S, tipo, arg, fn) { this.hats.push({ S, tipo, arg, fn, activo: false }); }
  tick() { return new Promise(r => { if (this.running) this.waiters.push(r); }); }
  async esperar(s) { const fin = performance.now() + (Number(s) || 0) * 1000; do { await this.tick(); } while (performance.now() < fin); }
  v(nombre) { return nombre in this.vars ? this.vars[nombre] : 0; }
  setv(nombre, x) { this.vars[nombre] = x; }
  tecla(k) { return this.keys.has(k); }
  tiempo() { return Math.round((performance.now() - this.t0) / 100) / 10; }
  sonido(f) { try { new Audio(f).play().catch(() => {}); } catch (e) { /* sin audio */ } }
  enviar(m) { this.hats.filter(h => h.tipo === "msg" && h.arg === m).forEach(h => this.lanzar(h)); }
  terminar(m) { this.fin = m; this.running = false; this.waiters = []; }

  // ----- ciclo de vida -----
  lanzar(h) {
    if (!this.running || h.activo) return;
    h.activo = true;
    h.fn().catch(err => console.error("Error en el juego:", err)).finally(() => { h.activo = false; });
  }

  iniciar(proyecto) {
    this.detener();
    this.sprites = proyecto.sprites.map(s => new Actor(this, s));
    this.hats = []; this.vars = {}; this.keys.clear();
    this.fin = null;
    this.fondo = /^#[0-9a-f]{6}$/i.test(proyecto.fondo) ? proyecto.fondo : "#ffffff";
    new Function("G", compilar(proyecto))(this);
    this.running = true;
    this.t0 = performance.now();
    this.cv.focus();
    this.hats.filter(h => h.tipo === "flag").forEach(h => this.lanzar(h));
  }

  detener() { this.running = false; this.waiters = []; }

  bucle() {
    requestAnimationFrame(() => {
      this.dibujar();
      const espera = this.waiters;
      this.waiters = [];
      espera.forEach(r => r());
      this.bucle();
    });
  }

  imagen(id) {
    if (!this.imgs[id]) { const im = new Image(); im.src = id.slice(2); this.imgs[id] = im; }
    return this.imgs[id];
  }

  dibujar() {
    const c = this.ctx;
    c.fillStyle = this.fondo;
    c.fillRect(0, 0, ANCHO, ALTO);

    for (const a of this.sprites) {
      if (!a.visible) continue;
      c.save();
      c.translate(ANCHO / 2 + a.x, ALTO / 2 - a.y);
      c.rotate((a.dir - 90) * Math.PI / 180);
      if (a.img.startsWith("e:")) {
        c.font = `${a.w * 0.9}px serif`;
        c.textAlign = "center"; c.textBaseline = "middle";
        c.fillText(a.img.slice(2), 0, 0);
      } else {
        const im = this.imagen(a.img);
        if (im.complete && im.naturalWidth) {
          const h = a.w * im.naturalHeight / im.naturalWidth;
          c.drawImage(im, -a.w / 2, -h / 2, a.w, h);
        }
      }
      c.restore();

      if (a.bubble) {
        c.font = "14px Arial";
        const tw = c.measureText(a.bubble).width;
        const bx = limitar(ANCHO / 2 + a.x - tw / 2 - 8, 2, ANCHO - tw - 18);
        const by = Math.max(2, ALTO / 2 - a.y - a.w / 2 - 34);
        c.fillStyle = "#fff"; c.strokeStyle = "#555";
        c.fillRect(bx, by, tw + 16, 26); c.strokeRect(bx, by, tw + 16, 26);
        c.fillStyle = "#000"; c.textAlign = "left"; c.textBaseline = "middle";
        c.fillText(a.bubble, bx + 8, by + 13);
      }
    }

    c.font = "bold 14px Arial"; c.textAlign = "left"; c.textBaseline = "top"; c.fillStyle = "#222";
    Object.entries(this.vars).forEach(([k, v], i) => c.fillText(`${k}: ${v}`, 8, 8 + i * 18));

    if (this.fin) {
      c.fillStyle = "rgba(0,0,0,.65)"; c.fillRect(0, 0, ANCHO, ALTO);
      c.fillStyle = "#fff"; c.font = "bold 30px Arial"; c.textAlign = "center"; c.textBaseline = "middle";
      c.fillText(this.fin, ANCHO / 2, ALTO / 2);
    }
  }
}

/* =========================================================
   EDITOR
   ========================================================= */
const MAX_OBJETOS = 6;
const vacio = () => ({ blocks: { languageVersion: 0, blocks: [] } });

function proyectoInicial() {
  const nb = (type, fields, inputs, next) => {
    const o = { type };
    if (fields) o.fields = fields;
    if (inputs) o.inputs = inputs;
    if (next) o.next = { block: next };
    return o;
  };
  const cadena = lista => { for (let i = lista.length - 2; i >= 0; i--) lista[i].next = { block: lista[i + 1] }; return lista[0]; };
  const nu = v => ({ shadow: { type: "math_number", fields: { NUM: v } } });
  const en = x => ({ block: x });
  const mueve = (tecla, campo, v) => nb("controls_if", null,
    { IF0: en(nb("se_tecla", { KEY: tecla })), DO0: en(nb(campo, null, { N: nu(v) })) });
  const P = { id: "pid" };

  const jugador = nb("ev_flag", null, null,
    nb("mv_ir", null, { X: nu(0), Y: nu(-120) },
      nb("ct_siempre", null, { DO: en(cadena([
        mueve("arrowleft", "mv_cx", -6), mueve("arrowright", "mv_cx", 6),
        mueve("arrowup", "mv_cy", 6), mueve("arrowdown", "mv_cy", -6)])) })));

  const moneda = nb("ev_flag", null, null, cadena([
    nb("variables_set", { VAR: P }, { VALUE: nu(0) }),
    nb("mv_azar"),
    nb("ct_siempre", null, { DO: en(nb("controls_if", null, {
      IF0: en(nb("se_toca", { OBJ: "Jugador" })),
      DO0: en(cadena([nb("math_change", { VAR: P }, { DELTA: nu(1) }), nb("mv_azar")]))
    })) })
  ]));

  const ws = bloque => ({ blocks: { languageVersion: 0, blocks: [Object.assign({ x: 30, y: 30 }, bloque)] }, variables: [{ name: "puntos", id: "pid" }] });
  return {
    titulo: "", fondo: "#ffffff", vars: ["puntos"],
    sprites: [
      { name: "Jugador", img: "e:🦈", x: 0, y: -120, size: 100, ws: ws(jugador) },
      { name: "Moneda", img: "e:🪙", x: 0, y: 60, size: 80, ws: ws(moneda) }
    ]
  };
}

let proyecto, actual = 0, wsEditor, motorEditor, motorModal, guardadoTimer;

function guardarSpriteActual() {
  proyecto.sprites[actual].ws = Blockly.serialization.workspaces.save(wsEditor);
  wsEditor.getAllVariables().forEach(v => { if (!proyecto.vars.includes(v.name)) proyecto.vars.push(v.name); });
  proyecto.titulo = document.getElementById("juego-titulo").value;
}

function guardarBorrador() {
  guardarSpriteActual();
  try { localStorage.setItem("missa-proyecto", JSON.stringify(proyecto)); } catch (e) { /* sin espacio */ }
}

function cargarSprite(i) {
  actual = i;
  NOMBRES = proyecto.sprites.map(s => s.name);
  Blockly.Events.disable();
  wsEditor.clear();
  Blockly.serialization.workspaces.load(proyecto.sprites[i].ws, wsEditor);
  proyecto.vars.forEach(nombre => { if (!wsEditor.getVariable(nombre)) wsEditor.createVariable(nombre); });
  Blockly.Events.enable();
  document.getElementById("juego-titulo").value = proyecto.titulo || "";
  pintarObjetos();
}

function pintarObjetos() {
  const tabs = document.getElementById("sprite-tabs");
  tabs.innerHTML = "";
  proyecto.sprites.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn btn-sm " + (i === actual ? "btn-primary" : "btn-default");
    btn.textContent = s.name;
    btn.onclick = () => { guardarSpriteActual(); cargarSprite(i); };
    tabs.appendChild(btn);
  });
  if (proyecto.sprites.length < MAX_OBJETOS) {
    const mas = document.createElement("button");
    mas.type = "button";
    mas.className = "btn btn-sm btn-success";
    mas.textContent = "+ objeto";
    mas.onclick = nuevoObjeto;
    tabs.appendChild(mas);
  }
  const s = proyecto.sprites[actual];
  document.getElementById("obj-img").value = s.img;
  document.getElementById("obj-x").value = s.x;
  document.getElementById("obj-y").value = s.y;
  document.getElementById("obj-tam").value = s.size;
  document.getElementById("obj-quitar").style.display = proyecto.sprites.length > 1 ? "inline-block" : "none";
}

function nuevoObjeto() {
  guardarSpriteActual();
  let k = proyecto.sprites.length + 1;
  while (proyecto.sprites.some(s => s.name === "Objeto " + k)) k++;
  proyecto.sprites.push({ name: "Objeto " + k, img: "e:👾", x: 0, y: 0, size: 100, ws: vacio() });
  cargarSprite(proyecto.sprites.length - 1);
}

function quitarObjeto() {
  if (proyecto.sprites.length < 2) return;
  guardarSpriteActual();
  proyecto.sprites.splice(actual, 1);
  cargarSprite(0);
}

function cambiarPropiedad() {
  const s = proyecto.sprites[actual];
  s.img = document.getElementById("obj-img").value;
  s.x = Number(document.getElementById("obj-x").value) || 0;
  s.y = Number(document.getElementById("obj-y").value) || 0;
  s.size = Number(document.getElementById("obj-tam").value) || 100;
}

function correrJuego() {
  guardarBorrador();
  try {
    motorEditor.iniciar(proyecto);
  } catch (error) {
    Swal.fire("error en los bloques", error.message, "error");
  }
}
function pararJuego() { motorEditor.detener(); }

async function nuevoJuego() {
  const r = await Swal.fire({ title: "¿empezar un juego nuevo?", text: "se perderá el borrador actual", icon: "question", showCancelButton: true });
  if (!r.isConfirmed) return;
  motorEditor.detener();
  proyecto = proyectoInicial();
  cargarSprite(0);
  guardarBorrador();
}

/* ---------- Publicar y galería ---------- */
let juegosCache = [];

async function publicarJuego() {
  const uid = localStorage.getItem("uid");
  if (!uid || !auth.currentUser) {
    Swal.fire("inicia sesion", "tienes que iniciar sesion para publicar tu juego", "warning");
    mostrar_login();
    return;
  }
  guardarBorrador();
  const titulo = proyecto.titulo.trim().slice(0, 50);
  if (!titulo) { Swal.fire("falta el nombre", "ponle nombre a tu juego", "warning"); return; }
  const datos = JSON.stringify(proyecto);
  if (datos.length > 200000) { Swal.fire("proyecto muy grande", "reduce los bloques o los objetos", "warning"); return; }

  try {
    await firebase.database().ref("juegos").push({
      uid, titulo, proyecto: datos,
      autor: localStorage.getItem("nombre") || "anónimo",
      fecha: firebase.database.ServerValue.TIMESTAMP
    });
    Swal.fire({ title: "juego publicado", text: "ya aparece en la galería", icon: "success" });
  } catch (error) {
    Swal.fire("error", error.message, "error");
  }
}

function leerProyecto(texto) {
  try {
    const p = JSON.parse(texto);
    if (!p || !Array.isArray(p.sprites) || !p.sprites.length || p.sprites.length > MAX_OBJETOS) return null;
    p.vars = Array.isArray(p.vars) ? p.vars.map(String) : [];
    return p;
  } catch (e) { return null; }
}

function jugarJuego(id) {
  const juego = juegosCache.find(j => j.id === id);
  const p = juego && leerProyecto(juego.proyecto);
  if (!p) { Swal.fire("error", "este juego no se puede abrir", "error"); return; }
  document.getElementById("modal-titulo").textContent = juego.titulo;
  $("#modal-juego").one("shown.bs.modal", () => {
    try { motorModal.iniciar(p); } catch (error) { Swal.fire("error en el juego", error.message, "error"); }
  }).modal("show");
}

async function remezclarJuego(id) {
  const juego = juegosCache.find(j => j.id === id);
  const p = juego && leerProyecto(juego.proyecto);
  if (!p) return;
  const r = await Swal.fire({ title: "¿editar una copia?", text: "reemplaza tu borrador actual", icon: "question", showCancelButton: true });
  if (!r.isConfirmed) return;
  motorEditor.detener();
  p.titulo = "Remix de " + juego.titulo;
  proyecto = p;
  try { cargarSprite(0); } catch (error) { Swal.fire("error", error.message, "error"); return; }
  document.getElementById("crear-juegos").scrollIntoView({ behavior: "smooth" });
}

async function borrarJuego(id) {
  const r = await Swal.fire({ title: "¿borrar este juego?", icon: "question", showCancelButton: true });
  if (!r.isConfirmed) return;
  try { await firebase.database().ref("juegos/" + id).remove(); } catch (error) { Swal.fire("error", error.message, "error"); }
}

function renderGaleriaJuegos() {
  const galeria = document.getElementById("juegos-galeria");
  galeria.innerHTML = "";
  if (!juegosCache.length) { galeria.textContent = "Aún no hay juegos publicados. ¡Crea el primero!"; return; }
  const miUid = localStorage.getItem("uid");

  juegosCache.slice().reverse().forEach(j => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "meme";
    const titulo = document.createElement("h4");
    titulo.textContent = j.titulo;
    const autor = document.createElement("p");
    autor.className = "meme-autor";
    autor.textContent = "por " + (j.autor || "anónimo");
    tarjeta.append(titulo, autor);

    const acciones = [["Jugar", "btn-success", () => jugarJuego(j.id)], ["Editar copia", "btn-default", () => remezclarJuego(j.id)]];
    if (miUid && j.uid === miUid) acciones.push(["borrar", "btn-danger", () => borrarJuego(j.id)]);
    acciones.forEach(([texto, clase, fn]) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-xs " + clase;
      btn.textContent = texto;
      btn.onclick = fn;
      tarjeta.appendChild(btn);
    });
    tarjeta.appendChild(crearSocial("juegos", j.id));
    galeria.appendChild(tarjeta);
  });
}

function cargarJuegos() {
  firebase.database().ref("juegos").orderByKey().limitToLast(30).on("value",
    snapshot => {
      juegosCache = [];
      snapshot.forEach(h => {
        const j = h.val();
        if (j && typeof j.proyecto === "string" && typeof j.titulo === "string") juegosCache.push({ id: h.key, ...j });
      });
      renderGaleriaJuegos();
    },
    error => {
      console.warn("No se pudieron cargar los juegos:", error.message);
      document.getElementById("juegos-galeria").textContent = "No se pudieron cargar los juegos.";
    });
}

// Cuando cambia la sesión, main.js llama a actualizarZonaMemes: aprovechamos para refrescar la galería
const _actualizarMemes = actualizarZonaMemes;
actualizarZonaMemes = function () { _actualizarMemes(); renderGaleriaJuegos(); };

/* ---------- Arranque ---------- */
(function iniciarCreador() {
  const sel = document.getElementById("obj-img");
  CATALOGO.forEach(([etiqueta, valor]) => sel.add(new Option(etiqueta, valor)));
  ["obj-img", "obj-x", "obj-y", "obj-tam"].forEach(id => document.getElementById(id).addEventListener("change", cambiarPropiedad));
  document.getElementById("obj-quitar").onclick = quitarObjeto;

  try { proyecto = leerProyecto(localStorage.getItem("missa-proyecto")); } catch (e) { proyecto = null; }
  if (!proyecto) proyecto = proyectoInicial();

  wsEditor = Blockly.inject("blockly-div", {
    toolbox: TOOLBOX, renderer: "zelos", theme: TEMA, trashcan: true,
    media: "https://cdn.jsdelivr.net/npm/blockly@10.4.3/media/",
    grid: { spacing: 25, length: 3, colour: "#ccc", snap: true },
    zoom: { controls: true, wheel: true, startScale: 0.85 }
  });
  wsEditor.addChangeListener(e => {
    if (e.isUiEvent) return;
    clearTimeout(guardadoTimer);
    guardadoTimer = setTimeout(guardarBorrador, 1000);
  });
  window.addEventListener("resize", () => Blockly.svgResize(wsEditor));

  motorEditor = new Motor(document.getElementById("escenario"));
  motorModal = new Motor(document.getElementById("modal-canvas"));
  $("#modal-juego").on("hidden.bs.modal", () => motorModal.detener());

  try { cargarSprite(0); } catch (error) { proyecto = proyectoInicial(); cargarSprite(0); }
  cargarJuegos();
})();