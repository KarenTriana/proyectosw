const pb = new PocketBase('http://127.0.0.1:8090'); // Cambia a la URL de tu servidor PocketBase

// Importa las funciones necesarias
import verificarAutenticacion from './autenticacion.js'; // Importación por defecto

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

// Llamada a la función para actualizar los enlaces al cargar la página
window.onload = function() {
    // Se asegura de que el estado de autenticación esté disponible
    verificarAutenticacion(); // Verifica la autenticación y actualiza los enlaces
    actualizarEnlacesAutenticacion(); // Actualiza los enlaces de autenticación
};

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



// Inicializar el carrusel de Owl Carousel
$(document).ready(function() {
    $(".owl-carousel").owlCarousel({
        loop: true,
        margin: 10,
        nav: true,
        items: 4,
        autoplay: true,
        autoplayTimeout: 3000,
        autoplayHoverPause: true
    });
});
