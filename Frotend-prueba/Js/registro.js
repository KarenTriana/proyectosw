document.getElementById("registroForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const contraseña = document.getElementById("contraseña").value;
    const passwordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{5,}$/;

    if (!passwordPattern.test(contraseña)) {
        document.getElementById("message").textContent = "La contraseña debe tener al menos 5 caracteres, una letra mayúscula y un carácter especial.";
        document.getElementById("message").style.color = "red";
        return; // Evita que el formulario se envíe si la contraseña es inválida
    }

    const aceptaPoliticas = document.getElementById("aceptaPoliticas").checked;
    if (!aceptaPoliticas) {
        document.getElementById("errorMessage").textContent = "Debe aceptar las políticas de privacidad para registrarse.";
        return;
    }

    const usuario = {
        nombre: document.getElementById("nombre").value,
        apellidos: document.getElementById("apellidos").value,
        nombreUsuario: document.getElementById("nombreUsuario").value,
        email: document.getElementById("email").value,
        contraseña: document.getElementById("contraseña").value,
        direccion: document.getElementById("direccion").value,
        tipoDocumento: document.getElementById("tipoDocumento").value,
        numeroDocumento: document.getElementById("numeroDocumento").value
    };

    fetch("http://localhost:8080/usuarios/registrar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    })
    .then(response => response.json()) // Siempre parsea la respuesta como JSON
    .then(data => {
        if (data.error) {
            document.getElementById("message").textContent = data.error;
            document.getElementById("message").style.color = "red";
        } else {
            document.getElementById("message").textContent = data.message;
            document.getElementById("message").style.color = "green";
            window.location.href = "index.html"; //se redirige a la pagina principal
        }
    })
    .catch(error => {
        document.getElementById("message").textContent = "Error en el servidor.";
        document.getElementById("message").style.color = "red";
        console.error(error);
    });
});
