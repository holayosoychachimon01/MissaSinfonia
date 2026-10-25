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
let PERSONALES = {}; // imágenes propias del proyecto { id: {n: nombre, d: dataURL} }
const MAX_IMAGENES = 6;

/* ---------- Definición de bloques ---------- */
const C = { ev: "#FFBF00", mov: "#4C97FF", look: "#9966FF", snd: "#CF63CF", ctl: "#FFAB19", sen: "#5CB1D6", op: "#59C059", vr: "#FF8C1A", pt: "#E6A800", ls: "#FF661A" };
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
  bl("lk_fondo", "fijar color de fondo %1", C.look, [{ type: "field_colour", name: "COLOR", colour: "#ffffff" }], pila),
  bl("sn_play", "reproducir sonido %1", C.snd, [dd("SND", SONIDOS)], pila),
  bl("sc_enviar", "enviar puntuación %1", C.pt, [nIn("N")], pila),

  bl("ct_espera", "esperar %1 segundos", C.ctl, [nIn("S")], pila),
  bl("ct_siempre", "por siempre", C.ctl, [], { message1: "%1", args1: [{ type: "input_statement", name: "DO" }], previousStatement: null }),
  bl("ct_fin", "terminar juego: %1", C.ctl, [txt("MSG", "¡Fin del juego!")], pila),

  bl("se_tecla", "¿tecla %1 presionada?", C.sen, [dd("KEY", TECLAS)], { output: "Boolean" }),
  bl("se_mx", "x del mouse", C.sen, [], num),
  bl("se_my", "y del mouse", C.sen, [], num),
  bl("se_mclick", "¿mouse presionado?", C.sen, [], { output: "Boolean" }),
  bl("se_tiempo", "temporizador", C.sen, [], num),

  bl("ev_clon", "al comenzar como clon", C.ev, [], { nextStatement: null, extensions: ["gorro"] }),
  bl("ev_cuando", "cuando se cumpla %1", C.ev, [{ type: "input_value", name: "COND", check: "Boolean" }], { nextStatement: null, extensions: ["gorro"] }),
  bl("mv_desliza", "deslizar en %1 s a x: %2 y: %3", C.mov, [nIn("S"), nIn("X"), nIn("Y")], pila),
  bl("lk_tamv", "tamaño", C.look, [], num),
  bl("lk_transp", "fijar transparencia a %1 %", C.look, [nIn("N")], pila),
  bl("lk_ctransp", "cambiar transparencia en %1", C.look, [nIn("N")], pila),
  bl("lk_tinte", "cambiar color del objeto en %1", C.look, [nIn("N")], pila),
  bl("lk_ftinte", "fijar color del objeto a %1", C.look, [nIn("N")], pila),
  bl("lk_espejo", "voltear %1", C.look, [dd("E", [["normal", "0"], ["espejado", "1"]])], pila),
  bl("lk_frente", "ir al frente", C.look, [], pila),
  bl("lk_atras", "ir al fondo", C.look, [], pila),
  bl("lk_texto", "escribir %1 en x: %2 y: %3 color %4", C.look,
    [aIn("T"), nIn("X"), nIn("Y"), { type: "field_colour", name: "COLOR", colour: "#000000" }], pila),
  bl("lk_btexto", "borrar texto", C.look, [], pila),
  bl("sn_nota", "tocar nota %1 por %2 segundos", C.snd, [nIn("N"), nIn("T")], pila),
  bl("sn_vol", "fijar volumen a %1 %", C.snd, [nIn("N")], pila),
  bl("sn_stop", "detener todos los sonidos", C.snd, [], pila),
  bl("ct_hasta", "esperar hasta que %1", C.ctl, [{ type: "input_value", name: "COND", check: "Boolean" }], pila),
  bl("ct_parar", "detener este script", C.ctl, [], { previousStatement: null }),
  bl("ct_borrar", "borrar este clon", C.ctl, [], { previousStatement: null }),
  bl("se_treset", "reiniciar temporizador", C.sen, [], pila),
  bl("se_preguntar", "preguntar %1 y esperar", C.sen, [aIn("T")], pila),
  bl("se_resp", "respuesta", C.sen, [], { output: null }),
  bl("lc_fijar", "fijar dato %1 de este objeto a %2", C.vr, [txt("NAME", "vidas"), aIn("V")], pila),
  bl("lc_cambiar", "cambiar dato %1 de este objeto en %2", C.vr, [txt("NAME", "vidas"), nIn("V")], pila),
  bl("lc_valor", "dato %1 de este objeto", C.vr, [txt("NAME", "vidas")], { output: null })
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

const BUCLES = ["ct_siempre", "controls_repeat_ext", "controls_whileUntil", "controls_for"];
function enBucle(blk) {
  for (let p = blk.getSurroundParent(); p; p = p.getSurroundParent()) {
    if (BUCLES.includes(p.type)) return true;
  }
  return false;
}
function defSalto(tipo, texto) {
  Blockly.Blocks[tipo] = {
    init: function () {
      this.appendDummyInput().appendField(texto);
      this.setPreviousStatement(true);
      this.setColour(C.ctl);
    },
    onchange: function () {
      if (!this.workspace || this.workspace.isFlyout) return;
      this.setWarningText(enBucle(this) ? null : "Solo funciona dentro de un bucle");
    }
  };
}
defSalto("ct_romper", "romper el bucle");
defSalto("ct_continuar", "saltar a la siguiente vuelta");

const opcionesObjetivo = () => [["puntero del mouse", "_mouse"], ...NOMBRES.map(n => [n, n])];
const opcionesClon = () => [["mí mismo", "_yo"], ...NOMBRES.map(n => [n, n])];
const opcionesNombres = () => NOMBRES.length ? NOMBRES.map(n => [n, n]) : [["-", "-"]];

function defObjeto(tipo, texto, colour, opciones, forma) {
  Blockly.Blocks[tipo] = {
    init: function () {
      this.appendDummyInput().appendField(texto).appendField(new Blockly.FieldDropdown(opciones), "OBJ");
      if (forma === "num") {
        this.setOutput(true, "Number");
      } else {
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      }
      this.setColour(colour);
    }
  };
}
defObjeto("mv_irA", "ir a", C.mov, opcionesObjetivo, "pila");
defObjeto("mv_hacia", "apuntar hacia", C.mov, opcionesObjetivo, "pila");
defObjeto("se_dist", "distancia a", C.sen, opcionesObjetivo, "num");
defObjeto("se_cuantos", "cantidad de", C.sen, opcionesNombres, "num");
defObjeto("ct_clonar", "crear clon de", C.ctl, opcionesClon, "pila");

Blockly.Blocks["lk_img"] = {
  init: function () {
    this.appendDummyInput().appendField("cambiar imagen a")
      .appendField(new Blockly.FieldDropdown(() =>
        [...CATALOGO, ...Object.entries(PERSONALES).map(([id, v]) => ["📁 " + v.n, id])]), "IMG");
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(C.look);
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
    cat("Eventos", C.ev, [b("ev_flag"), b("ev_key"), b("ev_click"), b("ev_clon"), b("ev_cuando"), b("ev_msg"), b("ev_send")]),
    cat("Movimiento", C.mov, [b("mv_mover", { N: n(10) }), b("mv_der", { N: n(15) }), b("mv_izq", { N: n(15) }),
      b("mv_ir", { X: n(0), Y: n(0) }), b("mv_azar"), b("mv_irA"), b("mv_desliza", { S: n(1), X: n(0), Y: n(0) }),
      b("mv_dir", { N: n(90) }), b("mv_hacia"), b("mv_cx", { N: n(10) }), b("mv_cy", { N: n(10) }),
      b("mv_fx", { N: n(0) }), b("mv_fy", { N: n(0) }), b("mv_reb"), b("mv_x"), b("mv_y"), b("mv_dirv")]),
    cat("Apariencia", C.look, [b("lk_decir", { T: t("¡Hola!") }), b("lk_decirpor", { T: t("¡Hola!"), S: n(2) }),
      b("lk_tam", { N: n(100) }), b("lk_ctam", { N: n(10) }), b("lk_tamv"),
      b("lk_transp", { N: n(50) }), b("lk_ctransp", { N: n(10) }),
      b("lk_ftinte", { N: n(90) }), b("lk_tinte", { N: n(15) }), b("lk_espejo"),
      b("lk_mostrar"), b("lk_esconder"), b("lk_img"), b("lk_fondo"), b("lk_frente"), b("lk_atras"),
      b("lk_texto", { T: t("Puntos"), X: n(0), Y: n(150) }), b("lk_btexto")]),
    cat("Sonido", C.snd, [b("sn_play"), b("sn_nota", { N: n(60), T: n(0.5) }), b("sn_vol", { N: n(100) }), b("sn_stop")]),
    cat("Control", C.ctl, [b("ct_espera", { S: n(1) }), b("ct_siempre"), b("controls_repeat_ext", { TIMES: n(10) }),
      b("controls_if"), b("controls_if", null, { extraState: { hasElse: true } }), b("ct_hasta"),
      b("controls_whileUntil", null, { fields: { MODE: "UNTIL" } }), b("ct_parar"),
      b("controls_for", { FROM: n(1), TO: n(10), BY: n(1) }, { fields: { VAR: { name: "i" } } }),
      b("ct_romper"), b("ct_continuar"), b("ct_clonar"), b("ct_borrar"), b("ct_fin")]),
    cat("Sensores", C.sen, [b("se_toca"), b("se_dist"), b("se_cuantos"), b("se_tecla"), b("se_mx"), b("se_my"),
      b("se_mclick"), b("se_tiempo"), b("se_treset"), b("se_preguntar", { T: t("¿Cómo te llamas?") }), b("se_resp")]),
    cat("Operadores", C.op, [b("math_number"), b("math_arithmetic", { A: n(1), B: n(1) }),
      b("math_modulo", { DIVIDEND: n(10), DIVISOR: n(3) }), b("math_single", { NUM: n(9) }),
      b("math_trig", { NUM: n(45) }), b("math_round", { NUM: n(3.7) }),
      b("math_constrain", { VALUE: n(50), LOW: n(1), HIGH: n(100) }), b("math_random_int", { FROM: n(1), TO: n(10) }),
      b("math_random_float"), b("math_atan2", { X: n(1), Y: n(1) }), b("math_number_property", { NUMBER_TO_CHECK: n(0) }),
      b("math_constant"), b("logic_compare", { A: n(0), B: n(0) }), b("logic_operation"), b("logic_negate"),
      b("logic_boolean"), b("logic_ternary")]),
    cat("Texto", C.op, [b("text"), b("text_join", null, { extraState: { itemCount: 2 } }),
      b("text_length", { VALUE: t("hola") }), b("text_isEmpty", { VALUE: t("") }),
      b("text_indexOf", { VALUE: t("hola"), FIND: t("o") }), b("text_charAt", { VALUE: t("hola") }),
      b("text_changeCase", { TEXT: t("hola") }), b("text_trim", { TEXT: t(" hola ") })]),
    cat("Listas", C.ls, [b("lists_create_with", null, { extraState: { itemCount: 3 } }),
      b("lists_repeat", { NUM: n(5) }), b("lists_length"), b("lists_isEmpty"), b("lists_indexOf"),
      b("lists_getIndex"), b("lists_setIndex")]),
    cat("Datos del objeto", C.vr, [b("lc_fijar", { V: n(0) }), b("lc_cambiar", { V: n(1) }), b("lc_valor")]),
    cat("Puntuación", C.pt, [b("sc_enviar", { N: n(0) })]),
    { kind: "category", name: "Variables", colour: C.vr, custom: "VARIABLE" },
    { kind: "category", name: "Mis bloques", colour: "#FF6680", custom: "PROCEDURE" }
  ]
};

const TEMA = Blockly.Theme.defineTheme("missa", {
  base: Blockly.Themes.Zelos,
  blockStyles: {
    loop_blocks: { colourPrimary: C.ctl }, logic_blocks: { colourPrimary: C.ctl },
    math_blocks: { colourPrimary: C.op }, text_blocks: { colourPrimary: C.op },
    variable_blocks: { colourPrimary: C.vr }, list_blocks: { colourPrimary: C.ls }, procedure_blocks: { colourPrimary: "#FF6680" }
  }
});

/* ---------- Generador de código ---------- */
const gen = javascript.javascriptGenerator;
const O = javascript.Order;
const F = gen.forBlock;
gen.INFINITE_LOOP_TRAP = "if (await G.tick(S)) return true;\n"; // todo bucle cede un fotograma: el juego nunca se congela
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
F.lk_decirpor = blk => `if (await S.decirPor(${val(blk, "T", "''")}, ${val(blk, "S", 1)})) return true;\n`;
F.lk_mostrar = () => "S.visible = true;\n";
F.lk_esconder = () => "S.visible = false;\n";
F.lk_img = blk => `S.img = ${gen.quote_(blk.getFieldValue("IMG"))};\n`;
F.lk_fondo = blk => `G.fondo = ${gen.quote_(blk.getFieldValue("COLOR"))};\n`;
F.sn_play = blk => `G.sonido(${gen.quote_(blk.getFieldValue("SND"))});\n`;
F.sc_enviar = blk => `G.puntuar(${val(blk, "N", 0)});\n`;
F.ct_espera = blk => `if (await G.esperar(${val(blk, "S", 1)}, S)) return true;\n`;
F.ct_siempre = blk => `while (true) {\n${gen.addLoopTrap(gen.statementToCode(blk, "DO"), blk)}}\n`;
F.ct_fin = blk => `G.terminar(${gen.quote_(blk.getFieldValue("MSG"))});\n`;
F.ev_send = blk => `G.enviar(${gen.quote_(blk.getFieldValue("MSG"))});\n`;

const R = (type, codigo) => { F[type] = blk => [typeof codigo === "function" ? codigo(blk) : codigo, O.FUNCTION_CALL]; };
R("mv_x", "S.x"); R("mv_y", "S.y"); R("mv_dirv", "S.dir"); R("se_mx", "G.mx"); R("se_my", "G.my");
R("se_mclick", "G.mdown"); R("se_tiempo", "G.tiempo()");
R("se_toca", blk => `S.toca(${gen.quote_(blk.getFieldValue("OBJ"))})`);
R("se_tecla", blk => `G.tecla(${gen.quote_(blk.getFieldValue("KEY"))})`);

const q = (blk, campo) => gen.quote_(blk.getFieldValue(campo));
F.mv_irA = blk => `S.irA(${q(blk, "OBJ")});\n`;
F.mv_hacia = blk => `S.apuntarA(${q(blk, "OBJ")});\n`;
F.mv_desliza = blk => `if (await S.deslizar(${val(blk, "X", 0)}, ${val(blk, "Y", 0)}, ${val(blk, "S", 1)})) return true;\n`;
F.lk_transp = blk => `S.transparencia(${val(blk, "N", 0)});\n`;
F.lk_ctransp = blk => `S.transparencia(S.transp + (Number(${val(blk, "N", 0)}) || 0));\n`;
F.lk_tinte = blk => `S.tinte = (S.tinte + (Number(${val(blk, "N", 0)}) || 0)) % 360;\n`;
F.lk_ftinte = blk => `S.tinte = (Number(${val(blk, "N", 0)}) || 0) % 360;\n`;
F.lk_espejo = blk => `S.espejo = ${blk.getFieldValue("E") === "1"};\n`;
F.lk_frente = () => "S.frente();\n";
F.lk_atras = () => "S.fondo();\n";
F.lk_texto = blk => `S.escribir(${val(blk, "T", "''")}, ${val(blk, "X", 0)}, ${val(blk, "Y", 0)}, ${q(blk, "COLOR")});\n`;
F.lk_btexto = () => "S.rotulo = null;\n";
F.sn_nota = blk => `if (await G.nota(${val(blk, "N", 60)}, ${val(blk, "T", 0.5)}, S)) return true;\n`;
F.sn_vol = blk => `G.volumen(${val(blk, "N", 100)});\n`;
F.sn_stop = () => "G.parar();\n";
F.ct_hasta = blk => `while (!(${val(blk, "COND", "false")})) {\n  if (await G.tick(S)) return true;\n}\n`;
F.ct_parar = () => "return;\n";
F.ct_clonar = blk => `G.clonar(S, ${q(blk, "OBJ")});\n`;
F.ct_borrar = () => "if (G.borrarClon(S)) return true;\n";
F.se_treset = () => "G.t0 = performance.now();\n";
F.se_preguntar = blk => `if (await G.preguntar(${val(blk, "T", "''")}, S)) return true;\n`;
F.lc_fijar = blk => `S.setd(${q(blk, "NAME")}, ${val(blk, "V", 0)});\n`;
F.lc_cambiar = blk => `S.setd(${q(blk, "NAME")}, S.getd(${q(blk, "NAME")}) + (Number(${val(blk, "V", 0)}) || 0));\n`;
R("lk_tamv", "S.size"); R("se_resp", "G.respuesta");
R("se_dist", blk => `S.distancia(${q(blk, "OBJ")})`);
R("se_cuantos", blk => `G.cuantos(${q(blk, "OBJ")})`);
R("lc_valor", blk => `S.getd(${q(blk, "NAME")})`);

// contar con i de a hasta b (la variable es global: vive en G.vars)
let contadorBucles = 0;
F.controls_for = blk => {
  const k = ++contadorBucles;
  const cuerpo = gen.addLoopTrap(gen.statementToCode(blk, "DO"), blk);
  return `for (let _a${k} = Number(${val(blk, "FROM", 0)}), _z${k} = Number(${val(blk, "TO", 0)}), ` +
    `_s${k} = Math.abs(Number(${val(blk, "BY", 1)})) || 1, _d${k} = _a${k} <= _z${k} ? 1 : -1, _i${k} = _a${k}; ` +
    `_d${k} > 0 ? _i${k} <= _z${k} : _i${k} >= _z${k}; _i${k} += _d${k} * _s${k}) {\n` +
    `  G.setv(${vn(blk)}, _i${k});\n${cuerpo}}\n`;
};
F.ct_romper = blk => enBucle(blk) ? "break;\n" : "";
F.ct_continuar = blk => enBucle(blk) ? "continue;\n" : "";

// Procedimientos ("Mis bloques"): funciones asíncronas por objeto.
// Los parámetros son variables globales: la llamada las fija antes de ejecutar el procedimiento.
F.procedures_defnoreturn = (blk, g) => {
  const nombre = g.nameDB_.getName(blk.getFieldValue("NAME"), "PROCEDURE");
  g.definitions_["%" + nombre] = `async function ${nombre}(S) {\n${g.statementToCode(blk, "STACK")}  return false;\n}`;
  return null;
};
F.procedures_callnoreturn = (blk, g) => {
  const nombre = g.nameDB_.getName(blk.getFieldValue("NAME"), "PROCEDURE");
  const asigna = blk.getVars().map((v, i) => `G.setv(${JSON.stringify(v)}, ${val(blk, "ARG" + i, 0)});\n`).join("");
  return `${asigna}if (await ${nombre}(S)) return true;\n`;
};

// Las variables son globales entre todos los objetos: viven en G.vars
const vn = blk => JSON.stringify(blk.getField("VAR").getText());
F.variables_get = blk => [`G.v(${vn(blk)})`, O.FUNCTION_CALL];
F.variables_set = blk => `G.setv(${vn(blk)}, ${val(blk, "VALUE", 0)});\n`;
F.math_change = blk => `G.setv(${vn(blk)}, G.v(${vn(blk)}) + (Number(${val(blk, "DELTA", 0)}) || 0));\n`;

const HATS = {
  ev_flag: () => ["flag", null],
  ev_key: blk => ["key", blk.getFieldValue("KEY")],
  ev_click: () => ["click", null],
  ev_msg: blk => ["msg", blk.getFieldValue("MSG")],
  ev_clon: () => ["clon", null],
  ev_cuando: () => null
};

// Convierte el proyecto en JavaScript. Solo se generan los scripts que empiezan con un bloque de evento.
function compilar(proyecto) {
  const nombresPrevios = NOMBRES, personalesPrevias = PERSONALES;
  NOMBRES = proyecto.sprites.map(s => s.name);
  PERSONALES = proyecto.imagenes || {};
  try {
    return compilarInterno(proyecto);
  } finally {
    NOMBRES = nombresPrevios;
    PERSONALES = personalesPrevias;
  }
}

function compilarInterno(proyecto) {
  let codigo = "";
  proyecto.sprites.forEach((s, i) => {
    const ws = new Blockly.Workspace();
    try {
      Blockly.serialization.workspaces.load(s.ws, ws);
      gen.init(ws);
      let cuerpo = "";
      ws.getTopBlocks(true).forEach(h => {
        if (h.type === "procedures_defnoreturn") { gen.blockToCode(h); return; }
        if (!HATS[h.type]) return;
        const sig = h.getNextBlock();
        const funcion = `async function (S) {\n${sig ? gen.blockToCode(sig) : ""}}`;
        if (h.type === "ev_cuando") {
          const cond = gen.valueToCode(h, "COND", O.NONE) || "false";
          cuerpo += `G.cuando(S, function (S) { return Boolean(${cond}); }, ${funcion});\n`;
        } else {
          const [tipo, arg] = HATS[h.type](h);
          cuerpo += `G.hat(S, ${JSON.stringify(tipo)}, ${JSON.stringify(arg)}, ${funcion});\n`;
        }
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
    const propia = Object.prototype.hasOwnProperty.call(G.custom, d.img);
    this.img = IMG_VALIDAS.includes(d.img) || propia ? d.img : IMG_VALIDAS[0];
    this.size = limitar(Number(d.size) || 100, 5, 500);
    this.dir = 90;
    this.visible = true;
    this.bubble = "";
    this.base = this; this.esClon = false; this.eliminado = false;
    this.datos = Object.create(null);
    this.transp = 0; this.espejo = false; this.tinte = 0; this.z = 0; this.rotulo = null;
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
  async decirPor(txt, s) { this.decir(txt); await this.G.esperar(s, this); if (this.bubble === String(txt)) this.decir(""); return this.eliminado; }
  rebotar() {
    const m = this.w / 2;
    if (this.x <= -ANCHO / 2 + m || this.x >= ANCHO / 2 - m) this.dir = -this.dir;
    if (this.y <= -ALTO / 2 + m || this.y >= ALTO / 2 - m) this.dir = 180 - this.dir;
  }
  transparencia(v) { this.transp = limitar(Number(v) || 0, 0, 100); }
  frente() { this.z = Math.max(0, ...this.G.sprites.map(s => s.z)) + 1; }
  fondo() { this.z = Math.min(0, ...this.G.sprites.map(s => s.z)) - 1; }
  escribir(txt, x, y, color) {
    this.rotulo = { t: String(txt), x: Number(x) || 0, y: Number(y) || 0, color: /^#[0-9a-f]{6}$/i.test(color) ? color : "#000000" };
  }
  setd(nombre, v) { this.datos[nombre] = v; }
  getd(nombre) { return nombre in this.datos ? this.datos[nombre] : 0; }
  irA(quien) { const p = this.G.punto(quien, this); if (p) this.ir(p.x, p.y); }
  apuntarA(quien) {
    const p = this.G.punto(quien, this);
    if (p) this.dir = Math.atan2(p.x - this.x, p.y - this.y) * 180 / Math.PI;
  }
  distancia(quien) { const p = this.G.punto(quien, this); return p ? Math.round(Math.hypot(p.x - this.x, p.y - this.y)) : 0; }
  async deslizar(x, y, s) {
    const x0 = this.x, y0 = this.y, dur = Math.max(0.01, Number(s) || 0) * 1000, t0 = performance.now();
    let k;
    do {
      await this.G.tick(this);
      k = Math.min(1, (performance.now() - t0) / dur);
      this.ir(x0 + ((Number(x) || 0) - x0) * k, y0 + ((Number(y) || 0) - y0) * k);
    } while (k < 1 && !this.eliminado);
    return this.eliminado;
  }
  toca(otro) {
    if (!this.visible) return false;
    const m = this.w / 2;
    if (otro === "borde") return Math.abs(this.x) >= ANCHO / 2 - m - 1 || Math.abs(this.y) >= ALTO / 2 - m - 1;
    // también cuenta si toca algún clon del objeto
    return this.G.sprites.some(a => {
      if (a === this || a.name !== otro || !a.visible) return false;
      const d = (this.w + a.w) * 0.4;
      return Math.abs(this.x - a.x) < d && Math.abs(this.y - a.y) < d;
    });
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
    this.custom = {}; this.onPuntuar = null;
    this.conds = []; this.vol = 100; this.sonando = []; this.respuesta = "";
    this.mejor = -Infinity; this.enviada = -Infinity;
    canvas.tabIndex = 0;

    canvas.addEventListener("keydown", e => {
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();
      if (!e.repeat) this.pulsar(k);
    });
    canvas.addEventListener("keyup", e => this.soltar(e.key.toLowerCase()));
    canvas.addEventListener("blur", () => this.keys.clear());
    // pointer events: sirven para ratón y pantalla táctil
    canvas.addEventListener("pointermove", e => this.puntero(e));
    canvas.addEventListener("pointerdown", e => { this.puntero(e); this.mdown = true; });
    window.addEventListener("pointerup", () => { this.mdown = false; });
    window.addEventListener("pointercancel", () => { this.mdown = false; });
    canvas.addEventListener("click", e => {
      canvas.focus();
      this.puntero(e);
      const a = [...this.sprites].reverse().find(s => s.visible &&
        Math.abs(this.mx - s.x) < s.w / 2 && Math.abs(this.my - s.y) < s.w / 2);
      if (a) this.hats.filter(h => h.tipo === "click" && h.S === a.base).forEach(h => this.lanzar(h, a));
    });
    this.bucle();
  }

  puntero(e) {
    const r = this.cv.getBoundingClientRect();
    this.mx = Math.round((e.clientX - r.left) * ANCHO / r.width - ANCHO / 2);
    this.my = Math.round(ALTO / 2 - (e.clientY - r.top) * ALTO / r.height);
  }

  // Teclas: las usan el teclado y los botones táctiles
  pulsar(k) {
    if (this.keys.has(k)) return;
    this.keys.add(k);
    this.hats.filter(h => h.tipo === "key" && h.arg === k).forEach(h => this.instancias(h.S).forEach(a => this.lanzar(h, a)));
  }
  soltar(k) { this.keys.delete(k); }

  // ----- API que usan los bloques -----
  hat(S, tipo, arg, fn) { this.hats.push({ S, tipo, arg, fn, activos: new Set() }); }
  cuando(S, test, fn) { this.conds.push({ S, test, fn, activos: new Set(), prev: new Map() }); }
  // Devuelve true si el objeto que espera fue borrado (el script debe terminar)
  tick(S) { return new Promise(r => { if (this.running) this.waiters.push(() => r(!!(S && S.eliminado))); }); }
  async esperar(s, S) { const fin = performance.now() + (Number(s) || 0) * 1000; do { await this.tick(S); } while (performance.now() < fin); return !!(S && S.eliminado); }
  v(nombre) { return nombre in this.vars ? this.vars[nombre] : 0; }
  setv(nombre, x) { this.vars[nombre] = x; }
  tecla(k) { return this.keys.has(k); }
  tiempo() { return Math.round((performance.now() - this.t0) / 100) / 10; }
  sonido(f) {
    try {
      const a = new Audio(f);
      a.volume = this.vol / 100;
      this.sonando.push(a);
      a.onended = () => { this.sonando = this.sonando.filter(x => x !== a); };
      a.play().catch(() => {});
    } catch (e) { /* sin audio */ }
  }
  parar() { this.sonando.forEach(a => a.pause()); this.sonando = []; }
  volumen(v) { this.vol = limitar(Number(v) || 0, 0, 100); }
  async nota(nota, s, S) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      this.actx = this.actx || new Ctx();
      if (this.actx.state === "suspended") this.actx.resume();
      const osc = this.actx.createOscillator(), gan = this.actx.createGain();
      osc.type = "triangle";
      osc.frequency.value = 440 * Math.pow(2, ((Number(nota) || 60) - 69) / 12);
      gan.gain.value = 0.25 * this.vol / 100;
      osc.connect(gan);
      gan.connect(this.actx.destination);
      osc.start();
      osc.stop(this.actx.currentTime + Math.max(0.05, Number(s) || 0.5));
    } catch (e) { /* sin audio */ }
    return this.esperar(s, S);
  }
  async preguntar(texto, S) {
    const r = await Swal.fire({ title: String(texto), input: "text", confirmButtonText: "ok", allowOutsideClick: false });
    this.respuesta = r.value == null ? "" : String(r.value);
    return !!(S && S.eliminado);
  }
  cuantos(nombre) { return this.sprites.filter(a => a.name === nombre).length; }
  enviar(m) { this.hats.filter(h => h.tipo === "msg" && h.arg === m).forEach(h => this.instancias(h.S).forEach(a => this.lanzar(h, a))); }
  terminar(m) { this.fin = m; this.running = false; this.waiters = []; this.cv.classList.remove("jugando"); this.volcarPuntuacion(); }
  // Guarda la mejor puntuación de la partida (con una pequeña espera para no saturar la base de datos)
  puntuar(v) {
    v = Math.round(Number(v) * 100) / 100;
    if (!isFinite(v) || v <= this.mejor) return;
    this.mejor = v;
    clearTimeout(this.pt);
    this.pt = setTimeout(() => this.volcarPuntuacion(), 1500);
  }
  volcarPuntuacion() {
    clearTimeout(this.pt);
    if (this.onPuntuar && this.mejor > this.enviada && this.mejor >= 0) {
      this.enviada = this.mejor;
      this.onPuntuar(this.mejor);
    }
  }

  // Original + sus clones
  instancias(base) { return this.sprites.filter(a => a.base === base); }

  // Posición de "puntero del mouse" o de otro objeto
  punto(quien, yo) {
    if (quien === "_mouse") return { x: this.mx, y: this.my };
    const a = this.sprites.find(s => s !== yo && s.name === quien);
    return a ? { x: a.x, y: a.y } : null;
  }

  clonar(S, quien) {
    const objetivo = quien === "_yo" ? S : this.sprites.find(a => a.name === quien && a.base === a);
    if (!objetivo || this.sprites.length >= 100) return;
    const c = new Actor(this, objetivo);
    Object.assign(c, { dir: objetivo.dir, visible: objetivo.visible, transp: objetivo.transp,
      espejo: objetivo.espejo, tinte: objetivo.tinte, z: objetivo.z, base: objetivo.base, esClon: true });
    c.datos = Object.assign(Object.create(null), objetivo.datos);
    this.sprites.push(c);
    this.hats.filter(h => h.tipo === "clon" && h.S === c.base).forEach(h => this.lanzar(h, c));
  }

  // true si era un clon y se borró (el script debe terminar)
  borrarClon(S) {
    if (!S.esClon) return false;
    S.eliminado = true;
    this.sprites = this.sprites.filter(a => a !== S);
    return true;
  }

  revisarCondiciones() {
    this.conds.forEach(c => {
      c.prev.forEach((v, a) => { if (a.eliminado) c.prev.delete(a); });
      this.instancias(c.S).forEach(a => {
        let ok = false;
        try { ok = !!c.test(a); } catch (e) { /* condición con error */ }
        if (ok && !c.prev.get(a)) this.lanzar(c, a);
        c.prev.set(a, ok);
      });
    });
  }

  // ----- ciclo de vida -----
  lanzar(h, actor = h.S) {
    if (!this.running || actor.eliminado || h.activos.has(actor)) return;
    h.activos.add(actor);
    h.fn(actor).catch(err => console.error("Error en el juego:", err)).finally(() => { h.activos.delete(actor); });
  }

  iniciar(proyecto) {
    this.detener();
    this.mejor = -Infinity; this.enviada = -Infinity;
    this.custom = {};
    Object.entries(proyecto.imagenes || {}).forEach(([id, v]) => {
      if (/^u:[a-z0-9]{1,12}$/.test(id) && v && typeof v.d === "string" && v.d.startsWith("data:image/")) this.custom[id] = v.d;
    });
    this.imgs = {};
    this.sprites = proyecto.sprites.map(s => new Actor(this, s));
    this.hats = []; this.conds = []; this.vars = {}; this.keys.clear(); this.respuesta = "";
    this.fin = null;
    this.fondo = /^#[0-9a-f]{6}$/i.test(proyecto.fondo) ? proyecto.fondo : "#ffffff";
    new Function("G", compilar(proyecto))(this);
    this.running = true;
    this.t0 = performance.now();
    this.cv.classList.add("jugando");
    this.cv.focus({ preventScroll: true });
    this.hats.filter(h => h.tipo === "flag").forEach(h => this.lanzar(h));
  }

  detener() { this.running = false; this.waiters = []; this.cv.classList.remove("jugando"); this.parar(); this.volcarPuntuacion(); }

  frame() {
    this.dibujar();
    if (this.running) this.revisarCondiciones();
    const espera = this.waiters;
    this.waiters = [];
    espera.forEach(r => r());
  }

  bucle() {
    requestAnimationFrame(() => { this.frame(); this.bucle(); });
  }

  imagen(id) {
    if (!this.imgs[id]) { const im = new Image(); im.src = id.startsWith("u:") ? (this.custom[id] || "") : id.slice(2); this.imgs[id] = im; }
    return this.imgs[id];
  }

  dibujar() {
    const c = this.ctx;
    c.fillStyle = this.fondo;
    c.fillRect(0, 0, ANCHO, ALTO);

    for (const a of [...this.sprites].sort((p, q) => p.z - q.z)) {
      if (!a.visible) continue;
      c.save();
      c.globalAlpha = 1 - a.transp / 100;
      if (a.tinte && "filter" in c) c.filter = `hue-rotate(${a.tinte}deg)`;
      c.translate(ANCHO / 2 + a.x, ALTO / 2 - a.y);
      c.rotate((a.dir - 90) * Math.PI / 180);
      if (a.espejo) c.scale(-1, 1);
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

    for (const a of this.sprites) {
      if (!a.rotulo) continue;
      const r = a.rotulo;
      c.font = "bold 22px Arial"; c.textAlign = "center"; c.textBaseline = "middle";
      c.lineWidth = 4; c.strokeStyle = "#fff"; c.strokeText(r.t, ANCHO / 2 + r.x, ALTO / 2 - r.y);
      c.fillStyle = r.color; c.fillText(r.t, ANCHO / 2 + r.x, ALTO / 2 - r.y);
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
   CONTROLES TÁCTILES (se muestran solo en pantallas táctiles)
   La cruz activa flechas y WASD a la vez; los botones: espacio, E y Q.
   ========================================================= */
const CRUZ = [["▲", ["arrowup", "w"], "arriba"], ["◀", ["arrowleft", "a"], "izq"],
  ["▼", ["arrowdown", "s"], "abajo"], ["▶", ["arrowright", "d"], "der"]];
const ACCIONES = [["␣", [" "]], ["E", ["e"]], ["Q", ["q"]]];

function crearControlesTactiles(motor, contenedor) {
  const boton = (texto, teclas, clase) => {
    const el = document.createElement("div");
    el.className = "pad-btn " + clase;
    el.textContent = texto;
    el.setAttribute("role", "button");
    const soltar = () => { el.classList.remove("on"); teclas.forEach(k => motor.soltar(k)); };
    el.addEventListener("pointerdown", e => {
      e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* sin captura */ }
      el.classList.add("on");
      teclas.forEach(k => motor.pulsar(k));
    });
    el.addEventListener("pointerup", soltar);
    el.addEventListener("pointercancel", soltar);
    el.addEventListener("contextmenu", e => e.preventDefault());
    return el;
  };
  const cruz = document.createElement("div");
  cruz.className = "pad-cruz";
  CRUZ.forEach(([t, teclas, clase]) => cruz.appendChild(boton(t, teclas, clase)));
  const acciones = document.createElement("div");
  acciones.className = "pad-acc";
  ACCIONES.forEach(([t, teclas]) => acciones.appendChild(boton(t, teclas, "accion")));
  contenedor.classList.add("pad");
  contenedor.append(cruz, acciones);
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
      DO0: en(cadena([nb("math_change", { VAR: P }, { DELTA: nu(1) }), nb("sc_enviar", null, { N: en(nb("variables_get", { VAR: P })) }), nb("mv_azar")]))
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

/* ---------- Ejemplos listos para cargar ---------- */
const EJ = {
  nb(type, fields, inputs, next) {
    const o = { type };
    if (fields) o.fields = fields;
    if (inputs) o.inputs = inputs;
    if (next) o.next = { block: next };
    return o;
  },
  cadena(lista) { for (let i = lista.length - 2; i >= 0; i--) lista[i].next = { block: lista[i + 1] }; return lista[0]; },
  nu: v => ({ shadow: { type: "math_number", fields: { NUM: v } } }),
  en: x => ({ block: x })
};

// Construye un proyecto con las variables puntos y vidas
function proyectoDeEjemplo(objetos) {
  const { nb, cadena, nu, en } = EJ;
  const VP = { id: "vp" }, VV = { id: "vv" };
  const vars = [{ name: "puntos", id: "vp" }, { name: "vidas", id: "vv" }];
  const H = {
    VP, VV, nb, nu, en, cadena,
    get: v => nb("variables_get", { VAR: v }),
    fijar: (v, x) => nb("variables_set", { VAR: v }, { VALUE: nu(x) }),
    cambiar: (v, x) => nb("math_change", { VAR: v }, { DELTA: nu(x) }),
    tecla: k => nb("se_tecla", { KEY: k }),
    cmp: (op, a, x) => nb("logic_compare", { OP: op }, { A: en(a), B: nu(x) }),
    si: (cond, cuerpo) => nb("controls_if", null, { IF0: en(cond), DO0: en(cadena(cuerpo)) }),
    siempre: lista => nb("ct_siempre", null, { DO: en(cadena(lista)) }),
    azar: (a, x) => nb("math_random_int", null, { FROM: nu(a), TO: nu(x) })
  };
  return {
    titulo: "", fondo: "#ffffff", vars: ["puntos", "vidas"], imagenes: {},
    sprites: objetos(H).map(o => ({
      name: o.name, img: o.img, x: o.x, y: o.y, size: o.size,
      ws: { blocks: { languageVersion: 0, blocks: o.bloques.map((b, i) => Object.assign({ x: 30, y: 30 + i * 280 }, b)) }, variables: vars }
    }))
  };
}

function ejemploLluvia() {
  return proyectoDeEjemplo(H => {
    const { nb, nu, en, cadena, get, fijar, cambiar, tecla, cmp, si, siempre, azar, VP, VV } = H;
    const fin = si(cmp("LTE", get(VV), 0), [nb("sc_enviar", null, { N: en(get(VP)) }), nb("ct_fin", { MSG: "¡Fin del juego!" })]);
    return [
      { name: "Jugador", img: "e:🦈", x: 0, y: -150, size: 100, bloques: [
        nb("ev_flag", null, null, cadena([
          nb("mv_ir", null, { X: nu(0), Y: nu(-150) }), fijar(VP, 0), fijar(VV, 3),
          siempre([si(tecla("arrowleft"), [nb("mv_cx", null, { N: nu(-8) })]),
            si(tecla("arrowright"), [nb("mv_cx", null, { N: nu(8) })]), fin])]))] },
      { name: "Manzana", img: "e:🍎", x: 0, y: 0, size: 60, bloques: [
        nb("ev_flag", null, null, cadena([nb("lk_esconder"),
          siempre([nb("ct_clonar", { OBJ: "_yo" }), nb("ct_espera", null, { S: nu(0.8) })])])),
        nb("ev_clon", null, null, cadena([
          nb("mv_ir", null, { X: en(azar(-220, 220)), Y: nu(160) }),
          nb("lc_fijar", { NAME: "vel" }, { V: en(azar(3, 7)) }),
          nb("lk_mostrar"),
          siempre([
            nb("mv_cy", null, { N: en(nb("math_arithmetic", { OP: "MINUS" }, { A: nu(0), B: en(nb("lc_valor", { NAME: "vel" })) })) }),
            si(nb("se_toca", { OBJ: "Jugador" }), [cambiar(VP, 1), nb("sc_enviar", null, { N: en(get(VP)) }), nb("ct_borrar")]),
            si(cmp("LT", nb("mv_y"), -145), [cambiar(VV, -1), nb("ct_borrar")])])]))] }
    ];
  });
}

function ejemploDisparos() {
  return proyectoDeEjemplo(H => {
    const { nb, nu, en, cadena, get, fijar, cambiar, tecla, cmp, si, siempre, azar, VP, VV } = H;
    const fin = si(cmp("LTE", get(VV), 0), [nb("sc_enviar", null, { N: en(get(VP)) }), nb("ct_fin", { MSG: "¡Fin del juego!" })]);
    return [
      { name: "Nave", img: "e:🚀", x: 0, y: -150, size: 100, bloques: [
        nb("ev_flag", null, null, cadena([
          nb("mv_ir", null, { X: nu(0), Y: nu(-150) }), fijar(VP, 0), fijar(VV, 3),
          siempre([si(tecla("arrowleft"), [nb("mv_cx", null, { N: nu(-8) })]),
            si(tecla("arrowright"), [nb("mv_cx", null, { N: nu(8) })]), fin])])),
        nb("ev_key", { KEY: " " }, null, nb("ct_clonar", { OBJ: "Bala" }))] },
      { name: "Bala", img: "e:⭐", x: 0, y: 0, size: 40, bloques: [
        nb("ev_flag", null, null, nb("lk_esconder")),
        nb("ev_clon", null, null, cadena([
          nb("mv_irA", { OBJ: "Nave" }), nb("lk_mostrar"),
          siempre([nb("mv_cy", null, { N: nu(12) }),
            si(nb("se_toca", { OBJ: "Alien" }), [nb("ct_espera", null, { S: nu(0.05) }), nb("ct_borrar")]), // deja que el alien registre el golpe
            si(cmp("GT", nb("mv_y"), 145), [nb("ct_borrar")])])]))] },
      { name: "Alien", img: "e:👾", x: 0, y: 0, size: 70, bloques: [
        nb("ev_flag", null, null, cadena([nb("lk_esconder"),
          siempre([nb("ct_clonar", { OBJ: "_yo" }), nb("ct_espera", null, { S: nu(1) })])])),
        nb("ev_clon", null, null, cadena([
          nb("mv_ir", null, { X: en(azar(-220, 220)), Y: nu(160) }),
          nb("lc_fijar", { NAME: "vel" }, { V: en(azar(2, 4)) }),
          nb("lk_mostrar"),
          siempre([
            nb("mv_cy", null, { N: en(nb("math_arithmetic", { OP: "MINUS" }, { A: nu(0), B: en(nb("lc_valor", { NAME: "vel" })) })) }),
            si(nb("se_toca", { OBJ: "Bala" }), [cambiar(VP, 1), nb("sc_enviar", null, { N: en(get(VP)) }), nb("ct_borrar")]),
            si(nb("se_toca", { OBJ: "Nave" }), [cambiar(VV, -1), nb("ct_borrar")]),
            si(cmp("LT", nb("mv_y"), -145), [cambiar(VV, -1), nb("ct_borrar")])])]))] }
    ];
  });
}

const EJEMPLOS = { monedas: () => proyectoInicial(), lluvia: ejemploLluvia, disparos: ejemploDisparos };

async function cargarEjemplo(sel) {
  const crear = EJEMPLOS[sel.value];
  sel.value = "";
  if (!crear) return;
  const r = await Swal.fire({ title: "¿cargar este ejemplo?", text: "reemplaza tu borrador actual", icon: "question", showCancelButton: true });
  if (!r.isConfirmed) return;
  motorEditor.detener();
  proyecto = crear();
  try { cargarSprite(0); } catch (error) { Swal.fire("error", error.message, "error"); return; }
  guardarBorrador();
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
  PERSONALES = proyecto.imagenes = proyecto.imagenes || {};
  Blockly.Events.disable();
  wsEditor.clear();
  Blockly.serialization.workspaces.load(proyecto.sprites[i].ws, wsEditor);
  proyecto.vars.forEach(nombre => { if (!wsEditor.getVariable(nombre)) wsEditor.createVariable(nombre); });
  Blockly.Events.enable();
  document.getElementById("juego-titulo").value = proyecto.titulo || "";
  pintarObjetos();
}

function pintarObjetos() {
  llenarImagenes();
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
    const archivo = document.createElement("button");
    archivo.type = "button";
    archivo.className = "btn btn-sm btn-info";
    archivo.textContent = "📁 objeto desde archivo";
    archivo.onclick = () => pedirArchivo("nuevo");
    tabs.appendChild(archivo);
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

function llenarImagenes() {
  const sel = document.getElementById("obj-img");
  sel.innerHTML = "";
  CATALOGO.forEach(([etiqueta, valor]) => sel.add(new Option(etiqueta, valor)));
  Object.entries(PERSONALES).forEach(([id, v]) => sel.add(new Option("📁 " + v.n, id)));
}

// Quita las imágenes propias que ningún objeto ni bloque usa
function podarImagenes(p) {
  const texto = JSON.stringify(p.sprites);
  Object.keys(p.imagenes).forEach(id => { if (!texto.includes(id)) delete p.imagenes[id]; });
}

let modoArchivo = "actual";
function pedirArchivo(modo) {
  modoArchivo = modo;
  document.getElementById("archivo-objeto").click();
}

// Reduce la imagen a 128 px máx. conservando la transparencia
function reducirImagen(archivo, maximo) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const escala = Math.min(1, maximo / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(img.width * escala));
      canvas.height = Math.max(1, Math.round(img.height * escala));
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/webp", 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen")); };
    img.src = url;
  });
}

async function archivoElegido(e) {
  const archivo = e.target.files[0];
  e.target.value = "";
  if (!archivo) return;
  if (!archivo.type.startsWith("image/")) { Swal.fire("archivo no válido", "elige una imagen (PNG, JPG, GIF o WebP)", "warning"); return; }
  if (archivo.size > 5 * 1024 * 1024) { Swal.fire("imagen muy grande", "elige una imagen de menos de 5 MB", "warning"); return; }
  if (modoArchivo === "nuevo" && proyecto.sprites.length >= MAX_OBJETOS) { Swal.fire("máximo de objetos", "solo puedes tener " + MAX_OBJETOS + " objetos", "warning"); return; }

  guardarSpriteActual();
  podarImagenes(proyecto);
  if (Object.keys(proyecto.imagenes).length >= MAX_IMAGENES) {
    Swal.fire("máximo de imágenes propias", "puedes usar hasta " + MAX_IMAGENES + " imágenes de archivo por juego", "warning");
    return;
  }

  try {
    const datos = await reducirImagen(archivo, 128);
    let id;
    do { id = "u:" + Math.random().toString(36).slice(2, 8); } while (!id.slice(2) || id in proyecto.imagenes);
    const nombre = archivo.name.replace(/\.[^.]+$/, "").slice(0, 20) || "imagen";
    proyecto.imagenes[id] = { n: nombre, d: datos };
    PERSONALES = proyecto.imagenes;

    if (modoArchivo === "nuevo") {
      let nom = nombre, k = 2;
      while (proyecto.sprites.some(s => s.name === nom)) nom = nombre + " " + k++;
      proyecto.sprites.push({ name: nom, img: id, x: 0, y: 0, size: 100, ws: vacio() });
      cargarSprite(proyecto.sprites.length - 1);
    } else {
      proyecto.sprites[actual].img = id;
      pintarObjetos();
    }
  } catch (error) {
    Swal.fire("error", error.message, "error");
  }
}

function avisar(titulo, icono) {
  Swal.fire({ toast: true, position: "top-end", icon: icono, title: titulo, showConfirmButton: false, timer: 2500 });
}

function correrJuego() {
  document.getElementById("prueba-puntos").textContent = "";
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
  const copia = JSON.parse(JSON.stringify(proyecto));
  podarImagenes(copia);
  const datos = JSON.stringify(copia);
  if (datos.length > 300000) { Swal.fire("proyecto muy grande", "reduce los bloques, objetos o imágenes", "warning"); return; }

  try {
    // El proyecto completo va aparte (juegosdatos) para que la galería cargue rápido
    const ref = firebase.database().ref("juegos").push();
    await firebase.database().ref("juegosdatos/" + ref.key).set(datos);
    await ref.set({
      uid, titulo,
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
    const limpias = {};
    const crudas = p.imagenes && typeof p.imagenes === "object" && !Array.isArray(p.imagenes) ? p.imagenes : {};
    Object.entries(crudas).slice(0, MAX_IMAGENES).forEach(([id, v]) => {
      if (/^u:[a-z0-9]{1,12}$/.test(id) && v && typeof v.d === "string" && v.d.startsWith("data:image/")) {
        limpias[id] = { n: String(v.n || "imagen").slice(0, 20), d: v.d };
      }
    });
    p.imagenes = limpias;
    return p;
  } catch (e) { return null; }
}

async function obtenerProyecto(juego) {
  let texto = juego.proyecto; // los juegos antiguos guardaban el proyecto dentro del propio registro
  if (!texto) {
    const snap = await firebase.database().ref("juegosdatos/" + juego.id).once("value");
    texto = snap.val();
  }
  return leerProyecto(texto);
}

/* ---------- Top global de puntuaciones ---------- */
let topRef = null;
let avisoSesion = false;

function guardarPuntuacion(juegoId, puntos) {
  const uid = localStorage.getItem("uid");
  if (!uid || !auth.currentUser) {
    if (!avisoSesion) { avisoSesion = true; avisar("inicia sesión para guardar tu puntuación", "info"); }
    return;
  }
  firebase.database().ref(`puntuaciones/${juegoId}/${uid}`).transaction(actual =>
    (actual && actual.puntos >= puntos) ? undefined : {
      puntos,
      autor: localStorage.getItem("nombre") || "anónimo",
      fecha: firebase.database.ServerValue.TIMESTAMP
    }
  ).then(r => { if (r.committed) avisar("¡nueva mejor puntuación: " + puntos + "!", "success"); })
   .catch(error => console.warn("No se pudo guardar la puntuación:", error.message));
}

function cerrarTop() {
  if (topRef) { topRef.off(); topRef = null; }
}

function mostrarTop(juegoId) {
  cerrarTop();
  const lista = document.getElementById("top-lista");
  lista.innerHTML = "";
  topRef = firebase.database().ref("puntuaciones/" + juegoId).orderByChild("puntos").limitToLast(10);
  topRef.on("value", snap => {
    const filas = [];
    snap.forEach(h => {
      const v = h.val();
      if (v && typeof v.puntos === "number") filas.push({ uid: h.key, autor: v.autor, puntos: v.puntos });
    });
    filas.sort((a, b) => b.puntos - a.puntos);

    lista.innerHTML = "";
    if (!filas.length) {
      const vacio = document.createElement("li");
      vacio.textContent = "Aún no hay puntuaciones. ¡Sé el primero!";
      lista.appendChild(vacio);
      return;
    }
    const miUid = localStorage.getItem("uid");
    const medallas = ["🥇", "🥈", "🥉"];
    filas.forEach((f, i) => {
      const li = document.createElement("li");
      if (f.uid === miUid) li.className = "top-yo";
      li.textContent = (medallas[i] || (i + 1) + ".") + " " + (f.autor || "anónimo") + " — " + f.puntos;
      lista.appendChild(li);
    });
  }, () => { lista.textContent = "No se pudo cargar el top."; });
}

async function jugarJuego(id) {
  const juego = juegosCache.find(j => j.id === id);
  let p = null;
  try { p = juego && await obtenerProyecto(juego); } catch (e) { /* sin datos */ }
  if (!p) { Swal.fire("error", "este juego no se puede abrir", "error"); return; }

  document.getElementById("modal-titulo").textContent = juego.titulo;
  avisoSesion = false;
  motorModal.onPuntuar = puntos => guardarPuntuacion(juego.id, puntos);
  mostrarTop(juego.id);
  $("#modal-juego").one("shown.bs.modal", () => {
    try { motorModal.iniciar(p); } catch (error) { Swal.fire("error en el juego", error.message, "error"); }
  }).modal("show");
}

async function remezclarJuego(id) {
  const juego = juegosCache.find(j => j.id === id);
  let p = null;
  try { p = juego && await obtenerProyecto(juego); } catch (e) { /* sin datos */ }
  if (!p) { Swal.fire("error", "este juego no se puede abrir", "error"); return; }

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
  try {
    await firebase.database().ref("juegosdatos/" + id).remove();
    await firebase.database().ref("juegos/" + id).remove();
  } catch (error) { Swal.fire("error", error.message, "error"); }
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
        if (j && typeof j.titulo === "string") juegosCache.push({ id: h.key, ...j });
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
  $.fn.modal.Constructor.prototype.enforceFocus = function () {}; // deja escribir en las preguntas del juego
  document.getElementById("archivo-objeto").addEventListener("change", archivoElegido);
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
  wsEditor.registerToolboxCategoryCallback("PROCEDURE", ws => Blockly.Procedures.flyoutCategory(ws).filter(el => {
    const tipo = el.getAttribute ? el.getAttribute("type") : el.type;
    return !["procedures_defreturn", "procedures_ifreturn", "procedures_callreturn"].includes(tipo);
  }));
  wsEditor.addChangeListener(e => {
    if (e.isUiEvent) return;
    clearTimeout(guardadoTimer);
    guardadoTimer = setTimeout(guardarBorrador, 1000);
  });
  if (window.ResizeObserver) {
    new ResizeObserver(() => Blockly.svgResize(wsEditor)).observe(document.getElementById("blockly-div"));
  } else {
    window.addEventListener("resize", () => Blockly.svgResize(wsEditor));
  }

  motorEditor = new Motor(document.getElementById("escenario"));
  motorModal = new Motor(document.getElementById("modal-canvas"));
  crearControlesTactiles(motorEditor, document.getElementById("pad-editor"));
  crearControlesTactiles(motorModal, document.getElementById("pad-modal"));
  motorEditor.onPuntuar = puntos => {
    document.getElementById("prueba-puntos").textContent =
      "Modo prueba: puntuación enviada " + puntos + " (solo se guarda en juegos publicados)";
  };
  $("#modal-juego").on("hidden.bs.modal", () => {
    motorModal.detener(); // guarda la última puntuación pendiente
    motorModal.onPuntuar = null;
    cerrarTop();
  });

  try { cargarSprite(0); } catch (error) { proyecto = proyectoInicial(); cargarSprite(0); }
  cargarJuegos();
})();