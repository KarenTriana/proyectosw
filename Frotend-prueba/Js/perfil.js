const pb = new PocketBase('http://127.0.0.1:8090'); // URL de tu servidor PocketBase

document.addEventListener('DOMContentLoaded', async () => {
    const pb = new PocketBase('http://127.0.0.1:8090');
    const token = localStorage.getItem('pb_token');

    // Redirigir al login si no hay token
    if (!token) {
        window.location.href = '/vista/login-pocketbase.html';
        return;
    }

    // Restaurar la autenticación con el token
    pb.authStore.save(token);
    try {
        await pb.collection('users').authRefresh();
    } catch (error) {
        console.error('Error al refrescar la autenticación:', error);
        localStorage.removeItem('pb_token');
        window.location.href = '/vista/login-pocketbase.html';
        return;
    }

    const usuario = pb.authStore.model; 

    
    // Verificar si el usuario tiene un avatar y actualizar el elemento de la imagen
    if (usuario.avatar) {
        // Construir la URL pública del avatar almacenado en PocketBase
        const avatarUrl = `http://127.0.0.1:8090/api/files/users/${usuario.id}/${usuario.avatar.split('/').pop()}`;
        document.getElementById('avatar').src = avatarUrl;
    } else {
        // Si no hay avatar, usar el avatar por defecto
        document.getElementById('avatar').src = "/images/default-avatar.jpg";
    }

    if (usuario) {
        document.getElementById('nombre').value = usuario.name;
        document.getElementById('email').value = usuario.email;
        document.getElementById('direccion').value = usuario.direccion || '';
        document.getElementById('telefono').value = usuario.telefono || '';

    }

    // Activar la carga de nuevo avatar
    document.getElementById('cambiarAvatarBtn').addEventListener('click', () => {
        document.getElementById('avatarInput').click();
    });

    /// Manejar la selección de una nueva imagen
document.getElementById('avatarInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar que el archivo sea una imagen
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!validImageTypes.includes(file.type)) {
        alert('Por favor, selecciona una imagen válida (JPEG, PNG o GIF).');
        return;
    }

    try {
        // Subir el archivo al servidor de PocketBase y actualizar el avatar
        const avatarFile = await pb.collection('users').update(usuario.id, {
            avatar: file,  // Actualiza directamente el campo 'avatar' del usuario
        });

        console.log(avatarFile); // Deberías ver detalles del archivo, como su nombre

        // Construir la URL pública del archivo almacenado
        // Suponiendo que la imagen se guarda en _pb_users_auth_ o storage
        const avatarUrl = `http://127.0.0.1:8090/api/files/users/${usuario.id}/${avatarFile.avatar}`; // Aquí usamos la URL pública

        // Si la URL viene con un token, tal vez necesites reemplazarla por la URL pública
        if (usuario.avatar && usuario.avatar.includes('api/files')) {
            const avatarUrl = `http://127.0.0.1:8090/api/files/users/${usuario.id}/${usuario.avatar.split('/').pop()}`;
        }

        // Actualiza la vista con la nueva imagen
        document.getElementById('avatar').src = avatarUrl;

        alert('Avatar actualizado con éxito');
    } catch (error) {
        console.error('Error al actualizar el avatar:', error);
        alert('Hubo un error al cambiar el avatar');
    }
});

    
      
    // Activar edición de perfil
    document.getElementById('editarBtn').addEventListener('click', () => {
        document.querySelectorAll('input').forEach(input => {
            input.disabled = false;
        });
        document.getElementById('guardarBtn').disabled = false;
    });

    // Guardar cambios en el perfil
    document.getElementById('perfilForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('nombre').value,
            email: document.getElementById('email').value,
            direccion: document.getElementById('direccion').value,
            telefono: document.getElementById('telefono').value,
        };

        try {
            const response = await pb.collection('users').update(usuario.id, data);
            alert('Perfil actualizado');
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
        }
    });


// Mostrar formulario de cambio de contraseña
document.getElementById('cambiarContrasenaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const contrasenaActual = document.getElementById('contrasenaActual').value;
    const nuevaContrasena = document.getElementById('nuevaContrasena').value;
    const confirmarContrasena = document.getElementById('confirmarContrasena').value;

    // Validar que las contraseñas coincidan
    if (nuevaContrasena !== confirmarContrasena) {
        alert('Las contraseñas no coinciden');
        return;
    }
    
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{5,}$/;
    if (!passwordRegex.test(nuevaContrasena)) {
        alert('La contraseña debe tener al menos 5 caracteres, una letra mayúscula y un carácter especial');
        return;
    }

    
    try {

        // Verificar la contraseña actual usando authWithPassword
        await pb.collection('users').authWithPassword(usuario.email, contrasenaActual);

        // Intentamos actualizar la contraseña con el campo oldPassword
        const response = await pb.collection('users').update(usuario.id, {
            password: nuevaContrasena,
            passwordConfirm: confirmarContrasena,
            oldPassword: contrasenaActual
        });

        console.log('Respuesta de la actualización:', response);
        alert('Contraseña cambiada con éxito');
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error);

        // Si falla la autenticación
        if (error.message.includes('Failed to authenticate')) {
            alert('La contraseña actual es incorrecta');
        } else {
            alert('Error al cambiar la contraseña: ' + error.message);
        }
    }
});
    

// Confirmar eliminación de cuenta
// Manejar la eliminación de la cuenta con confirmación
document.getElementById('eliminarCuentaBtn').addEventListener('click', async () => {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar tu cuenta?');
    if (confirmacion) {
        try {
            // Eliminar el usuario en PocketBase
            await pb.collection('users').delete(usuario.id);
            alert('Cuenta eliminada');
            
            // Limpiar el token de autenticación y redirigir al inicio
            localStorage.removeItem('pb_token');
            window.location.href = '/vista/index-pocketbase.html';
        } catch (error) {
            console.error('Error al eliminar la cuenta:', error);
            alert('Hubo un error al intentar eliminar tu cuenta.');
        }
    }
});



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

})
