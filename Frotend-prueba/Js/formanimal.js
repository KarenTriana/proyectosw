// script.js
const pb = new PocketBase('http://127.0.0.1:8090'); // URL de tu servidor PocketBase

document.addEventListener('DOMContentLoaded', async () => {
    // Cargar el token desde localStorage al authStore de PocketBase
    const token = localStorage.getItem('pb_token');
    if (token) {
        pb.authStore.save(token); // Guardar el token en el authStore
    }

    // Actualizar la sesión para cargar el modelo del usuario
    try {
        await pb.collection('users').authRefresh(); // Refrescar el modelo del usuario en authStore.model
    } catch (error) {
        console.error("Error al refrescar la autenticación:", error);
        localStorage.removeItem('pb_token');  // Elimina el token si no es válido
        window.location.href = '/vista/login-pocketbase.html';  // Redirigir a la página de login
        return;
    }

    // Verificar si hay un usuario autenticado
    const usuario = pb.authStore.model;
    if (usuario) {
        console.log("Usuario autenticado:", usuario);
    } else {
        console.log("No se pudo cargar el usuario.");
        window.location.href = '/vista/login-pocketbase.html';  // Redirigir si no se puede cargar el usuario
    }

    const publicacionId = sessionStorage.getItem('editPublicacionId');  // Obtener el ID desde sessionStorage
    const animalId = sessionStorage.getItem('editAnimalId');  // Obtener el ID del animal desde sessionStorage

    if (publicacionId && animalId) {
        console.log('ID de publicación:', publicacionId);  // Verifica que el ID sea correcto
        console.log('ID de animal:', animalId);  // Verifica que el ID de animal sea correcto
        await cargarPublicacion(publicacionId, animalId);  // Llama a la función para cargar la publicación
    } else {
        console.error('No se encontraron IDs en sessionStorage');
    }

    // Evento para guardar o actualizar el formulario
    document.getElementById('animalForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        await actualizarPublicacion(publicacionId);
    });
    // Actualizar los enlaces de autenticación
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


// Función para cargar los datos de la publicación y prellenar el formulario
async function cargarPublicacion(publicacionId, animalId) {
    try {
        // Cargar la publicación
        const publicacion = await pb.collection('animal_post').getOne(publicacionId);
        console.log("Datos de la publicación:", publicacion);

        // Cargar los datos del animal relacionado usando el animalId directamente
        const animal = await pb.collection('animal').getOne(animalId);
        console.log("Datos del animal:", animal);



        // Verificar si la publicación tiene un location_id
        const locationId = publicacion.location_id;
        if (locationId) {
            console.log("Location ID en la publicación:", locationId);

            // Si locationId es válido, cargar los datos de la ubicación
            const location = await pb.collection('location').getOne(locationId);
            console.log("Datos de la ubicación:", location);

            // Rellenar el formulario con los datos de la ubicación
            if (document.getElementById('address')) {
                document.getElementById('address').value = location.address || '';
            }
            if (document.getElementById('city')) {
                document.getElementById('city').value = location.city || '';
            }
            if (document.getElementById('departament')) {
                document.getElementById('departament').value = location.departament || '';
            }
            if (document.getElementById('zip_code')) {
                document.getElementById('zip_code').value = location.zip_code || '';
            }
        } else {
            console.log("No se encontró un location_id válido en la publicación.");
        }
        

        // Rellenar el formulario con los datos del animal
        if (document.getElementById('animal_name')) {
            document.getElementById('animal_name').value = animal.name || '';
        }
        if (document.getElementById('animal_sex')) {
            document.getElementById('animal_sex').value = animal.sexo || '';
        }
        if (document.getElementById('animal_species')) {
            document.getElementById('animal_species').value = animal.especie || '';
        }
        if (document.getElementById('animal_age')) {
            document.getElementById('animal_age').value = animal.edad || '';
        }
        if (document.getElementById('animal_size')) {
            document.getElementById('animal_size').value = animal.tamano || '';
        }
        if (document.getElementById('animal_breed')) {
            document.getElementById('animal_breed').value = animal.raza || '';
        }
        if (document.getElementById('animal_color')) {
            document.getElementById('animal_color').value = animal.color || '';
        }
        if (document.getElementById('animal_patterns')) {
            document.getElementById('animal_patterns').value = animal.patrones || '';
        }
        if (document.getElementById('animal_description')) {
            document.getElementById('animal_description').value = animal.description || '';
        }
        if (document.getElementById('animal_image_url')) {
            document.getElementById('animal_image_url').value = animal.imagen_url || '';
        }
        if (document.getElementById('animal_video_url')) {
            document.getElementById('animal_video_url').value = animal.video_url || '';
        }

        // Rellenar el formulario con los datos de la publicación
        if (document.getElementById('publicacion_status')) {
            document.getElementById('publicacion_status').value = publicacion.status || '';
        }
        if (document.getElementById('publicacion_date')) {
            document.getElementById('publicacion_date').value = publicacion.fecha || '';
        }

    } catch (error) {
        console.error("Error al cargar la publicación, el animal o la ubicación:", error);
    }
}

// Función para actualizar la publicación
async function actualizarPublicacion(publicacionId) {
    try {
        // Recoger los datos de la publicación desde el formulario
        const publicacionData = {
            animal_name: document.getElementById('animal_name').value,
            animal_sex: document.getElementById('animal_sex').value,
            animal_species: document.getElementById('animal_species').value,
            animal_age: document.getElementById('animal_age').value,
            animal_size: document.getElementById('animal_size').value,
            animal_breed: document.getElementById('animal_breed').value,
            animal_color: document.getElementById('animal_color').value,
            animal_patterns: document.getElementById('animal_patterns').value,
            animal_description: document.getElementById('animal_description').value,
            animal_image_url: document.getElementById('animal_image_url').value,
            animal_video_url: document.getElementById('animal_video_url').value,
        };

        // Recoger los datos del animal desde el formulario
        const animalData = {
            name: document.getElementById('animal_name').value,
            sexo: document.getElementById('animal_sex').value,
            especie: document.getElementById('animal_species').value,
            edad: document.getElementById('animal_age').value,
            tamano: document.getElementById('animal_size').value,
            raza: document.getElementById('animal_breed').value,
            color: document.getElementById('animal_color').value,
            patrones: document.getElementById('animal_patterns').value,
            description: document.getElementById('animal_description').value,
            imagen_url: document.getElementById('animal_image_url').value,
            video_url: document.getElementById('animal_video_url').value,
        };

        // Recoger los datos de la ubicación desde el formulario
        const locationData = {};

if (document.getElementById('address')) {
    locationData.address = document.getElementById('address').value;
}
if (document.getElementById('city')) {
    locationData.city = document.getElementById('city').value;
}
if (document.getElementById('departament')) {
    locationData.departament = document.getElementById('departament').value;
}
if (document.getElementById('zip_code')) {
    locationData.zip_code = document.getElementById('zip_code').value;
}


        let locationId = null;
        const publicacion = await pb.collection('animal_post').getOne(publicacionId);
        if (publicacion.location_id) {
            locationId = publicacion.location_id;
        }

        if (locationId) {
            // Si existe un location_id, actualizar la ubicación
            await pb.collection('location').update(locationId, locationData);
            console.log("Ubicación actualizada correctamente");
        } 

        // Verifica que los datos sean correctos
        console.log("Datos de la publicación a actualizar:", publicacionData);
        console.log("Datos del animal a actualizar:", animalData);

        // Primero, actualizamos los datos del animal
        const animalId = sessionStorage.getItem('editAnimalId');  // Asegúrate de que este ID sea correcto
        if (animalId) {
            await pb.collection('animal').update(animalId, animalData);
            console.log("Datos del animal actualizados correctamente");
        }

        // Luego, actualizamos los datos de la publicación
        await pb.collection('animal_post').update(publicacionId, publicacionData);
        console.log("Publicación actualizada correctamente");

        alert('Publicación y datos del animal actualizados con éxito');
        window.location.href = `/vista/index-pocketbase.html`;
    } catch (error) {
        console.error("Error al actualizar la publicación o el animal:", error);
    }
}
