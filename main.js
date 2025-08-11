let currentIndex = 0;

// Reproduce audio al hacer clic en la imagen
document.getElementById("imagen").addEventListener("click", function () {
  document.getElementById("audio0").play();
});

// Control del carrusel
$('#myCarousel').on('slide.bs.carousel', function (e) {
  const totalItems = $(e.target).find('.item').length;
  currentIndex = $(e.target).find('.active').index();
  stop();

  const nextIndex = (e.direction === 'left')
    ? (currentIndex + 1) % totalItems
    : (currentIndex - 1 + totalItems) % totalItems;

  const scrollBottom = $(window).scrollTop() + $(window).height();
  const elFin = Math.abs(scrollBottom - $(document).height()) < 5;

  if (elFin) {
    if (nextIndex === 0) document.getElementById("audio1").play();
    if (nextIndex === 1) document.getElementById("audio0").play();
    if (nextIndex === 2) document.getElementById("audio2").play();
  }
});

function stop() {
  document.getElementById("audio0").pause();
  document.getElementById("audio1").pause();
  document.getElementById("audio2").pause();
}

function votar() {
  console.log("votaste por: " + currentIndex);
  firebase.database().ref("usuario/" + localStorage.getItem("uid", "")).update({ votacion: currentIndex })
  Swal.fire({
    title: "felididades, ya votaste!",
    icon: "success",
    draggable: true
  });
}
function contarVotos() {
  const snapshot = firebase.database().get("usuario");
  if (snapshot.exists()) {
    const usuarios = snapshot.val();
    let conteo = 0;

    for (let uid in usuarios) {
      if (usuarios[uid].hasOwnProperty("votación")) {
        conteo++;
        console.log("conteo:" + conteo)
      }
    }
  }
}
const firebaseConfig = {
  apiKey: "AIzaSyCN1EJvGLyw_BOU1dbBpP7ketKUIUh3r40",
  authDomain: "missasinfonia-web.firebaseapp.com",
  databaseURL: "https://missasinfonia-web-default-rtdb.firebaseio.com",
  projectId: "missasinfonia-web",
  storageBucket: "missasinfonia-web.firebasestorage.app",
  messagingSenderId: "72783203450",
  appId: "1:72783203450:web:fea90204c33294bdfabfc3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
auth = firebase.auth()
// Show/hide password onClick of button using Javascript only

// https://stackoverflow.com/questions/31224651/show-hide-password-onclick-of-button-using-javascript-only

function show() {
  var p = document.getElementById('pwd');
  p.setAttribute('type', 'text');
}

function hide() {
  var p = document.getElementById('pwd');
  p.setAttribute('type', 'password');
}

var pwShown = 0;

document.getElementById("eye").addEventListener("click", function () {
  if (pwShown == 0) {
    pwShown = 1;
    show();
  } else {
    pwShown = 0;
    hide();
  }
}, false);

if (localStorage.getItem("nombre") !== "") {
  document.getElementById("login").style.display = "none"
  document.getElementById("logout").style.display = "block"
} else {
  document.getElementById("login").style.display = "block"
  document.getElementById("logout").style.display = "none"
  document.getElementById("foto").src = "./OIP.webp"
  document.getElementById("name").innerText = "M.S.F.W"
  document.getElementById("foto").style.filter = "hue-rotate(" + Math.floor(Math.random() * 361) + ")"
}
function mostrar_login() {
  document.getElementById("overlay").style.display = "block"
}
function ocultar_login() {
  document.getElementById("overlay").style.display = "none"
  document.getElementById("login").style.display = "block"
  document.getElementById("logout").style.display = "none"
  localStorage.clear();
  document.getElementById("foto").src = "./OIP.webp"
  document.getElementById("foto").style.filter = "hue-rotate(" + Math.floor(Math.random() * 361) + ")"
  document.getElementById("name").innerText = "M.S.F.W"
}
function login() {
  correo = document.getElementById("email-input").value;
  contraseña = document.getElementById("pwd").value;
  auth.signInWithEmailAndPassword(correo, contraseña)
    .then(async (unapalabra) => {
      console.log(unapalabra)
      uid = unapalabra.user.uid;
      respuesta = await firebase.database().ref("usuario/" + uid).once("value");
      usuario = respuesta.val()
      localStorage.setItem("foto", usuario.foto);
      localStorage.setItem("nombre", usuario.name);
      localStorage.setItem("uid", uid);
      document.getElementById("foto").src = usuario.foto
      document.getElementById("name").innerText = usuario.name
      document.getElementById("login").style.display = "none"
      document.getElementById("logout").style.display = "block"
      Swal.fire({
        title: "iniciaste sesion",
        icon: "success",
        draggable: true
      });
      document.getElementById("overlay").style.display = "none"
    })
    .catch(error => {
      Swal.fire("error", error.message, "error")
    })
}
function crear_cuenta() {
  correo = document.getElementById("email-input").value;
  contraseña = document.getElementById("pwd").value;
  missaname = document.getElementById("missaname-input").value;
  foto = document.getElementById("photo-input").value;
  auth.createUserWithEmailAndPassword(correo, contraseña)
    .then(() => {
      Swal.fire({
        title: "cuenta creada, disfruta🤗",
        icon: "success",
        draggable: true
      });
      document.getElementById("overlay").style.display = "none"

      auth.signInWithEmailAndPassword(correo, contraseña)
        .then(async (unapalabra) => {
          uid = unapalabra.user.uid;

          firebase.database().ref("usuario/" + uid).set({
            foto: foto,
            name: missaname
          })
          login()
        })
        .catch(error => {
          Swal.fire("error", error.message, "error")
        })

    })
}
function recuperar() {
  correo = document.getElementById("email-input").value;
  auth.sendPasswordResetEmail(correo)
    .then(() => {
      Swal.fire({
        title: "gmail enviado, resivelo🔐",
        icon: "success",
        draggable: true
      });
      document.getElementById("overlay").style.display = "none"
    })
    .catch(error => {
      Swal.fire("error", error.message, "error")
    })
}
contarVotos();