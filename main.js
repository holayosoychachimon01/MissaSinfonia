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
  firebase.database().ref("Votacion").update({ TisaFun: currentIndex })
  Swal.fire({
    title: "felididades, ya votaste!",
    icon: "success",
    draggable: true
  });
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

function mostrar_login() {
  document.getElementById("overlay").style.display = "block"
}
function login() {
  correo = document.getElementById("email-input").value;
  contraseña = document.getElementById("pwd").value;
  auth.signInWithEmailAndPassword(correo, contraseña)
    .then(() => {
      Swal.fire({
        title: "iniciaste sesion",
        icon: "success",
        draggable: true
      });
  document.getElementById("overlay").style.display = "block"
    })
    .catch(error=>{
      Swal.fire("error",error.message,"error")
    })
}
function crear_cuenta() {
  correo = document.getElementById("email-input").value;
  contraseña = document.getElementById("pwd").value;
  auth.createUserWithEmailAndPassword(correo, contraseña)
    .then(() => {
      Swal.fire({
        title: "cuenta creada, disfruta🤗",
        icon: "success",
        draggable: true
      });
  document.getElementById("overlay").style.display = "none"
    })
    .catch(error=>{
      Swal.fire("error",error.message,"error")
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
    .catch(error=>{
      Swal.fire("error",error.message,"error")
    })
}