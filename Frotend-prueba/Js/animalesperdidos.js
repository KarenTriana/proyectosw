const pb = new PocketBase('http://127.0.0.1:8090'); // URL de tu servidor PocketBase

// Variables de paginación
let currentPage = 1;
const postsPerPage = 6; // Número de publicaciones por página

document.addEventListener('DOMContentLoaded', () => {
    console.log("Página cargada. Iniciando carga de filtros y publicaciones...");
    
    // Actualizar los enlaces de autenticación
    actualizarEnlacesAutenticacion();
    
    cargarFiltros(); // Cargar las opciones de los filtros dinámicamente
    loadPublicaciones(); // Cargar todas las publicaciones sin paginación
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

// Función para cargar las opciones de los filtros dinámicamente
async function cargarFiltros() {
    try {
        console.log("Cargando opciones para los filtros...");
        const animales = await pb.collection('animal').getFullList(1000); // Carga hasta 1000 registros (ajusta según necesidad)
        console.log("Animales obtenidos para filtros:", animales);

        // Utilizamos sets para obtener valores únicos
        const especiesUnicas = new Set();
        const edadesUnicas = new Set();
        const tamanosUnicos = new Set();
        const coloresUnicos = new Set();

        // Agrega los valores únicos a cada set
        animales.forEach(animal => {
            if (animal.especie) especiesUnicas.add(animal.especie);
            if (animal.edad) edadesUnicas.add(animal.edad);
            if (animal.tamano) tamanosUnicos.add(animal.tamano);
            if (animal.color) coloresUnicos.add(animal.color);
        });

        // Llenar las opciones de cada filtro en el formulario
        console.log("Especies únicas:", especiesUnicas);
        console.log("Edades únicas:", edadesUnicas);
        console.log("Tamaños únicos:", tamanosUnicos);
        console.log("Colores únicos:", coloresUnicos);

        llenarOpcionesFiltro('especie', especiesUnicas);
        llenarOpcionesFiltro('edad', edadesUnicas);
        llenarOpcionesFiltro('tamano', tamanosUnicos);
        llenarOpcionesFiltro('color', coloresUnicos);

    } catch (error) {
        console.error("Error al cargar las opciones de los filtros:", error);
    }
}

// Función para llenar las opciones de un filtro con valores únicos
function llenarOpcionesFiltro(idElemento, valores) {
    const select = document.getElementById(idElemento);
    select.innerHTML = '<option value="">Todas</option>'; // Opción para no filtrar
    valores.forEach(valor => {
        const option = document.createElement('option');
        option.value = valor;
        option.textContent = valor;
        select.appendChild(option);
    });
}

// Función para cargar todas las publicaciones sin paginación y con el estado
async function loadPublicaciones(page) {
    const publicacionesContainer = document.getElementById('publicaciones');
    publicacionesContainer.innerHTML = ''; // Limpiar publicaciones anteriores

    try {
        const offset = (page - 1) * postsPerPage;
        const publicaciones = await pb.collection('animal_post').getList(page, postsPerPage, {
            filter: "status='perdido'",
        });

        mostrarPublicaciones(publicaciones.items, publicacionesContainer);
        actualizarPaginacion(publicaciones.page, publicaciones.totalPages);
    } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
    }
}

async function buscar_filtro() {
    const publicacionesContainer = document.getElementById('publicaciones');
    publicacionesContainer.innerHTML = ''; // Limpiar publicaciones anteriores

    // Obtener valores seleccionados de los filtros
    const especie = document.getElementById('especie').value;
    const edad = document.getElementById('edad').value;
    const tamano = document.getElementById('tamano').value;
    const color = document.getElementById('color').value;

    if (!especie && !edad && !tamano && !color) {
        console.log("Todos los filtros están vacíos. Cargando todas las publicaciones.");
        loadPublicaciones(); // Cargar todas las publicaciones sin filtros
        return;
    }

    let condiciones = ["status='perdido'"];
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

// Función para mostrar las publicaciones en la página
function mostrarPublicaciones(publicaciones, publicacionesContainer) {
    publicaciones.forEach(async (publicacion) => {
        const animal_id = publicacion.animal_id;
        try {
            const animal = await pb.collection('animal').getOne(animal_id);

            // Crear el contenedor de la tarjeta
            const card = document.createElement('div');
            card.classList.add('card');
            
            // Establecer el estilo directamente en la tarjeta
            card.style.marginBottom = '50px';
            card.style.border = 'none';
            card.style.borderRadius = '10px';
            card.style.backgroundColor = '#F5F5DC';  // Fondo de la publicación
            card.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            card.style.transition = 'transform 0.2s';
            card.style.width = '100%';  // Asegura que las tarjetas ocupen el ancho completo del contenedor
            card.style.maxWidth = '400px';  // Aumenta el ancho máximo de las tarjetas
            card.style.height = 'auto';  // Ajusta la altura automáticamente en función del contenido

            // Crear el botón en lugar de un enlace
            const botonDetalles = document.createElement('button');
            botonDetalles.textContent = 'Ver más detalles';
            botonDetalles.classList.add('btn-primary');
            botonDetalles.onclick = () => {
                window.location.href = `detalles.html?id=${animal.id}`;
            };

            // Añadir el contenido HTML de la tarjeta
            card.innerHTML = `
                <img src="${animal.imagen_url || 'https://via.placeholder.com/300'}" alt="Animal perdido" style="width: 100%; height: 295px; object-fit: cover; border-radius: 10px;">
                <div class="card-body" style="padding: 20px;">
                    <h5 style="font-size: 1.25rem; margin-bottom: 10px; color: #BF985F;">${animal.name || 'Nombre no disponible'}</h5>
                    <p>Publicado el: ${new Date(publicacion.created).toLocaleDateString()}</p>
                </div>
            `;

            // Añadir el botón después de la información "Publicado el"
            card.querySelector('.card-body').appendChild(botonDetalles);

            // Añadir la tarjeta al contenedor de publicaciones
            publicacionesContainer.appendChild(card);

            // Añadir el efecto hover al card
            card.addEventListener('mouseover', () => {
                card.style.transform = 'translateY(-5px)';
            });

            card.addEventListener('mouseout', () => {
                card.style.transform = 'none';
            });

        } catch (error) {
            console.error('Error al obtener los detalles del animal:', error);
        }
    });
}


// Función para actualizar la paginación
function actualizarPaginacion(page) {
    const paginationContainer = document.getElementById('paginacion');
    paginationContainer.innerHTML = ''; // Limpiar paginación anterior

    const totalPages = Math.ceil(100 / postsPerPage); // Ajusta el número total de páginas según tus datos

    for (let i = 1; i <= totalPages; i++) {
        const pageLink = document.createElement('button');
        pageLink.textContent = i;
        pageLink.classList.add('page-link');
        if (i === page) {
            pageLink.classList.add('active');
        }
        pageLink.addEventListener('click', () => {
            currentPage = i;
            loadPublicaciones(currentPage); // Cargar publicaciones para la nueva página
        });
        paginationContainer.appendChild(pageLink);
    }
}
