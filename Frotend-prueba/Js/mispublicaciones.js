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

    
    // Cargar datos y configurar la interfaz
    cargarFiltros();
    cargarAnimalPosts(usuario.id); // Cargar solo las publicaciones del usuario autenticado
    document.getElementById('animalForm').addEventListener('submit', guardarAnimalPost);
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

// Función para cargar los filtros
async function cargarFiltros() {
    try {
        const animales = await pb.collection('animal').getFullList(1000);

        const especiesUnicas = new Set();
        const edadesUnicas = new Set();
        const tamanosUnicos = new Set();
        const coloresUnicos = new Set();

        animales.forEach(animal => {
            if (animal.especie) especiesUnicas.add(animal.especie);
            if (animal.edad) edadesUnicas.add(animal.edad);
            if (animal.tamano) tamanosUnicos.add(animal.tamano);
            if (animal.color) coloresUnicos.add(animal.color);
        });

        llenarOpcionesFiltro('especie', especiesUnicas);
        llenarOpcionesFiltro('edad', edadesUnicas);
        llenarOpcionesFiltro('tamano', tamanosUnicos);
        llenarOpcionesFiltro('color', coloresUnicos);

    } catch (error) {
        console.error("Error al cargar las opciones de los filtros:", error);
    }
}

function llenarOpcionesFiltro(idElemento, valores) {
    const select = document.getElementById(idElemento);
    select.innerHTML = '<option value="">Todas</option>';
    valores.forEach(valor => {
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = valor;
        select.appendChild(option);
    });
}

// Función para buscar publicaciones con filtros
async function buscar_filtro() {
    const publicacionesContainer = document.getElementById('animalPostsList');
    publicacionesContainer.innerHTML = '';

    const usuario = pb.authStore.model;
    if (!usuario) {
        console.log("No hay un usuario autenticado.");
        window.location.href = '/login.html';  // Redirigir si no está autenticado
        return;
    }

    // Obtener valores seleccionados de los filtros
    const especie = document.getElementById('especie').value;
    const edad = document.getElementById('edad').value;
    const tamano = document.getElementById('tamano').value;
    const color = document.getElementById('color').value;

    // Construir filtro para la colección 'animal'
    let condiciones = [];
    if (especie) condiciones.push(`especie='${especie}'`);
    if (edad) condiciones.push(`edad='${edad}'`);
    if (tamano) condiciones.push(`tamano='${tamano}'`);
    if (color) condiciones.push(`color='${color}'`);

    const filtroAnimal = condiciones.length > 0 ? condiciones.join(" && ") : null;

    try {
        // Obtener los IDs de animales que cumplen con el filtro
        const animalesFiltrados = filtroAnimal
            ? await pb.collection('animal').getFullList(1000, { filter: filtroAnimal })
            : await pb.collection('animal').getFullList(1000);

        const animalIds = animalesFiltrados.map(animal => animal.id);

        if (animalIds.length === 0) {
            publicacionesContainer.innerHTML = '<p>No se encontraron resultados.</p>';
            return;
        }

        // Construir filtro para la colección 'animal_post'
        const filtroAnimalPost = `user_id='${usuario.id}' && (${animalIds.map(id => `animal_id='${id}'`).join(" || ")})`;

        const publicaciones = await pb.collection('animal_post').getFullList(1000, { filter: filtroAnimalPost });
        mostrarPublicaciones(publicaciones, publicacionesContainer);

    } catch (error) {
        console.error('Error al aplicar los filtros:', error);
    }
}

// Función para mostrar las publicaciones
function mostrarPublicaciones(publicaciones, publicacionesContainer) {
    publicaciones.forEach(async (publicacion) => {
        const animal_id = publicacion.animal_id;
        try {
            const animal = await pb.collection('animal').getOne(animal_id);

            const postElement = document.createElement('div');
            postElement.classList.add('post', 'publicacion');
            postElement.innerHTML = `
                <p>ID: ${publicacion.id}</p>
                <p>Animal ID: ${publicacion.animal_id}</p>
                <p>Especie: ${animal.especie}</p>
                <p>Status: ${publicacion.status}</p>
                <button class="btn-editar" onclick="editarAnimalPost('${publicacion.id}', '${publicacion.animal_id}', '${publicacion.status}')">Editar</button>
                <button class="btn-eliminar" onclick="eliminarAnimalPost('${publicacion.id}')">Eliminar</button>
                <hr>
            `;
            publicacionesContainer.appendChild(postElement);
        } catch (error) {
            console.error('Error al obtener los detalles del animal:', error);
        }
    });
}



// Función para guardar o actualizar el status de un Animal y su publicación
async function guardarAnimalPost(event) {
    event.preventDefault();

    const animalId = document.getElementById('animalId').value;
    const status = document.getElementById('statusForm').value;

    console.log("Animal ID:", animalId);
    console.log("Status:", status);

    if (!animalId || !status) {
        alert("Por favor, selecciona un animal y un estado válido.");
        return;
    }

    try {
        // Actualizar el status del animal en la colección 'animal'
        await pb.collection('animal').update(animalId, { status: status });

        // Buscar la publicación relacionada con este animal
        const publicaciones = await pb.collection('animal_post').getFullList(1, {
            filter: `animal_id='${animalId}'`
        });

        if (publicaciones.length > 0) {
            const publicacionId = publicaciones[0].id;
            
            // Actualizar el status de la publicación en la colección 'animal_post'
            await pb.collection('animal_post').update(publicacionId, { status: status });
        } else {
            console.warn("No se encontró ninguna publicación relacionada con este animal.");
        }

        // Recargar las publicaciones y limpiar el formulario
        cargarAnimalPosts();
        document.getElementById('animalForm').reset();

    } catch (error) {
        console.error("Error al actualizar el status del animal y la publicación:", error);
    }
}

// Función para cargar todos los Animal Posts del usuario autenticado sin filtros adicionales
async function cargarAnimalPosts(userId) {
    const container = document.getElementById('animalPostsList');
    container.innerHTML = '';

    try {
        // Cargar todas las publicaciones del usuario autenticado
        const posts = await pb.collection('animal_post').getFullList(1000, { filter: `user_id='${userId}'` });
        mostrarPublicaciones(posts, container);
    } catch (error) {
        console.error("Error al cargar los animal posts:", error);
    }
}

// Función para manejar la edición de la publicación
async function editarAnimalPost(publicacionId, animalId, status) {
    try {
        // Obtener la publicación específica
        const publicacion = await pb.collection('animal_post').getOne(publicacionId);
        const animal = await pb.collection('animal').getOne(animalId);

        // Dependiendo del status de la publicación, redirigir al formulario adecuado
        let formularioUrl = '';
        if (status === 'perdido') {
            formularioUrl = '/vista/formanimal_perdido.html';
        } else if (status === 'encontrado') {
            formularioUrl = '/vista/formanimal_encontrado.html';
        } else if (status === 'adopcion') {
            formularioUrl = '/vista/formanimal_adopcion.html';
        }

        // Almacenar el ID de la publicación y animal para usar en el formulario de edición
        sessionStorage.setItem('editPublicacionId', publicacionId);
        sessionStorage.setItem('editAnimalId', animalId);

        // Redirigir al formulario correspondiente
        window.location.href = formularioUrl;

    } catch (error) {
        console.error('Error al obtener la publicación o el animal:', error);
    }
}

// Función para eliminar un Animal Post
async function eliminarAnimalPost(postId) {
    if (confirm("¿Estás seguro de que deseas eliminar este post?")) {
        try {
            await pb.collection('animal_post').delete(postId);
            cargarAnimalPosts();
        } catch (error) {
            console.error("Error al eliminar el animal post:", error);
        }
    }
}