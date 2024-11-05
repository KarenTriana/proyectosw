package com.kleanimals_backend.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kleanimals_backend.backend.models.Usuario;


public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Usuario findByEmail(String email); //Buscar a usuarios por su correo (en la DB) 
    boolean existsByEmail(String email);
    boolean existsByNombreUsuario(String nombreUsuario);
    boolean existsByNumeroDocumento(String numeroDocumento);

}
