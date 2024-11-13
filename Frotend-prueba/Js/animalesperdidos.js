const pb = new PocketBase('http://127.0.0.1:8090'); // URL de tu servidor PocketBase
let currentPage = 1; // Página actual
const postsPerPage = 6; // Publicaciones por página

document.addEventListener('DOMContentLoaded', () => {
    console.log("Página cargada. Iniciando carga de filtros y publicaciones...");
    cargarFiltros(); // Cargar las opciones de los filtros dinámicamente
    loadPublicaciones(currentPage); // Cargar las publicaciones para la página actual
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

// Función para cargar las publicaciones paginadas
async function loadPublicaciones(page) {
    const publicacionesContainer = document.getElementById('publicaciones');
    publicacionesContainer.innerHTML = ''; // Limpiar publicaciones anteriores

    try {
        const publicaciones = await pb.collection('animal_post').getFullList(1000, {
            filter: "status='perdido'",
            page: page, // Página actual
            perPage: postsPerPage // Publicaciones por página
        });

        mostrarPublicaciones(publicaciones, publicacionesContainer);
        actualizarPaginacion(page); // Actualiza los controles de paginación

    } catch (error) {
        console.error('Error al obtener las publicaciones:', error);
    }
}

// Función para realizar la búsqueda de animales con los filtros aplicados
async function buscar_filtro() {
    const publicacionesContainer = document.getElementById('publicaciones');
    publicacionesContainer.innerHTML = ''; // Limpiar publicaciones anteriores

    // Obtener valores seleccionados de los filtros
    const especie = document.getElementById('especie').value.replace(/'/g, "\\'");
    const edad = document.getElementById('edad').value.replace(/'/g, "\\'");
    const tamano = document.getElementById('tamano').value.replace(/'/g, "\\'");
    const color = document.getElementById('color').value.replace(/'/g, "\\'");

    // Construir el filtro para la colección 'animal' con los valores seleccionados
    let condiciones = ["status='perdido'"];
    if (especie) condiciones.push(`especie='${especie}'`);
    if (edad) condiciones.push(`edad='${edad}'`);
    if (tamano) condiciones.push(`tamano='${tamano}'`);
    if (color) condiciones.push(`color='${color}'`);

    const filtroAnimal = condiciones.join(" && ");

    // Imprime el filtro para verificar su formato
    console.log("Filtro aplicado a la colección 'animal':", filtroAnimal);

    try {
        // Obtener los IDs de los animales que cumplen con el filtro
        const animalesFiltrados = await pb.collection('animal').getFullList(1000, { filter: filtroAnimal });
        const animalIds = animalesFiltrados.map(animal => animal.id);
        console.log("IDs de animales filtrados:", animalIds);

        if (animalIds.length === 0) {
            console.log("No se encontraron animales que cumplan con los filtros.");
            publicacionesContainer.innerHTML = '<p>No se encontraron resultados.</p>';
            return;
        }

        // Construir el filtro para la colección 'animal_post' basado en los IDs de 'animal'
       const filtroAnimalPost = `animal_id IN [${animalIds.map(id => `'${id}'`).join(", ")}]`;

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

          const card = document.createElement('div');
          card.classList.add('col-md-4', 'mb-4');
          card.innerHTML = `
          <div class="card" style="background-color: #F5F5DC;">
              <img src="${animal.imagen_url || 'https://via.placeholder.com/300'}" alt="Animal perdido" class="imagen-publicacion">
               <div class="card-body">
                  <h5>${animal.name || 'Nombre no disponible'}</h5>
                  <p>Publicado el: ${new Date(publicacion.created).toLocaleDateString()}</p>
                  <a href="detalles.html?id=${animal_id}" class="btn btn-secondary mt-2">Ver más detalles</a>
              </div>
            </div>
          `;
          publicacionesContainer.appendChild(card);

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

