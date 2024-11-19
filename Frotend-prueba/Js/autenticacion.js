const pb = new PocketBase('http://127.0.0.1:8090');

// Función para verificar la autenticación y redirigir si no está autenticado
export default function verificarAutenticacion() {
    const token = localStorage.getItem('pb_token');
    const authLinks = document.getElementById('auth-links'); // Enlaces de inicio de sesión y registro
    const userLinks = document.getElementById('user-links'); // Enlaces de usuario logueado (Mi cuenta, Cerrar sesión)

    if (token) {
        pb.authStore.save(token); // Restaurar el token de autenticación en PocketBase
        console.log('Token restaurado:', token); // Verificar que el token se restauró correctamente
        
        // Retardar un poco para asegurar que el authStore se actualice
        setTimeout(() => {
            if (pb.authStore.isValid) {
                console.log('Usuario autenticado');
                // Mostrar los enlaces de usuario logueado y ocultar los de autenticación
                authLinks.style.display = 'none';
                userLinks.style.display = 'flex';
                return true; // El usuario está autenticado
            } else {
                localStorage.removeItem('pb_token'); // Eliminar token si no es válido
                alert('Token inválido. Por favor inicia sesión nuevamente.');
                window.location.href = '/login-pocketbase.html'; // Redirigir si el token no es válido
                return false; // Token inválido
            }
        }, 200); // Esperamos un poco antes de verificar si el authStore es válido
    } else {
        authLinks.style.display = 'flex'; // Mostrar los enlaces de autenticación
        userLinks.style.display = 'none'; // Ocultar los enlaces de usuario logueado
        return false; // No hay token
    }
}
