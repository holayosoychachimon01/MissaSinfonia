/* =========================================================
   Firebase
   ========================================================= */
const firebaseConfig = {
  apiKey: "AIzaSyCN1EJvGLyw_BOU1dbBpP7ketKUIUh3r40",
  authDomain: "missasinfonia-web.firebaseapp.com",
  databaseURL: "https://missasinfonia-web-default-rtdb.firebaseio.com",
  projectId: "missasinfonia-web",
  storageBucket: "missasinfonia-web.firebasestorage.app",
  messagingSenderId: "72783203450",
  appId: "1:72783203450:web:fea90204c33294bdfabfc3"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

/* =========================================================
   Carruseles de videos
   - Un string es el ID de un video de YouTube.
   - Un objeto { href, img, alt } muestra una imagen que abre el video en otra pestaña.
   ========================================================= */
const VIDEOS = [
  "1vd6_EnEnlU",
  "WajjbG1hvEI"
];

const ROSA_DE_GUADALUPE = [
  "2iXfRr6-vks",
  "qd-V7cwZRpQ",
  "sjyd6Me5w8M",
  "SlvehWQEpkQ",
  { href: "https://www.youtube.com/watch?v=dixSnPW0mUs", img: "r0sa de guadalupe.jpg", alt: "Vista previa del video" },
  "GW0pTWsVzpU",
  "6Zlqg3a8-iE",
  "Pi0kzaQpAMI",
  "gXboTNcZLcY",
  "28kL2_G7UTQ",
  "sodXf4sPT08",
  "wNMV-29OD_E",
  "sQY_PzHdlqI"
];

function crearCarruselVideos(contenedorId, items) {
  const carruselId = contenedorId + "-carousel";

  const slides = items.map((item, i) => {
    const contenido = (typeof item === "string")
      ? `<iframe class="embed-responsive-item"
            src="https://www.youtube.com/embed/${item}?enablejsapi=1"
            title="Video ${i + 1}" loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`
      : `<a class="embed-responsive-item video-link" href="${item.href}" target="_blank" rel="noopener">
            <img src="${item.img}" alt="${item.alt || "Vista previa del video"}">
         </a>`;

    return `<div class="item${i === 0 ? " active" : ""}">
              <div class="embed-responsive embed-responsive-16by9">${contenido}</div>
            </div>`;
  }).join("");

  $("#" + contenedorId).html(`
    <div id="${carruselId}" class="carousel slide video-carousel" data-interval="false">
      <div class="carousel-inner">${slides}</div>
      <a class="left carousel-control" href="#${carruselId}" data-slide="prev">
        <span class="glyphicon glyphicon-chevron-left"></span>
        <span class="sr-only">Anterior</span>
      </a>
      <a class="right carousel-control" href="#${carruselId}" data-slide="next">
        <span class="glyphicon glyphicon-chevron-right"></span>
        <span class="sr-only">Siguiente</span>
      </a>
    </div>
    <p class="video-contador">1 / ${items.length}</p>
  `);

  const $carrusel = $("#" + carruselId);
  $carrusel.carousel({ interval: false });

  // Pausa el video actual al cambiar de slide
  $carrusel.on("slide.bs.carousel", function () {
    $(this).find("iframe").each(function () {
      this.contentWindow.postMessage(
        JSON.stringify({ event: "command", func: "pauseVideo", args: "" }), "*"
      );
    });
  });

  // Actualiza el contador "n / total"
  $carrusel.on("slid.bs.carousel", function (e) {
    $("#" + contenedorId).find(".video-contador")
      .text(($(e.relatedTarget).index() + 1) + " / " + items.length);
  });
}

crearCarruselVideos("videos-contenedor", VIDEOS);
crearCarruselVideos("rosa-contenedor", ROSA_DE_GUADALUPE);

/* =========================================================
   Audio y carrusel de votación
   ========================================================= */
let currentIndex = 0;
const audioPorSlide = ["audio1", "audio0", "audio2"]; // slide 0 -> audio1, 1 -> audio0, 2 -> audio2

// Reproduce audio al hacer clic en la imagen
document.getElementById("imagen").addEventListener("click", function () {
  document.getElementById("audio0").play();
});

function detenerAudios() {
  ["audio0", "audio1", "audio2"].forEach(id => document.getElementById(id).pause());
}

$("#myCarousel").on("slide.bs.carousel", function (e) {
  // El slide al que se va a mover es el que se vota
  const nextIndex = $(e.relatedTarget).index();
  currentIndex = nextIndex;
  detenerAudios();

  const scrollBottom = $(window).scrollTop() + $(window).height();
  const elFin = Math.abs(scrollBottom - $(document).height()) < 5;

  if (elFin && audioPorSlide[nextIndex]) {
    document.getElementById(audioPorSlide[nextIndex]).play();
  }
});

async function votar() {
  const uid = localStorage.getItem("uid");
  if (!uid) {
    Swal.fire("inicia sesion", "tienes que iniciar sesion para votar", "warning");
    mostrar_login();
    return;
  }

  try {
    await firebase.database().ref("usuario/" + uid).update({ votacion: currentIndex });
    const conteo = await contarVotos();
    Swal.fire({
      title: "felicidades, ya votaste!",
      html: conteo.map((n, i) => `Opción ${i + 1}: ${n} voto(s)`).join("<br>"),
      icon: "success"
    });
  } catch (error) {
    Swal.fire("error", error.message, "error");
  }
}

// Devuelve un arreglo con los votos de cada opción: [opción0, opción1, opción2]
async function contarVotos() {
  const totalOpciones = $("#myCarousel .item").length;
  const conteo = new Array(totalOpciones).fill(0);
  const snapshot = await firebase.database().ref("usuario").once("value");

  if (snapshot.exists()) {
    snapshot.forEach(hijo => {
      const voto = hijo.val().votacion;
      if (Number.isInteger(voto) && voto >= 0 && voto < totalOpciones) {
        conteo[voto]++;
      }
    });
  }
  console.log("conteo:", conteo);
  return conteo;
}

/* =========================================================
   Mostrar / ocultar contraseña
   ========================================================= */
document.getElementById("eye").addEventListener("click", function () {
  const campo = document.getElementById("pwd");
  const visible = campo.getAttribute("type") === "text";
  campo.setAttribute("type", visible ? "password" : "text");
  this.classList.toggle("fa-eye", visible);
  this.classList.toggle("fa-eye-slash", !visible);
});

/* =========================================================
   Sesión
   ========================================================= */
const FOTO_DEFAULT = "./OIP.webp";
const NOMBRE_DEFAULT = "M.S.F.W";

function mostrarInvitado() {
  const foto = document.getElementById("foto");
  document.getElementById("login").style.display = "block";
  document.getElementById("logout").style.display = "none";
  foto.src = FOTO_DEFAULT;
  foto.style.filter = "hue-rotate(" + Math.floor(Math.random() * 361) + "deg)";
  document.getElementById("name").innerText = NOMBRE_DEFAULT;
  if (typeof actualizarZonaMemes === "function") actualizarZonaMemes();
}

function mostrarSesion(fotoUrl, nombre) {
  const foto = document.getElementById("foto");
  document.getElementById("login").style.display = "none";
  document.getElementById("logout").style.display = "block";
  foto.src = fotoUrl;
  foto.style.filter = "none";
  document.getElementById("name").innerText = nombre;
  if (typeof actualizarZonaMemes === "function") actualizarZonaMemes();
}

// Al cargar la página: restaura la sesión guardada (si existe)
const nombreGuardado = localStorage.getItem("nombre");
if (nombreGuardado) {
  mostrarSesion(localStorage.getItem("foto") || FOTO_DEFAULT, nombreGuardado);
} else {
  mostrarInvitado();
}

function mostrar_login() {
  document.getElementById("overlay").style.display = "block";
}

function ocultar_login() {
  document.getElementById("overlay").style.display = "none";
  auth.signOut().catch(error => console.warn(error));
  localStorage.clear();
  mostrarInvitado();
}

async function login(silencioso = false) {
  const correo = document.getElementById("email-input").value;
  const clave = document.getElementById("pwd").value;

  try {
    const credencial = await auth.signInWithEmailAndPassword(correo, clave);
    const uid = credencial.user.uid;
    const respuesta = await firebase.database().ref("usuario/" + uid).once("value");
    const usuario = respuesta.val() || {};
    const nombre = usuario.name || correo.split("@")[0];
    const foto = usuario.foto || FOTO_DEFAULT;

    localStorage.setItem("foto", foto);
    localStorage.setItem("nombre", nombre);
    localStorage.setItem("uid", uid);

    mostrarSesion(foto, nombre);
    document.getElementById("overlay").style.display = "none";

    if (!silencioso) {
      Swal.fire({ title: "iniciaste sesion", icon: "success", draggable: true });
    }
  } catch (error) {
    Swal.fire("error", error.message, "error");
  }
}

async function crear_cuenta() {
  const correo = document.getElementById("email-input").value;
  const clave = document.getElementById("pwd").value;
  const missaname = document.getElementById("missaname-input").value.trim() || correo.split("@")[0];
  const foto = document.getElementById("photo-input").value.trim() || FOTO_DEFAULT;

  try {
    // createUser ya deja la sesión iniciada
    const credencial = await auth.createUserWithEmailAndPassword(correo, clave);
    await firebase.database().ref("usuario/" + credencial.user.uid).set({
      foto: foto,
      name: missaname
    });
    await login(true);
    Swal.fire({ title: "cuenta creada, disfruta🤗", icon: "success", draggable: true });
  } catch (error) {
    Swal.fire("error", error.message, "error");
  }
}

function recuperar() {
  const correo = document.getElementById("email-input").value;
  if (!correo) {
    Swal.fire("falta tu correo", "escribe tu correo para enviarte el enlace", "warning");
    return;
  }

  auth.sendPasswordResetEmail(correo)
    .then(() => {
      Swal.fire({ title: "gmail enviado, recíbelo🔐", icon: "success", draggable: true });
      document.getElementById("overlay").style.display = "none";
    })
    .catch(error => {
      Swal.fire("error", error.message, "error");
    });
}

// Muestra el conteo en consola al cargar (si las reglas de Firebase lo permiten)
contarVotos().catch(error => console.warn("No se pudo leer el conteo:", error.message));