package com.kleanimals_backend.backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.kleanimals_backend.backend.models.AnimalAdoptado;
import com.kleanimals_backend.backend.models.AnimalEncontrado;
import com.kleanimals_backend.backend.models.AnimalPerdido;
//import com.kleanimals_backend.backend.models.Animales;
import com.kleanimals_backend.backend.models.Publicaciones;
import com.kleanimals_backend.backend.models.Publicaciones.Categoria;
import com.kleanimals_backend.backend.models.Usuario;
import com.kleanimals_backend.backend.repository.PublicacionRepository;
import com.kleanimals_backend.backend.service.AnimalAdoptadoService;
import com.kleanimals_backend.backend.service.AnimalEncontradoService;
import com.kleanimals_backend.backend.service.AnimalPerdidoService;
import com.kleanimals_backend.backend.service.PublicacionService;
import com.kleanimals_backend.backend.service.UsuarioService;

@CrossOrigin(origins = "http://localhost:8080")
@RestController
@RequestMapping("/publicaciones")
public class PublicacionController {

   @Autowired
   private PublicacionService publicacionService;

    @Autowired
    private AnimalPerdidoService animalPerdidoService;
    
    @Autowired
    private AnimalEncontradoService animalEncontradoService;
    
    @Autowired
    private AnimalAdoptadoService animalAdoptadoService;
    
    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private PublicacionRepository publicacionRepository;

    @PostMapping
    public ResponseEntity<Map<String, String>> guardarPublicacion(
            @RequestParam("tipoPublicacion") Categoria tipoPublicacion,
            @RequestParam("descripcion") String descripcion,
            @RequestParam("nombre") String nombre,
            @RequestParam("telefono") String telefono,
            @RequestParam("email") String email,
            @RequestParam(required = false) String ubicacion, // Añadir como parámetro
            @RequestParam(required = false) LocalDate fecha) 
             { // Añadir como parámetro {
        
        Map<String, String> response = new HashMap<>();
    
        if ((tipoPublicacion == Categoria.PERDIDO || tipoPublicacion == Categoria.ENCONTRADO)) {
            if (ubicacion == null || ubicacion.isEmpty()) {
                response.put("error", "El campo 'ubicación' es obligatorio.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            if (fecha == null) {
                response.put("error", "El campo 'fecha' es obligatorio.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
        }
      
        // Validar el usuario
        Usuario usuarioExistente = validarUsuario(email, nombre, response);
        if (usuarioExistente == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        if (usuarioExistente.getTelefono() == null || usuarioExistente.getTelefono().isEmpty()) {
            usuarioExistente.setTelefono(null); // O puedes optar por no hacer nada
        } else {
            // Si hay un valor, lo establece
            usuarioExistente.setTelefono(usuarioExistente.getTelefono());
        }

        
        // Crea y guarda la publicación
        Publicaciones publicacion = new Publicaciones();
        publicacion.setTipoPublicacion(tipoPublicacion);
        publicacion.setDescripcion(descripcion);
        publicacion.setUsuario(usuarioExistente);
        
        try {
            publicacionRepository.save(publicacion);
            manejarTipoPublicacion(publicacion, ubicacion, fecha); // Mueve esta línea fuera del bloque try si es necesario.
            response.put("message", "Publicación guardada exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace(); // O loguea el error
            response.put("error", "Error al guardar la publicación: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Método privado para validar el usuario
    private Usuario validarUsuario(String email, String nombre, Map<String, String> response) {
        Usuario usuarioExistente = usuarioService.obtenerPorEmail(email);
        if (usuarioExistente == null) {
            response.put("error", "Usuario no encontrado.");
            return null;
        }
        if (!usuarioExistente.getNombre().equals(nombre)) {
            response.put("error", "Los datos del usuario no coinciden.");
            return null;
        }
        return usuarioExistente;
    }
    
    private void manejarTipoPublicacion(Publicaciones publicacion, String ubicacion, LocalDate fecha) {
        switch (publicacion.getTipoPublicacion()) {
            case PERDIDO:
                AnimalPerdido animalPerdido = new AnimalPerdido();
                animalPerdido.setAnimal(publicacion.getAnimal());
                animalPerdido.setUsuario(publicacion.getUsuario());
                animalPerdido.setUbicacion(ubicacion);
                animalPerdido.setFechaPerdido(fecha);
                animalPerdidoService.guardar(animalPerdido);
                break;
            case ENCONTRADO:
                AnimalEncontrado animalEncontrado = new AnimalEncontrado();
                animalEncontrado.setAnimal(publicacion.getAnimal());
                animalEncontrado.setUsuario(publicacion.getUsuario());
                animalEncontrado.setUbicacion(ubicacion);
                animalEncontrado.setFechaEncontrado(fecha);
                animalEncontradoService.guardar(animalEncontrado);
                break;
            case ADOPCION:
                AnimalAdoptado animalAdoptado = new AnimalAdoptado();
                animalAdoptado.setAnimal(publicacion.getAnimal());
                animalAdoptado.setUsuario(publicacion.getUsuario());
                animalAdoptadoService.guardar(animalAdoptado);
                break;
        }
    }

    @PostMapping("/archivos")
    public ResponseEntity<Map<String, String>> guardarArchivos(
            @RequestParam("video") MultipartFile video,
            @RequestParam("imagenes") List<MultipartFile> galeria) {
        
        Map<String, String> response = new HashMap<>();

        try {
            // Manejar el archivo de video
            if (video != null && !video.isEmpty()) {
                String videoPath = Paths.get("backend/src/main/resources/static/video", video.getOriginalFilename()).toString();
                Files.copy(video.getInputStream(), Paths.get(videoPath));
            }

            // Manejar cada archivo de la galería
            for (MultipartFile imagenes : galeria) {
                if (!imagenes.isEmpty()) {
                    String imagenPath = Paths.get("backend/src/main/resources/static/video/imagenes", imagenes.getOriginalFilename()).toString();
                    Files.copy(imagenes.getInputStream(), Paths.get(imagenPath));
                }
            }

            response.put("message", "Archivos guardados exitosamente");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            response.put("error", "Error al guardar los archivos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Publicaciones> obtenerPublicacion(@PathVariable Long id) {
        Publicaciones publicacion = publicacionService.obtenerPublicacionPorId(id);
        if (publicacion != null) {
            return ResponseEntity.ok(publicacion);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
