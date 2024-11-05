package com.kleanimals_backend.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.kleanimals_backend.backend.models.AnimalEncontrado;

public interface AnimalEncontradoRepository extends JpaRepository<AnimalEncontrado, Long> {
    List<AnimalEncontrado> findByUsuarioId(Long usuarioId); // Método para encontrar animales encontrados por usuario

}
