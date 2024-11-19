// Inicializa PocketBase con la URL de tu servidor
const pb = new PocketBase('http://127.0.0.1:8090'); // Cambia esta URL si estás en producción

// Referencia al formulario
const resetPasswordForm = document.getElementById('resetPasswordForm');
const messageDiv = document.getElementById('message');

// Manejo del envío del formulario
resetPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevenir el envío del formulario por defecto

    const email = document.getElementById('email').value;

    try {
        // Llamada al método de recuperación de contraseña de PocketBase
        await pb.collection('users').requestPasswordReset(email);

        // Mostrar mensaje de éxito
        messageDiv.innerHTML = `
            <div class="alert alert-success" role="alert">
                Se ha enviado un enlace de recuperación a ${email}. Por favor, revisa tu correo electrónico.
            </div>
        `;
    } catch (error) {
        console.error('Error al solicitar restablecimiento de contraseña:', error);

        // Mostrar mensaje de error
        messageDiv.innerHTML = `
            <div class="alert alert-danger" role="alert">
                Ocurrió un error al solicitar el restablecimiento. Verifica que el correo esté registrado.
            </div>
        `;
    }
});
