package com.kleanimals_backend.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.kleanimals_backend.backend.models.Animales;

public interface AnimalRepository extends JpaRepository<Animales, Long> {
    
}