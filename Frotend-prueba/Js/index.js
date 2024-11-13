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
    pb.authStore.clear(); // Limpia el estado de autenticación en PocketBase
    
    // Limpia el token de PocketBase del almacenamiento local si no lo ha hecho pb.authStore.clear()
    localStorage.removeItem('pb_token'); // Si se guarda en localStorage
    sessionStorage.removeItem('pb_token'); // Si se guarda en sessionStorage

    console.log("Sesión cerrada. El token ha sido eliminado."); // Mensaje para verificar que el token fue eliminado
    
    window.location.reload(); // Recarga la página para actualizar el estado de autenticación
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
