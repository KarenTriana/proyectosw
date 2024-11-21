const pb = new PocketBase('http://127.0.0.1:8090'); // URL de tu servidor PocketBase

document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el ID del animal de la URL
    const params = new URLSearchParams(window.location.search);
    const animalId = params.get('id');

    if (!animalId) {
        document.getElementById('animalDetalles').innerHTML = '<p>ID de animal no especificado.</p>';
        return;
    }

    let animalPost; // Declarar la variable aquí para que esté disponible globalmente dentro de la función
 
    try {
        // Obtener los datos del animal desde la base de datos
        const animal = await pb.collection('animal').getOne(animalId);


        // Obtener la publicación del animal y verificar si tiene un 'user_id'
        animalPost = await pb.collection('animal_post').getFirstListItem(`animal_id="${animalId}"`, {expand: 'user_id'});
 

        if (!animalPost) {
            console.error('No se encontró la publicación del animal.');
            alert('No se puede reportar esta publicación porque no se encontró.');
            return;
        }


        console.log('user_id:', animalPost.user_id);  // Imprime el user_id
        const userDetails = await pb.collection('users').getOne(animalPost.user_id);
        console.log('userDetails:', userDetails);
        
        // Verificar si animalPost tiene un 'user_id' válido
        if (!animalPost.user_id) {
            console.error('No se encontró el user_id en animalPost.');
            alert('No se puede reportar esta publicación porque falta el user_id.');
            return;
        }


        // Obtener la ubicación completa usando el location_id
        let locationDetails = null;
        if (animalPost.location_id) {
            locationDetails = await pb.collection('location').getOne(animalPost.location_id); // Aquí se hace la consulta a la colección 'location'
        }

        // Mostrar los detalles del animal en el HTML
        mostrarDetallesAnimal(animal, animalPost, locationDetails);
        console.log("Animal Post:", animalPost); // Depuración: Ver los datos de animalPost

        
    } catch (error) {
        console.error('Error al cargar los detalles del animal:', error);
        document.getElementById('animalDetalles').innerHTML = '<p>Error al cargar los detalles del animal.</p>';
    }

    // Asignar el evento al botón de reportar
    document.getElementById('reportarBtn').addEventListener('click', () => {
        if (animalPost) { // Asegurarse de que animalPost esté definido antes de usarlo
            // Redirigir a la página de reporte con el ID de la publicación
            window.location.href = `reportar.html?id=${animalPost.id}`;
        } else {
            alert('No se puede reportar porque los datos de la publicación no están disponibles.');
        }
    });

    // Asignar el evento al botón de compartir
    document.getElementById('compartirBtn').addEventListener('click', () => {
        compartirEnlace();
    });

    actualizarEnlacesAutenticacion();
});

// Función para mostrar los detalles del animal en el HTML
function mostrarDetallesAnimal(animal, animalPost, locationDetails) {
    // Verificación de los datos
    console.log('animalPost:', animalPost);
    console.log('animalPost.location_id:', animalPost ? animalPost.location_id : 'No existe location_id');

    // Actualiza el contenido del título con el estado del animal
    const titulo = document.getElementById('publicacion-max');
    titulo.textContent = animal.status ? `Detalles del Animal ${animal.status}` : 'Detalles del Animal';

    // Crear la dirección completa para Google Maps
    const direccionCompleta = locationDetails
        ? `${locationDetails.address || ''}, ${locationDetails.city || ''}, ${locationDetails.departament || ''}, ${locationDetails.zip_code || ''}`
        : 'No disponible';

    // Enlace a Google Maps
    const enlaceMaps = locationDetails 
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionCompleta)}`
        : '#';


    const container = document.getElementById('animalDetalles');
    container.innerHTML = `
    <div class="publicacion">
        <div class="animal-detalle-card">
            <div class="image-container" style="flex: 1;">
                <img src="${animal.imagen_url || 'https://via.placeholder.com/300'}" alt="${animal.name}" style="object-fit: contain; border-radius: 10px; max-width: 450px; max-height: 300px; margin-right: 1px;">
            </div>
            <div class="animal-profile mt-4 p-3 border rounded">
                <h2>${animal.name || 'Nombre no disponible'}</h2>
                <p><strong>Especie:</strong> ${animal.especie || 'No disponible'}</p>
                <p><strong>Edad:</strong> ${animal.edad || 'No disponible'}</p>
                <p><strong>Tamaño:</strong> ${animal.tamano || 'No disponible'}</p>
                <p><strong>Sexo:</strong> ${animal.sexo || 'No disponible'}</p>
                <p><strong>Color:</strong> ${animal.color || 'No disponible'}</p>
                <p><strong>Raza:</strong> ${animal.raza || 'No disponible'}</p>
                <p><strong>Descripción:</strong> ${animal.description || 'No disponible'}</p>
        
                <br>${animal.status === 'perdido' || animal.status === 'encontrado' ? `
                    <h2>Ubicación</h2>
                    <p><strong>Dirección:</strong> ${locationDetails ? locationDetails.address || 'No disponible' : 'No disponible'}</p>
                    <p><strong>Ciudad:</strong> ${locationDetails ? locationDetails.city || 'No disponible' : 'No disponible'}</p>
                    <p><strong>Departamento:</strong> ${locationDetails ? locationDetails.departament || 'No disponible' : 'No disponible'}</p>
                    <p><strong>Código Postal:</strong> ${locationDetails ? locationDetails.zip_code || 'No disponible' : 'No disponible'}</p>
                    <a href="${enlaceMaps}" target="_blank" class="btn-maps">Ver en Google Maps</a><br>
                 ` : ''}
   
                <br><h2>Datos de Contacto del Usuario:</h2>
                <p><strong>Nombre:</strong> ${animalPost.expand?.user_id?.name || 'No disponible'}</p>
                <p><strong>Email:</strong> ${animalPost.expand?.user_id?.email || 'No disponible'}</p>
                <p><strong>Teléfono:</strong> ${animalPost.expand?.user_id?.telefono || 'No disponible'}</p>
            </div>
        </div>
    </div>
    `;
}



// Función para copiar el enlace y compartir
function compartirEnlace() {
    const url = window.location.href; // Obtener la URL actual
    navigator.clipboard.writeText(url)
        .then(() => {
            alert('Enlace copiado al portapapeles. ¡Ahora puedes compartirlo!');
        })
        .catch(err => {
            console.error('Error al copiar el enlace:', err);
            alert('No se pudo copiar el enlace. Inténtalo de nuevo.');
        });
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

// Llamada a la función para actualizar los enlaces al cargar la página
window.onload = function() {
    actualizarEnlacesAutenticacion(); // Actualiza los enlaces de autenticación
};

// Manejo de logout
document.getElementById('logout')?.addEventListener('click', () => {
    pb.authStore.clear(); // Limpia el estado de autenticación en PocketBase

    // Limpia el token de PocketBase del almacenamiento local y sessionStorage si es necesario
    localStorage.removeItem('pb_token');
    sessionStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    sessionStorage.removeItem('pb_user');

    // Redirige a la página de login
    window.location.href = '/login';

    // Recarga la página para garantizar que todo se actualice (si es necesario)
    window.location.reload();
});