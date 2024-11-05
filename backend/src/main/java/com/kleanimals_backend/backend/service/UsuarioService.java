package com.kleanimals_backend.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kleanimals_backend.backend.models.Usuario;
import com.kleanimals_backend.backend.repository.UsuarioRepository;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Registrar un nuevo usuario
    public Usuario registrarUsuario(Usuario usuario) {
        return usuarioRepository.save(usuario);
    }

    // Obtener todos los usuarios
    public List<Usuario> obtenerTodosLosUsuarios() {
        return usuarioRepository.findAll();
    }

    // Buscar un usuario por su correo electrónico
    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public Usuario buscarPorCorreo(String email) {
        return usuarioRepository.findByEmail(email);
    }
     
    public Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null); // Devuelve null si no se encuentra
    }

    public void guardar(Usuario usuario) {
        usuarioRepository.save(usuario);
    }
}
