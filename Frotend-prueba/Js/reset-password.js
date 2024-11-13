document.getElementById('resetPasswordForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const messageDiv = document.getElementById('message');

    // Cambiar el endpoint a /auth/reset-password
    const response = await fetch("http://127.0.0.1:8090/api/collections/users/auth/reset-password", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: email })
    });

    if (response.ok) {
        messageDiv.innerHTML = "<p>Se ha enviado un enlace a tu correo electrónico para restablecer la contraseña.</p>";
    } else {
        messageDiv.innerHTML = "<p style='color: red;'>Hubo un error al enviar el correo. Verifica tu correo electrónico.</p>";
    }
});
