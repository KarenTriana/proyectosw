package com.kleanimals_backend.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kleanimals_backend.backend.models.Usuario;
import com.kleanimals_backend.backend.repository.UsuarioRepository;
import com.kleanimals_backend.backend.service.UsuarioService;


@CrossOrigin(origins = "http://localhost:8080")
@RestController
@RequestMapping("/usuarios") 
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;


    @Autowired
    private UsuarioRepository usuarioRepository;


    @PostMapping("/registrar")
    public ResponseEntity<Map<String, String>> registrarUsuario(@RequestBody Usuario usuario) {
        Map<String, String> response = new HashMap<>();

        // Valores que permiten la verificación de la contraseña (almenos 5 caracteres, letra mayuscula, caracter)
        String passwordPattern = "^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]).{5,}$";
        if (!usuario.getContraseña().matches(passwordPattern)) {
        response.put("error", "La contraseña debe tener al menos 5 caracteres, una letra mayúscula y un carácter especial.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Verificar si el email ya está registrado
        if (usuarioRepository.existsByEmail(usuario.getEmail())) {
            response.put("error", "El email ya está registrado.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        // Verificar si el nombre de usuario ya está registrado
        if (usuarioRepository.existsByNombreUsuario(usuario.getNombreUsuario())) {
            response.put("error", "El nombre de usuario ya está registrado.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        // Verificar si el número de documento ya está registrado
        if (usuarioRepository.existsByNumeroDocumento(usuario.getNumeroDocumento())) {
            response.put("error", "El número de documento ya está registrado.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        // Guardar el nuevo usuario
        usuarioRepository.save(usuario);
        response.put("message", "Usuario registrado exitosamente.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> loginUsuario(@RequestBody Map<String, String> loginData) {
        Map<String, String> response = new HashMap<>();
        String email = loginData.get("email");
        String password = loginData.get("password");

        Usuario usuario = usuarioRepository.findByEmail(email);
        if (usuario != null && usuario.getContraseña().equals(password)) {
            response.put("success", "true");
            return ResponseEntity.ok(response);
        } else {
            response.put("error", "Email o contraseña incorrectos");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }

     // Endpoint para obtener todos los usuarios
     @GetMapping
     public List<Usuario> obtenerUsuarios() {
         return usuarioService.obtenerTodosLosUsuarios();
     }

   
}