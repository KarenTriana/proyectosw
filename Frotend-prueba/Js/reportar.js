const pb = new PocketBase('http://127.0.0.1:8090'); // Cambia la URL si es necesario

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Refresca la sesión del usuario autenticado
        await pb.collection('users').authRefresh();
    } catch (error) {
        console.error("Error al refrescar la autenticación:", error);
        pb.authStore.clear(); // Limpia el estado de autenticación si el refresco falla
    }

    // Verifica si el usuario está autenticado
    verificarAutenticacion();

    // Actualiza los enlaces de autenticación
    actualizarEnlacesAutenticacion();

    // Obtén el ID de la publicación desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const publicationId = urlParams.get('id');
    
    console.log("Publication ID:", publicationId); // Verifica el ID de la publicación

    if (!publicationId) {
        alert('No se ha encontrado el ID de la publicación.');
        return;
    }

    // Selecciona los elementos del formulario
    const mensajeInput = document.getElementById('mensaje');
    const motivoInput = document.getElementById('motivo');
    const enviarReporteBtn = document.getElementById('enviarReporte');

    // Agrega un evento al botón "Enviar Reporte"
    enviarReporteBtn.addEventListener('click', async () => {
        const mensaje = mensajeInput.value;
        const motivo = motivoInput.value;

        if (!mensaje || !motivo) {
            alert('Por favor, complete todos los campos.');
            return;
        }

        // Obtenemos el usuario autenticado
        const user = pb.authStore.model;
        if (!user) {
            alert('Debes iniciar sesión para enviar un reporte.');
            return;
        }

        try {
            // Obtiene los detalles de la publicación para obtener el ID del usuario que la publicó
            const publicacion = await pb.collection('animal_post').getOne(publicationId);
            const userReportadoId = publicacion.user_id; // Accede a user_id directamente

            // Crea el objeto de reporte
            const reporte = {
                user_reporta: user.id, // ID del usuario autenticado
                user_reportado: userReportadoId, // ID del dueño de la publicación
                motivo: motivo, // El motivo seleccionado
                mensaje: mensaje // El mensaje del reporte
            };

            // Guarda el reporte en PocketBase
            await pb.collection('reportes').create(reporte);
            alert('Reporte enviado con éxito');

            // Resetea el formulario
            mensajeInput.value = '';
            motivoInput.value = 'inapropiado';
        } catch (error) {
            console.error('Error al enviar el reporte:', error);
            alert('Hubo un problema al enviar el reporte. Intenta nuevamente.');
        }
    });
});

// Función para verificar la autenticación antes de mostrar el formulario
function verificarAutenticacion() {
    if (!pb.authStore.isValid) {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = '/vista/login-pocketbase.html'; // Redirige a la página de inicio de sesión
    } else {
        document.getElementById('report-form').style.display = 'block'; // Muestra el formulario
    }
}

// Función para actualizar los enlaces de autenticación
function actualizarEnlacesAutenticacion() {
    if (pb.authStore.isValid) {
        // Si el usuario está autenticado, muestra los enlaces de usuario
        document.getElementById('auth-links').style.display = 'none';
        document.getElementById('user-links').style.display = 'block';
    } else {
        // Si no está autenticado, muestra los enlaces de login y registro
        document.getElementById('auth-links').style.display = 'block';
        document.getElementById('user-links').style.display = 'none';
    }
}

// Manejo de logout
document.getElementById('logout')?.addEventListener('click', () => {
    // Limpia el estado de autenticación en PocketBase
    pb.authStore.clear(); 

    // Limpia el token de PocketBase del almacenamiento local y sessionStorage si es necesario
    localStorage.removeItem('pb_token');
    sessionStorage.removeItem('pb_token');

    // Elimina cualquier otra información relacionada con la autenticación (si hay más claves)
    localStorage.removeItem('pb_user');
    sessionStorage.removeItem('pb_user');

    // Actualiza el estado de autenticación de la aplicación, por ejemplo, ocultando el contenido protegido
    // Puedes agregar lógica aquí para redirigir al usuario a la página de login, por ejemplo:
    window.location.href = '/login'; // Redirige a la página de login (ajusta según tu estructura)

    console.log("Sesión cerrada. El token y los datos de autenticación han sido eliminados.");

    // Recarga la página para garantizar que todo se actualice (si es necesario)
    window.location.reload();
});
