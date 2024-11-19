const pb = new PocketBase('http://127.0.0.1:8090'); // URL de tu servidor PocketBase

emailjs.init('ao5KBCWaPjMyf-LVS'); // Reemplaza 'your_user_id' con tu User ID de EmailJS

document.addEventListener('DOMContentLoaded', async () => {
    const usuario = pb.authStore.model;  // Obtén el modelo de usuario autenticado

    // Verificar si el usuario está autenticado y tiene el rol de administrador
    if (!usuario || usuario.role !== 'admin') {
        alert("Acceso denegado. Solo los administradores pueden acceder a esta página.");
        window.location.href = "/vista/index-pocketbase.html"; // Redirigir a la página de inicio
        return;
    }

    actualizarEnlacesAutenticacion();
});

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


// Función para consultar todos los reportes de usuarios
async function consultar_reportes_usuario() {
    let pagina = 1;
    let reportes = [];
    let usuariosReportados = new Set();

    try {
        while (true) {
            const response = await pb.collection('reportes').getList(pagina, 50);
            reportes = reportes.concat(response.items);

            if (response.items.length < 50) break;
            pagina++;
        }

        // Extraer los usuarios reportados
        reportes.forEach(reporte => {
            if (reporte.user_reportado) {
                usuariosReportados.add(reporte.user_reportado);
            }
        });

        // Obtener los nombres de los usuarios reportados
        const usuariosConNombre = await obtenerNombresUsuarios(Array.from(usuariosReportados));
        mostrar_usuarios_reportados(usuariosConNombre);
    } catch (error) {
        console.error("Error al consultar reportes de usuarios:", error);
        alert("Hubo un error al cargar los reportes.");
    }
}


async function mostrar_usuarios_reportados(usuarios) {
    const contenedorUsuarios = document.getElementById('usuariosReportados');
    contenedorUsuarios.innerHTML = '';

    if (usuarios.length === 0) {
        contenedorUsuarios.innerHTML = '<p>No se encontraron usuarios reportados.</p>';
        return;
    }

    for (let usuario of usuarios) {
        // Obtener el correo del usuario y manejar posibles errores
        const correoUsuario = await obtenerUsuarioCorreo(usuario.id);
        if (!correoUsuario) {
            console.error(`No se pudo obtener el correo del usuario con ID ${usuario.id}`);
        }

        // Obtener el nombre del usuario
        const nombreUsuario = await obtenerUsuarioNombre(usuario.id);

        // Crear el div para mostrar los datos del usuario
        const usuarioDiv = document.createElement('div');
        usuarioDiv.classList.add('usuario', 'publicacion');
        usuarioDiv.innerHTML = `
            <p><strong>ID de usuario reportado:</strong> ${usuario.id}</p>
            <p><strong>Username:</strong> ${nombreUsuario}</p>
            <p><strong>Correo:</strong> ${correoUsuario}</p>  <!-- Mostrar correo -->
            <select id="estadoCuenta_${usuario.id}">
                <option value="activo">Activo</option>
                <option value="suspendido">Suspendido</option>
                <option value="bloqueado">Bloqueado</option>
            </select>
            <button class="btn btn-success" onclick="cambiar_estado_usuario('${usuario.id}')">Cambiar Estado</button>
            <button class="btn btn-info" onclick="mostrar_reportes('${usuario.id}')">Ver Reportes</button>
            <button class="btn btn-warning" id="enviarCorreo_${usuario.id}" style="display:none">Enviar Correo</button>
        `;

        // Agregar el evento onclick dinámicamente para el botón "Enviar Correo"
        const botonEnviarCorreo = usuarioDiv.querySelector(`#enviarCorreo_${usuario.id}`);
        botonEnviarCorreo.onclick = async () => {
            const estadoCuenta = document.getElementById(`estadoCuenta_${usuario.id}`).value;
            const mensaje = `Tu cuenta ha sido ${estadoCuenta}. Por favor, contacta con soporte si tienes alguna pregunta.`;

            if (!correoUsuario) {
                alert("No se pudo obtener el correo del usuario.");
                return; // Detiene la ejecución si no se puede obtener el correo
            }

            try {
                await enviar_correo_usuario(correoUsuario, mensaje, nombreUsuario);
            } catch (error) {
                console.error('Error al enviar el correo:', error);
                alert('Hubo un error al enviar el correo.');
            }
        };

        // Agregar el div del usuario al contenedor
        contenedorUsuarios.appendChild(usuarioDiv);
    }
}


async function obtenerNombresUsuarios(ids) {
    const usuariosConNombre = [];
    for (let id of ids) {
        try {
            const usuario = await pb.collection('users').getOne(id);
            usuariosConNombre.push({
                id: usuario.id,
                username: usuario.username
            });
        } catch (error) {
            console.error(`Error al obtener el usuario con ID ${id}:`, error);
        }
    }
    return usuariosConNombre;
}



async function mostrar_reportes(usuarioId) {
    try {
        const reportes = await pb.collection('reportes').getList(1, 50, {
            filter: `user_reportado="${usuarioId}"`
        });

        const contenedorReportes = document.getElementById('reportesUsuario');
        contenedorReportes.innerHTML = '';

        const nombreUsuarioReportado = await obtenerUsuarioNombre(usuarioId);

        const contenedorEncabezado = document.createElement('div');
        contenedorEncabezado.className = 'contenedor-encabezado'; // Nueva clase para el contenedor
        
        const encabezado = document.createElement('h4');
        encabezado.className = 'encabezado-reportado'; 
        encabezado.innerText = `Usuario Reportado: ${nombreUsuarioReportado}`;
        contenedorReportes.appendChild(encabezado);
        contenedorReportes.appendChild(contenedorEncabezado);


        if (reportes.items.length === 0) {
            contenedorReportes.innerHTML += '<p>No hay reportes para este usuario.</p>';
            return;
        }

        for (let reporte of reportes.items) {
           
            const usuarioReportaNombre = reporte.user_reporta ? await obtenerUsuarioNombre(reporte.user_reporta) : 'Desconocido';
            
            const reporteDiv = document.createElement('div');
            reporteDiv.classList.add('reporte', 'publicacion');
            reporteDiv.innerHTML = `
                <p><strong>Motivo:</strong> ${reporte.motivo}</p>
                <p><strong>Mensaje:</strong> ${reporte.mensaje}</p>
                <p><strong>Reportado por:</strong> ${usuarioReportaNombre} (ID: ${reporte.user_reporta})</p>  
            `;
            contenedorReportes.appendChild(reporteDiv);
        }
    } catch (error) {
        console.error('Error al mostrar los reportes:', error);
    }
}


async function obtenerUsuarioNombre(usuarioId) {
    try {
        const usuario = await pb.collection('users').getOne(usuarioId);
        return usuario.username;
    } catch (error) {
        console.error(`Error al obtener el nombre del usuario con ID ${usuarioId}:`, error);
        return 'Desconocido';
    }
}

async function obtenerUsuarioCorreo(usuarioId) {
    try {
        const usuario = await pb.collection('users').getOne(usuarioId);
        if (usuario && usuario.email) {
            return usuario.email;
        } else {
            console.error(`El usuario con ID ${usuarioId} no tiene un correo electrónico definido.`);
            return 'Email no disponible';
        }
    } catch (error) {
        console.error(`Error al obtener el correo del usuario con ID ${usuarioId}:`, error);
        return 'Error al obtener el correo';
    }
}




async function cambiar_estado_usuario(usuarioId) {
    const nuevoEstado = document.getElementById('estadoCuenta_' + usuarioId).value;

    if (['activo', 'suspendido', 'bloqueado'].includes(nuevoEstado)) {
        try {
            await pb.collection('users').update(usuarioId, { account_status: nuevoEstado });
            alert("Estado del usuario actualizado correctamente");

            // Mostrar el botón de "Enviar Correo"
            const botonEnviarCorreo = document.getElementById('enviarCorreo_' + usuarioId);
            if (botonEnviarCorreo) {
                botonEnviarCorreo.style.display = 'inline-block'; // Mostrar el botón
            }
        } catch (error) {
            console.error("Error al actualizar el estado del usuario:", error);
            alert("Hubo un error al actualizar el estado del usuario.");
        }
    } else {
        alert("Estado no válido.");
    }
}



async function enviar_correo_usuario(usuarioEmail, mensaje, username) {
    if (!usuarioEmail) {
        alert("El correo electrónico no se proporcionó correctamente.");
        return; // Detener la ejecución si no hay correo
    }

    console.log("Enviando correo a:", usuarioEmail); 

    try {
        const templateParams = {
            to_email: usuarioEmail,
            username: username,
            message: mensaje,
            from_name: "Kleanimals"
        };

        const response = await emailjs.send(
            'service_0m7widd',
            'template_b1doyaj',
            templateParams
        );

        console.log("Correo enviado correctamente:", response);
        alert('Correo enviado correctamente.');
    } catch (error) {
        console.error('Error al enviar el correo:', error);
        alert('Hubo un error al enviar el correo.');
    }
}

