// login.js
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Validación básica de entrada
    if (email && password) {
        fetch("http://localhost:8080/usuarios/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password }) //Valores que se envia al backen (/usuarios/login) el cual verifica que esten ingrezados
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("Inicio de sesión exitoso");
                window.location.href = "index.html"; //se redirige a la pagina principal
            } else {
                document.getElementById("errorMessage").textContent = "Email o contraseña incorrectos";
            }
        })
        .catch(error => {
            console.error("Error:", error);
            document.getElementById("errorMessage").textContent = "Error al iniciar sesión";
        });
    } else {
        document.getElementById("errorMessage").textContent = "Por favor, ingrese ambos campos";
    }

   
   
});

document.getElementById("registerButton").addEventListener("click", function() { //Boton registrar
    window.location.href = "registro.html"; 
});

$(document).ready(function(){
    $(".owl-carousel").owlCarousel({
        items: 3,
        loop: true,
        margin: 10,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true
    });
});
