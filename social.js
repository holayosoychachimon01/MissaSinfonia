/* =========================================================
   LIKES Y COMENTARIOS (memes y juegos)
   Firebase:
     likes/{tipo}/{idElemento}/{uid} = true
     comentarios/{tipo}/{idElemento}/{idComentario} = { uid, autor, texto, fecha }
   tipo: "memes" | "juegos"
   ========================================================= */
const SOCIAL = {
  likes: { memes: {}, juegos: {} },
  coms: { memes: {}, juegos: {} },
  widgets: new Map(),   // "tipo/id" -> elementos del widget
  abiertos: new Set()   // comentarios desplegados (se conservan al redibujar)
};
const MAX_COMENTARIO = 200;

function usuarioActivo() {
  const uid = localStorage.getItem("uid");
  return uid && auth.currentUser ? uid : null;
}

function pedirSesion(mensaje) {
  Swal.fire("inicia sesion", mensaje, "warning");
  mostrar_login();
}

async function alternarLike(tipo, id) {
  const uid = usuarioActivo();
  if (!uid) { pedirSesion("tienes que iniciar sesion para dar like"); return; }
  const ref = firebase.database().ref(`likes/${tipo}/${id}/${uid}`);
  const yaLike = !!(SOCIAL.likes[tipo][id] && SOCIAL.likes[tipo][id][uid]);
  try {
    if (yaLike) await ref.remove(); else await ref.set(true);
  } catch (error) {
    Swal.fire("error", error.message, "error");
  }
}

async function enviarComentario(tipo, id, input, boton) {
  const uid = usuarioActivo();
  if (!uid) { pedirSesion("tienes que iniciar sesion para comentar"); return; }
  const texto = input.value.trim().slice(0, MAX_COMENTARIO);
  if (!texto) return;

  boton.disabled = true;
  try {
    await firebase.database().ref(`comentarios/${tipo}/${id}`).push({
      uid,
      autor: localStorage.getItem("nombre") || "anónimo",
      texto,
      fecha: firebase.database.ServerValue.TIMESTAMP
    });
    input.value = "";
  } catch (error) {
    Swal.fire("error", error.message, "error");
  } finally {
    boton.disabled = false;
  }
}

async function borrarComentario(tipo, id, idComentario) {
  try {
    await firebase.database().ref(`comentarios/${tipo}/${id}/${idComentario}`).remove();
  } catch (error) {
    Swal.fire("error", error.message, "error");
  }
}

// Actualiza un widget con los datos más recientes
function pintarSocial(clave) {
  const w = SOCIAL.widgets.get(clave);
  if (!w) return;
  const { tipo, id } = w;
  const miUid = localStorage.getItem("uid");

  const likes = SOCIAL.likes[tipo][id] || {};
  const comentarios = Object.entries(SOCIAL.coms[tipo][id] || {}).sort((a, b) => (a[0] < b[0] ? -1 : 1));

  w.btnLike.textContent = (miUid && likes[miUid] ? "❤️ " : "🤍 ") + Object.keys(likes).length;
  w.btnCom.textContent = "💬 " + comentarios.length;
  w.panel.style.display = SOCIAL.abiertos.has(clave) ? "block" : "none";
  w.form.style.display = miUid ? "flex" : "none";
  w.aviso.style.display = miUid ? "none" : "block";

  w.lista.innerHTML = "";
  if (!comentarios.length) {
    const vacio = document.createElement("p");
    vacio.className = "com-vacio";
    vacio.textContent = "Sé el primero en comentar.";
    w.lista.appendChild(vacio);
  }
  comentarios.forEach(([idCom, c]) => {
    if (!c || typeof c.texto !== "string") return;
    const item = document.createElement("div");
    item.className = "com-item";

    const autor = document.createElement("b");
    autor.textContent = c.autor || "anónimo";
    const texto = document.createElement("span");
    texto.textContent = " " + c.texto;
    item.append(autor, texto);

    if (typeof c.fecha === "number") {
      const fecha = document.createElement("small");
      fecha.textContent = " " + new Date(c.fecha).toLocaleDateString();
      item.appendChild(fecha);
    }
    if (miUid && c.uid === miUid) {
      const borrar = document.createElement("button");
      borrar.type = "button";
      borrar.className = "com-borrar";
      borrar.title = "borrar comentario";
      borrar.textContent = "✕";
      borrar.addEventListener("click", () => borrarComentario(tipo, id, idCom));
      item.appendChild(borrar);
    }
    w.lista.appendChild(item);
  });
}

// Crea el widget (like + comentarios) de un meme o juego
function crearSocial(tipo, id) {
  const clave = tipo + "/" + id;
  const caja = document.createElement("div");
  caja.className = "social";

  const barra = document.createElement("div");
  barra.className = "social-barra";
  const btnLike = document.createElement("button");
  btnLike.type = "button";
  btnLike.className = "btn btn-default btn-xs";
  btnLike.addEventListener("click", () => alternarLike(tipo, id));
  const btnCom = document.createElement("button");
  btnCom.type = "button";
  btnCom.className = "btn btn-default btn-xs";
  btnCom.addEventListener("click", () => {
    if (SOCIAL.abiertos.has(clave)) SOCIAL.abiertos.delete(clave); else SOCIAL.abiertos.add(clave);
    pintarSocial(clave);
  });
  barra.append(btnLike, btnCom);

  const panel = document.createElement("div");
  panel.className = "com-panel";
  const lista = document.createElement("div");
  lista.className = "com-lista";

  const form = document.createElement("div");
  form.className = "com-form";
  const input = document.createElement("input");
  input.type = "text";
  input.className = "form-control input-sm";
  input.maxLength = MAX_COMENTARIO;
  input.placeholder = "escribe un comentario";
  const enviar = document.createElement("button");
  enviar.type = "button";
  enviar.className = "btn btn-primary btn-sm";
  enviar.textContent = "enviar";
  enviar.addEventListener("click", () => enviarComentario(tipo, id, input, enviar));
  input.addEventListener("keydown", e => { if (e.key === "Enter") enviar.click(); });
  form.append(input, enviar);

  const aviso = document.createElement("p");
  aviso.className = "com-vacio";
  aviso.textContent = "Inicia sesión para comentar.";

  panel.append(lista, form, aviso);
  caja.append(barra, panel);

  SOCIAL.widgets.set(clave, { tipo, id, caja, btnLike, btnCom, panel, lista, form, aviso });
  pintarSocial(clave);
  return caja;
}

function refrescarSocial(tipo) {
  SOCIAL.widgets.forEach((w, clave) => {
    if (!w.caja.isConnected) { SOCIAL.widgets.delete(clave); return; }
    if (w.tipo === tipo) pintarSocial(clave);
  });
}

["memes", "juegos"].forEach(tipo => {
  firebase.database().ref("likes/" + tipo).on("value",
    snap => { SOCIAL.likes[tipo] = snap.val() || {}; refrescarSocial(tipo); },
    error => console.warn("No se pudieron leer los likes:", error.message));
  firebase.database().ref("comentarios/" + tipo).on("value",
    snap => { SOCIAL.coms[tipo] = snap.val() || {}; refrescarSocial(tipo); },
    error => console.warn("No se pudieron leer los comentarios:", error.message));
});
