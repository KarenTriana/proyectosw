package com.kleanimals_backend.backend.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kleanimals_backend.backend.models.Animales;
import com.kleanimals_backend.backend.repository.AnimalRepository;

import java.util.Arrays;
import java.util.List;


@Service
public class AnimalService {

    @Autowired
    private AnimalRepository animalRepository;

      public List<String> obtenerEspecies() {
        // Puedes obtener esto de una base de datos si lo deseas,
        // por ahora usaré un ejemplo estático
        return Arrays.asList("Gato", "Perro", "Loro", "Conejo", "Tortuga");
    }

    public List<String> obtenerEdades() {
        // Ejemplo de rangos de edad, podrías personalizar esto
        return Arrays.asList("Cachorro (0-1 año)", "Joven (1-5 años)", "Adulto (5-10 años)", "Senior (más de 10 años)");
    }

    public List<String> obtenerTamanos() {
        // Listado de tamaños disponibles
        return Arrays.asList("Pequeño", "Mediano", "Grande");
    }

    public Animales guardarAnimal(Animales animal) {
        return animalRepository.save(animal);
    }

    public List<Animales> obtenerAnimales() {
        return animalRepository.findAll();
    }

    

}
