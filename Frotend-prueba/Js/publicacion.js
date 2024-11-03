async function cargarDatos() {
    try {
        const especiesResponse = await fetch('http://localhost:8080/animales/especies');    
        const edadesResponse = await fetch('http://localhost:8080/animales/edades');
        const tamanosResponse = await fetch('http://localhost:8080/animales/tamanos');

        if (!especiesResponse.ok || !edadesResponse.ok || !tamanosResponse.ok) {
            throw new Error('Error al cargar los datos');
        }

        const especies = await especiesResponse.json();
        const edades = await edadesResponse.json();
        const tamanos = await tamanosResponse.json();

        // Llenar especies
        const especieSelect = document.getElementById('especie');
        especies.forEach(especie => {
            const option = document.createElement('option');
            option.value = especie;
            option.textContent = especie;
            especieSelect.appendChild(option);
        });

        // Llenar edades
        const edadSelect = document.getElementById('edad');
        edades.forEach(edad => {
            const option = document.createElement('option');
            option.value = edad;
            option.textContent = edad;
            edadSelect.appendChild(option);
        });

        // Llenar tamaños
        const tamanoSelect = document.getElementById('tamano');
        tamanos.forEach(tamano => {
            const option = document.createElement('option');
            option.value = tamano;
            option.textContent = tamano;
            tamanoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
}

// Mostrar campos adicionales según la categoría
function mostrarCamposPorCategoria(categoria) {
    const camposAdicionales = document.getElementById('camposAdicionales');
    const camposDescripcion = document.getElementById('camposDescripcion');
    
    const ubicacionInput = document.getElementById('ubicacion');
    const fechaInput = document.getElementById('fecha');
    const tipoPublicacionInput = document.getElementById('tipoPublicacion'); // Obtener el input oculto

    console.log(`Nombre: ${nombre}`);
    console.log(`Email: ${email}`);
    
    // Resetear valores y estados
    camposAdicionales.style.display = 'none';
    camposDescripcion.style.display = 'none';

    // Lógica para mostrar u ocultar campos según la categoría
    switch (categoria) {
        case 'PERDIDO':
            tipoPublicacionInput.value = 'PERDIDO'; // Establecer valor para tipoPublicacion
            camposAdicionales.style.display = 'block'; // Mostrar campos de ubicación y fecha
            camposDescripcion.style.display = 'block'; // Mostrar campos de descripción, video y galería
            ubicacionInput.placeholder = 'Ubicación donde se perdió';
            fechaInput.placeholder = 'Fecha en que se perdió';
            ubicacionInput.setAttribute('required', 'required'); // Asegurarse de que sea requerido
            fechaInput.setAttribute('required', 'required'); // Asegurarse de que sea requerido
            break;
        case 'ENCONTRADO':
            tipoPublicacionInput.value = 'ENCONTRADO'; // Establecer valor para tipoPublicacion
            camposAdicionales.style.display = 'block'; // Mostrar campos de ubicación y fecha
            camposDescripcion.style.display = 'block'; // Mostrar campos de descripción, video y galería
            ubicacionInput.placeholder = 'Ubicación donde se encontró';
            fechaInput.placeholder = 'Fecha en que se encontró';
            ubicacionInput.setAttribute('required', 'required'); // Asegurarse de que sea requerido
            fechaInput.setAttribute('required', 'required'); // Asegurarse de que sea requerido
            break;
        case 'ADOPCION':
            tipoPublicacionInput.value = 'ADOPCION'; // Establecer valor para tipoPublicacion
            camposAdicionales.style.display = 'none'; // Ocultar campos de ubicación y fecha
            camposDescripcion.style.display = 'block'; // Mostrar campos de descripción, video y galería
            ubicacionInput.removeAttribute('required'); // No requerido
            fechaInput.removeAttribute('required'); // No requerido
            break;
        default:
            break;
    }
}


// Obtener la categoría desde la URL
function obtenerCategoriaDesdeURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('categoria'); // Devuelve el valor de 'categoria'
}

window.onload = async () => {
    await cargarDatos(); // Cargar los datos de especies, edades y tamaños
    const categoria = obtenerCategoriaDesdeURL();
    mostrarCamposPorCategoria(categoria);
};

document.getElementById('tipoPublicacion').addEventListener('change', function() {
    const tipoSeleccionado = this.value;
    const camposAdicionales = document.getElementById('camposAdicionales');
    
    if (tipoSeleccionado === 'PERDIDO' || tipoSeleccionado === 'ENCONTRADO') {
        camposAdicionales.style.display = 'block'; // Mostrar campos de ubicación y fecha
    } else if (tipoSeleccionado === 'ADOPCION') {
        camposAdicionales.style.display = 'none'; // Ocultar campos de ubicación y fecha
    }
});


// Manejo del envío del formulario
document.getElementById('publicacionForm').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    if (!e.target.checkValidity()) {
        alert('Por favor completa todos los campos requeridos.');
        return; 
    }

    const formData = new FormData(e.target); // Crear FormData directamente
    for (const [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
    }
    

    try {
        const response = await fetch('http://localhost:8080/publicaciones', {
            method: 'POST',
            body: formData, // Enviar FormData directamente
        });

        if (response.ok) {
            alert('Publicación creada exitosamente');
            e.target.reset(); 
        } else {
            // Intentar obtener el mensaje de error del cuerpo de la respuesta
            const errorResponseText = await response.text(); // Obtener texto de la respuesta
            try {
                const errorResponse = JSON.parse(errorResponseText); // Intentar convertir a JSON
                alert('Error al crear la publicación: ' + errorResponse.error); // Usar el campo correspondiente
            } catch (jsonError) {
                // Si no se puede convertir a JSON, mostrar el texto plano
                alert('Error al crear la publicación: ' + errorResponseText);
            }
        }
    } catch (error) {
        console.error('Error al enviar el formulario:', error);
        alert('Error en la comunicación con el servidor');
    }
});

