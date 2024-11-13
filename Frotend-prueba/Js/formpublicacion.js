// Inicializa PocketBase
const pb = new PocketBase('http://127.0.0.1:8090'); // Cambia a la URL de tu servidor PocketBase


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
    actualizarEnlacesAutenticacion();

    // Verifica si el usuario está autenticado antes de permitir el acceso al formulario
    verificarAutenticacion();
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



// Función para obtener el ID del usuario autenticado
async function getAuthenticatedUserId() {
    if (pb.authStore.isValid) {
        if (!pb.authStore.model) {
            try {
                await pb.collection('users').authRefresh(); // Refresca la sesión
            } catch (error) {
                console.error("Error al refrescar la autenticación:", error);
                localStorage.removeItem('pb_token'); // Elimina el token si no es válido
                return null;
            }
        }
        const user = pb.authStore.model; // Obtiene el usuario autenticado después del refresco
        if (user) {
            console.log('Usuario autenticado:', user);
            return user.id; // Devuelve el ID del usuario autenticado
        } else {
            console.log('El usuario sigue siendo null, verifica el token o la configuración.');
            return null;
        }
    } else {
        console.log('No hay un token válido.');
        return null;
    }
}

// Función para verificar la autenticación antes de mostrar el formulario
async function verificarAutenticacion() {
    const userId = await getAuthenticatedUserId();
    const form = document.getElementById('report-form');
    
    if (!userId) {
        // Si no hay usuario autenticado, redirige al login
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = '/vista/login-pocketbase.html'; // Redirige a la página de login
    } else {
        // Si el usuario está autenticado, muestra el formulario
        form.style.display = 'block'; // Muestra el formulario
    }
}

// Función para actualizar los datos de contacto en el formulario
async function updateContactInfo() {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
        console.log("No se pudo obtener el ID del usuario.");
        return;
    }

    const userData = await getUserData(userId);
    if (!userData) {
        console.log("No se pudieron obtener los datos del usuario.");
        return;
    }

    // Actualiza los campos del formulario con los datos del usuario
    document.getElementById("name").value = userData.name || "";
    document.getElementById("telefono").value = userData.telefono || "";
    document.getElementById("email").value = userData.email || "";
}

// Función para obtener los datos del usuario por su ID
async function getUserData(userId) {
    try {
        const user = await pb.collection('users').getOne(userId);
        return user;
    } catch (error) {
        console.error("Error al obtener los datos del usuario:", error);
        return null;
    }
}

// Llama a la función para actualizar los datos de contacto al cargar la página
document.addEventListener("DOMContentLoaded", updateContactInfo);

// Función para crear la ubicación
async function createLocation(locationData) {
    try {
        // Crea una nueva ubicación en la colección 'location' de PocketBase
        const locationRecord = await pb.collection('location').create(locationData);
        console.log("Ubicación creada con éxito:", locationRecord);
        return locationRecord.id; // Devuelve el ID de la ubicación creada
    } catch (error) {
        console.error("Error al crear la ubicación:", error);
        return null; // Si hay un error, devuelve null
    }
}

// Función para crear el animal
async function createAnimal(animalData) {
    try {
        // Crea un nuevo registro de animal en la colección 'animal' de PocketBase
        const animalRecord = await pb.collection('animal').create(animalData);
        console.log("Animal creado con éxito:", animalRecord);
        return animalRecord.id; // Devuelve el ID del animal creado
    } catch (error) {
        console.error("Error al crear el animal:", error);
        return null; // Si hay un error, devuelve null
    }
}

// Evento de envío del formulario
document.getElementById("report-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    // Obtiene el ID del usuario autenticado
    const userId = await getAuthenticatedUserId();
    if (!userId) {
        alert("Debes iniciar sesión para enviar un reporte.");
        return;
    }

    // Recopila los datos del animal
    const animalData = {
        "name": document.getElementById("animal_name").value,
        "status": document.getElementById("animal_status").value,
        "sexo": document.getElementById("animal_sex").value,
        "especie": document.getElementById("animal_species").value,
        "edad": document.getElementById("animal_age").value,
        "tamano": document.getElementById("animal_size").value,
        "raza": document.getElementById("animal_breed").value,
        "color": document.getElementById("animal_color").value,
        "patrones": document.getElementById("animal_patterns").value,
        "description": document.getElementById("animal_description").value,
        "imagen_url": document.getElementById("animal_image_url").value,
        "video_url": document.getElementById("animal_video_url").value
    };

    // Recopila los datos de la ubicación solo si el animal es perdido o encontrado
    let locationId = null;
    if (animalData.status === "perdido" || animalData.status === "encontrado") {
        const locationData = {
            "address": document.getElementById("location_address").value,
            "city": document.getElementById("location_city").value,
            "departament": document.getElementById("location_departament").value,
            "zip_code": document.getElementById("location_zip_code").value
        };

        locationId = await createLocation(locationData); // Crea la ubicación solo si es necesario
    }

    // Crea el animal
    const animalId = await createAnimal(animalData);

    // Verifica que ambos IDs existen antes de continuar
    if (!animalId) {
        console.error("No se pudo crear el animal.");
        alert("Error al crear el animal. Por favor, intenta nuevamente.");
        return;
    }

    // Datos del reporte
    const reportData = {
        "animal_id": animalId,
        "user_id": userId, // ID del usuario autenticado
        "report_date": new Date().toISOString(),
        "status": document.getElementById("animal_status").value,
        "location_id": locationId,
        "post_date": new Date().toISOString()
    };

    // Enviar el reporte
    try {
        const reportRecord = await pb.collection('animal_post').create(reportData);
        console.log("Reporte enviado:", reportRecord);
        alert("Reporte creado exitosamente.");
        document.getElementById("report-form").reset();
    } catch (error) {
        console.error("Error al enviar el reporte:", error);
        alert("Error al enviar el reporte. Por favor, intenta nuevamente.");
    }

});
