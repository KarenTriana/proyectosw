const pb = new PocketBase('http://127.0.0.1:8090'); // URL de tu servidor PocketBase

document.addEventListener('DOMContentLoaded', async () => {
    const usuario = pb.authStore.model;

    // Verificar si el usuario tiene el rol de administrador
    if (!usuario || usuario.role !== 'usuario') {
        alert("Acceso denegado. Solo los usuarios pueden acceder a esta página.");
        window.location.href = "/vista/index-pocketbase.html";
        return;
    }

    cargarFiltros();
    cargarAnimalPosts();
    document.getElementById('animalForm').addEventListener('submit', guardarAnimalPost);
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

    const especie = document.getElementById('especie').value;
    const edad = document.getElementById('edad').value;
    const tamano = document.getElementById('tamano').value;
    const color = document.getElementById('color').value;

    let filtroAnimal = "status='perdido'";
    if (especie) filtroAnimal += ` && especie='${especie}'`;
    if (edad) filtroAnimal += ` && edad='${edad}'`;
    if (tamano) filtroAnimal += ` && tamano='${tamano}'`;
    if (color) filtroAnimal += ` && color='${color}'`;

    try {
        const animalesFiltrados = await pb.collection('animal').getFullList(1000, { filter: filtroAnimal });
        const animalIds = animalesFiltrados.map(animal => animal.id);

        if (animalIds.length === 0) {
            publicacionesContainer.innerHTML = '<p>No se encontraron resultados.</p>';
            return;
        }

        const filtroAnimalPost = `animal_id ?= ${animalIds.map(id => `'${id}'`).join(", ")}`;
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
            postElement.classList.add('post');
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
    });
}

// Función para guardar o actualizar un Animal Post
async function guardarAnimalPost(event) {
    event.preventDefault();

    const postId = document.getElementById('postId').value;
    const animalId = document.getElementById('animalId').value;
    const status = document.getElementById('status').value;

    const data = { animal_id: animalId, status: status };

    try {
        if (postId) {
            await pb.collection('animal_post').update(postId, data);
        } else {
            await pb.collection('animal_post').create(data);
        }
        cargarAnimalPosts();
        document.getElementById('animalForm').reset();
    } catch (error) {
        console.error("Error al guardar el animal post:", error);
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
