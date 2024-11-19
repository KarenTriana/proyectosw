const pb = new PocketBase('http://127.0.0.1:8090'); // Cambia a la URL de tu servidor PocketBase

// Verificar si hay un token en LocalStorage y autenticar al usuario automáticamente
const token = localStorage.getItem('pb_token');
if (token) {
    pb.authStore.save(token);
    if (!pb.authStore.isValid) {
        localStorage.removeItem('pb_token');
    } else {
        console.log('Usuario autenticado automáticamente');
    }
}

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    try {
        const authData = await pb.collection('users').authWithPassword(email, password);
        
        localStorage.setItem('pb_token', pb.authStore.token);

        // Verificar si el usuario tiene rol de administrador
        const usuario = pb.authStore.model;
        if (usuario.role === 'admin') {
            alert('Inicio de sesión exitoso como administrador');
            window.location.href = '/vista/admin.html'; // Redirigir a la página de administración
        } else {
            alert('Inicio de sesión exitoso');
            window.location.href = '/vista/index-pocketbase.html'; // Redirigir a la página principal
        }
    } catch (error) {
        errorMessage.textContent = 'Email o contraseña incorrectos.';
        console.error('Error de autenticación:', error);
    }
});
