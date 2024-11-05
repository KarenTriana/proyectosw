package com.kleanimals_backend.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.kleanimals_backend.backend.models.AnimalAdoptado;

public interface AnimalAdoptadoRepository extends JpaRepository<AnimalAdoptado, Long> {
    List<AnimalAdoptado> findByUsuarioId(Long usuarioId); // Método para encontrar adopciones por usuario
}
