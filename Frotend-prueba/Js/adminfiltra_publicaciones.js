const pb = new PocketBase('http://127.0.0.1:8090'); // URL de tu servidor PocketBase


document.addEventListener('DOMContentLoaded', async () => {
    const usuario = pb.authStore.model;  // Obtén el modelo de usuario autenticado

    // Verificar si el usuario está autenticado y tiene el rol de administrador
    if (!usuario || usuario.role !== 'admin') {
        alert("Acceso denegado. Solo los administradores pueden acceder a esta página.");
        window.location.href = "/vista/index-pocketbase.html"; // Redirigir a la página de inicio
        return;
    }

    // Cargar las publicaciones o realizar otras acciones solo si es admin
    if (window.location.pathname.includes("/vista/adminfiltra_publicaciones.html")) {
        cargarFiltros(); // Solo cargar filtros si estamos en la página de filtros
        cargarAnimalPosts();
    document.getElementById('animalForm').addEventListener('submit', guardarAnimalPost);
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


//filtrar publicaciones

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

async function buscar_filtro() {
    const publicacionesContainer = document.getElementById('publicaciones');
    publicacionesContainer.innerHTML = ''; // Limpiar publicaciones anteriores


    // Obtener valores seleccionados de los filtros
    const especie = document.getElementById('especie').value;
    const edad = document.getElementById('edad').value;
    const tamano = document.getElementById('tamano').value;
    const color = document.getElementById('color').value;
    const status = document.getElementById('status').value;

    let condiciones = [];
    if (status) condiciones.push(`status='${status.replace(/'/g, "\\'")}'`);
    if (especie) condiciones.push(`especie='${especie.replace(/'/g, "\\'")}'`);
    if (edad) condiciones.push(`edad='${edad.replace(/'/g, "\\'")}'`);
    if (tamano) condiciones.push(`tamano='${tamano.replace(/'/g, "\\'")}'`);
    if (color) condiciones.push(`color='${color.replace(/'/g, "\\'")}'`);

    const filtroAnimal = condiciones.join(" && ");

    try {
        // Obtener los IDs de los animales que cumplen con el filtro
        const animalesFiltrados = await pb.collection('animal').getFullList(1000, { filter: filtroAnimal });
        const animalIds = animalesFiltrados.map(animal => animal.id);

        if (animalIds.length === 0) {
            console.log("No se encontraron animales que cumplan con los filtros.");
            publicacionesContainer.innerHTML = '<p>No se encontraron resultados.</p>';
            return;
        }

        // Construir un filtro para 'animal_post' usando OR
        const filtroAnimalPost = animalIds.map(id => `animal_id='${id}'`).join(" || ");

        console.log("Filtro aplicado a la colección 'animal_post':", filtroAnimalPost);

        // Obtener las publicaciones filtradas de 'animal_post'
        const publicaciones = await pb.collection('animal_post').getFullList(1000, { filter: filtroAnimalPost });
        mostrarPublicaciones(publicaciones, publicacionesContainer);

    } catch (error) {
        console.error('Error al aplicar los filtros:', error);
    }
}



// Función para mostrar las publicaciones
async function mostrarPublicaciones(publicaciones, publicacionesContainer) {
    for (const publicacion of publicaciones) {
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
                <button onclick="editarAnimalPost('${publicacion.id}', '${publicacion.animal_id}', '${publicacion.status}')">Editar</button>
                <button onclick="eliminarAnimalPost('${publicacion.id}')">Eliminar</button>
                <hr>
            `;
            publicacionesContainer.appendChild(postElement);
        } catch (error) {
            console.error('Error al obtener los detalles del animal:', error);
        }
    }
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

    // Validar si el animalId tiene espacios o está vacío
    if (!animalId || /\s/.test(animalId)) {
        alert("Por favor, ingresa un Animal ID válido sin espacios.");
        return;
    }

    if (!status) {
        alert("Por favor, selecciona un estado válido.");
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



// Función para cargar todos los Animal Posts sin filtros
async function cargarAnimalPosts() {
    const container = document.getElementById('animalPostsList');
    container.innerHTML = '';

    try {
        const posts = await pb.collection('animal_post').getFullList(1000);
        mostrarPublicaciones(posts, container);
    } catch (error) {
        console.error("Error al cargar los animal posts:", error);
    }
}

// Función para editar un Animal Post
function editarAnimalPost(id, animalId, status) {
    document.getElementById('postId').value = id;
    document.getElementById('animalId').value = animalId;
    document.getElementById('status').value = status;
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
