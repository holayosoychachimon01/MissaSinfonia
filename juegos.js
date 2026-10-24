/* =========================================================
   ZONA GAME
   ========================================================= */

function barajar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/* ---------- Juego 1: Memorama Missa ---------- */
// Cambia o agrega imágenes aquí (cada una forma una pareja)
const MEMORAMA_IMAGENES = [
  "missa-no-sinfonia.png",
  "no hay sistema missa.png",
  "OIP.webp",
  "r0sa de guadalupe.jpg",
  "https://pm1.narvii.com/6653/b5acf4638182424af8930db573de1ec1873016eb_hq.jpg",
  "https://i.kym-cdn.com/photos/images/original/002/633/881/cea.jpg"
];

let memoAbiertas = [];
let memoBloqueo = false;
let memoMovs = 0;
let memoParejas = 0;

function iniciarMemorama() {
  const tablero = document.getElementById("memorama-tablero");
  tablero.innerHTML = "";
  memoAbiertas = [];
  memoBloqueo = false;
  memoMovs = 0;
  memoParejas = 0;
  document.getElementById("memorama-movs").textContent = 0;

  barajar([...MEMORAMA_IMAGENES, ...MEMORAMA_IMAGENES]).forEach(src => {
    const carta = document.createElement("button");
    carta.type = "button";
    carta.className = "memo-carta";
    carta.dataset.src = src;

    const dorso = document.createElement("span");
    dorso.className = "memo-dorso";
    dorso.textContent = "?";

    const frente = document.createElement("img");
    frente.className = "memo-frente";
    frente.src = src;
    frente.alt = "Carta del memorama";
    frente.draggable = false;

    carta.append(dorso, frente);
    carta.addEventListener("click", () => voltearCarta(carta));
    tablero.appendChild(carta);
  });
}

function voltearCarta(carta) {
  if (memoBloqueo || carta.classList.contains("volteada") || carta.classList.contains("pareja")) return;

  carta.classList.add("volteada");
  memoAbiertas.push(carta);
  if (memoAbiertas.length < 2) return;

  memoMovs++;
  document.getElementById("memorama-movs").textContent = memoMovs;
  const [a, b] = memoAbiertas;
  memoAbiertas = [];

  if (a.dataset.src === b.dataset.src) {
    a.classList.add("pareja");
    b.classList.add("pareja");
    memoParejas++;
    if (memoParejas === MEMORAMA_IMAGENES.length) {
      Swal.fire({ title: "¡ganaste!", text: "lo lograste en " + memoMovs + " movimientos", icon: "success" });
    }
  } else {
    memoBloqueo = true;
    setTimeout(() => {
      a.classList.remove("volteada");
      b.classList.remove("volteada");
      memoBloqueo = false;
    }, 800);
  }
}

/* ---------- Juego 2: Atrapa a Missa ---------- */
const ATRAPA_SEGUNDOS = 20;
let atrapaPuntos = 0;
let atrapaTiempo = ATRAPA_SEGUNDOS;
let atrapaTimer = null;
let atrapaMovimiento = null;

function mostrarRecordAtrapa() {
  document.getElementById("atrapa-record").textContent = localStorage.getItem("atrapa-record") || 0;
}

function moverObjetivo() {
  const arena = document.getElementById("atrapa-arena");
  const objetivo = document.getElementById("atrapa-objetivo");
  const maxX = Math.max(0, arena.clientWidth - objetivo.offsetWidth);
  const maxY = Math.max(0, arena.clientHeight - objetivo.offsetHeight);
  objetivo.style.left = Math.floor(Math.random() * (maxX + 1)) + "px";
  objetivo.style.top = Math.floor(Math.random() * (maxY + 1)) + "px";
}

function detenerAtrapa() {
  clearInterval(atrapaTimer);
  clearInterval(atrapaMovimiento);
  atrapaTimer = null;
  atrapaMovimiento = null;
}

function iniciarAtrapa() {
  detenerAtrapa();
  atrapaPuntos = 0;
  atrapaTiempo = ATRAPA_SEGUNDOS;
  document.getElementById("atrapa-puntos").textContent = 0;
  document.getElementById("atrapa-tiempo").textContent = atrapaTiempo;
  document.getElementById("atrapa-objetivo").style.display = "block";
  moverObjetivo();

  atrapaMovimiento = setInterval(moverObjetivo, 800);
  atrapaTimer = setInterval(() => {
    atrapaTiempo--;
    document.getElementById("atrapa-tiempo").textContent = atrapaTiempo;
    if (atrapaTiempo <= 0) terminarAtrapa();
  }, 1000);
}

function terminarAtrapa() {
  detenerAtrapa();
  document.getElementById("atrapa-objetivo").style.display = "none";

  const record = Number(localStorage.getItem("atrapa-record")) || 0;
  let mensaje = "atrapaste a Missa " + atrapaPuntos + " veces";
  if (atrapaPuntos > record) {
    localStorage.setItem("atrapa-record", atrapaPuntos);
    mensaje += " ¡nuevo récord!";
  }
  mostrarRecordAtrapa();
  Swal.fire({ title: "se acabó el tiempo", text: mensaje, icon: "info" });
}

document.getElementById("atrapa-objetivo").addEventListener("click", function () {
  if (!atrapaTimer) return;
  atrapaPuntos++;
  document.getElementById("atrapa-puntos").textContent = atrapaPuntos;
  moverObjetivo();
});

iniciarMemorama();
mostrarRecordAtrapa();

/* =========================================================
   ZONA DE MEMES
   Las imágenes se reducen (máx. 800 px) y se guardan en Realtime Database
   en el nodo "memes". Solo se puede subir con sesión iniciada.
   ========================================================= */
let memesCache = [];

function estaLogueado() {
  return !!localStorage.getItem("uid");
}

// main.js llama a esta función cada vez que cambia la sesión
function actualizarZonaMemes() {
  const logueado = estaLogueado();
  document.getElementById("meme-form").style.display = logueado ? "block" : "none";
  document.getElementById("meme-aviso").style.display = logueado ? "none" : "block";
  renderMemes();
}

function renderMemes() {
  const galeria = document.getElementById("meme-galeria");
  galeria.innerHTML = "";

  if (!memesCache.length) {
    const vacio = document.createElement("p");
    vacio.textContent = "Aún no hay memes. ¡Sube el primero!";
    galeria.appendChild(vacio);
    return;
  }

  const miUid = localStorage.getItem("uid");

  memesCache.slice().reverse().forEach(meme => {
    const tarjeta = document.createElement("div");
    tarjeta.className = "meme";

    if (typeof meme.img === "string" && meme.img.startsWith("data:image/")) {
      const imagen = document.createElement("img");
      imagen.src = meme.img;
      imagen.alt = meme.titulo || "Meme";
      tarjeta.appendChild(imagen);
    }

    if (meme.titulo) {
      const titulo = document.createElement("h4");
      titulo.textContent = meme.titulo;
      tarjeta.appendChild(titulo);
    }

    if (meme.texto) {
      const texto = document.createElement("p");
      texto.className = "meme-texto";
      texto.textContent = meme.texto;
      tarjeta.appendChild(texto);
    }

    const autor = document.createElement("p");
    autor.className = "meme-autor";
    autor.textContent = "por " + (meme.autor || "anónimo");
    tarjeta.appendChild(autor);

    if (miUid && meme.uid === miUid) {
      const borrar = document.createElement("button");
      borrar.type = "button";
      borrar.className = "btn btn-danger btn-xs";
      borrar.textContent = "borrar";
      borrar.addEventListener("click", () => borrarMeme(meme.id));
      tarjeta.appendChild(borrar);
    }

    tarjeta.appendChild(crearSocial("memes", meme.id));
    galeria.appendChild(tarjeta);
  });
}

function cargarMemes() {
  firebase.database().ref("memes").orderByKey().limitToLast(30).on("value",
    snapshot => {
      memesCache = [];
      snapshot.forEach(hijo => {
        const meme = hijo.val();
        const imgOk = meme && typeof meme.img === "string" && meme.img.startsWith("data:image/");
        const textoOk = meme && typeof meme.texto === "string" && meme.texto.length > 0;
        if (imgOk || textoOk) {
          memesCache.push({ id: hijo.key, ...meme });
        }
      });
      renderMemes();
    },
    error => {
      console.warn("No se pudieron cargar los memes:", error.message);
      document.getElementById("meme-galeria").textContent = "No se pudieron cargar los memes.";
    });
}

function comprimirImagen(archivo, maximo, calidad) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const escala = Math.min(1, maximo / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", calidad));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen"));
    };
    img.src = url;
  });
}

async function subirMeme() {
  const uid = localStorage.getItem("uid");
  if (!uid || !auth.currentUser) {
    Swal.fire("inicia sesion", "tienes que iniciar sesion para subir memes", "warning");
    mostrar_login();
    return;
  }

  const inputArchivo = document.getElementById("meme-archivo");
  const archivo = inputArchivo.files[0];
  const texto = document.getElementById("meme-texto").value.trim().slice(0, 280);
  if (!archivo && !texto) {
    Swal.fire("publicación vacía", "escribe un texto o elige una imagen", "warning");
    return;
  }
  if (archivo && !archivo.type.startsWith("image/")) {
    Swal.fire("archivo no válido", "solo se pueden subir imágenes", "warning");
    return;
  }
  if (archivo && archivo.size > 8 * 1024 * 1024) {
    Swal.fire("imagen muy grande", "elige una imagen de menos de 8 MB", "warning");
    return;
  }

  const boton = document.getElementById("meme-subir");
  boton.disabled = true;

  try {
    const publicacion = {
      uid: uid,
      autor: localStorage.getItem("nombre") || "anónimo",
      titulo: document.getElementById("meme-titulo").value.trim().slice(0, 60),
      texto: texto,
      fecha: firebase.database.ServerValue.TIMESTAMP
    };
    if (archivo) publicacion.img = await comprimirImagen(archivo, 800, 0.7);
    await firebase.database().ref("memes").push(publicacion);
    inputArchivo.value = "";
    document.getElementById("meme-titulo").value = "";
    document.getElementById("meme-texto").value = "";
    Swal.fire({ title: "publicado", icon: "success" });
  } catch (error) {
    Swal.fire("error", error.message, "error");
  } finally {
    boton.disabled = false;
  }
}

async function borrarMeme(id) {
  const confirmacion = await Swal.fire({
    title: "¿borrar este meme?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "borrar",
    cancelButtonText: "cancelar"
  });
  if (!confirmacion.isConfirmed) return;

  try {
    await firebase.database().ref("memes/" + id).remove();
  } catch (error) {
    Swal.fire("error", error.message, "error");
  }
}

cargarMemes();
actualizarZonaMemes();