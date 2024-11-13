const pb = new PocketBase('http://127.0.0.1:8090'); // URL de tu servidor PocketBase

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const animalId = params.get('id');

    if (!animalId) {
        document.getElementById('animalDetalles').innerHTML = '<p>ID de animal no especificado.</p>';
        return;
    }

    try {
        console.log(`Cargando detalles del animal con ID: ${animalId}`);
        
        // Obtener los datos del animal
        const animal = await pb.collection('animal').getOne(animalId);
        console.log("Detalles del animal:", animal);

        // Renderizar los detalles del animal
        mostrarDetallesAnimal(animal);

    } catch (error) {
        console.error('Error al cargar los detalles del animal:', error);
        document.getElementById('animalDetalles').innerHTML = '<p>Error al cargar los detalles del animal.</p>';
    }
});

// Función para mostrar los detalles del animal en el HTML
function mostrarDetallesAnimal(animal) {
    const container = document.getElementById('animalDetalles');
    container.innerHTML = `
        <div class="animal-detalle-card">
            <img src="${animal.imagen_url || 'https://via.placeholder.com/300'}" alt="${animal.name}">
            <h2>${animal.name || 'Nombre no disponible'}</h2>
            <p><strong>Especie:</strong> ${animal.especie || 'No disponible'}</p>
            <p><strong>Edad:</strong> ${animal.edad || 'No disponible'}</p>
            <p><strong>Tamaño:</strong> ${animal.tamano || 'No disponible'}</p>
            <p><strong>Sexo:</strong> ${animal.sexo || 'No disponible'}</p>
            <p><strong>Color:</strong> ${animal.color || 'No disponible'}</p>
            <p><strong>Raza:</strong> ${animal.raza || 'No disponible'}</p>
            <p><strong>Descripción:</strong> ${animal.description || 'No disponible'}</p>
        </div>
    `;
}
