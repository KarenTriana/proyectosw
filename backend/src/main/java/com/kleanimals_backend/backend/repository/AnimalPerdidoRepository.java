package com.kleanimals_backend.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.kleanimals_backend.backend.models.AnimalPerdido;


public interface AnimalPerdidoRepository extends JpaRepository<AnimalPerdido, Long> {
    List<AnimalPerdido> findByUsuarioId(Long usuario);
    
    // Método para encontrar animales perdidos por ubicación
    List<AnimalPerdido> findByUbicacion(String ubicacion);
}
