package com.kleanimals_backend.backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import com.kleanimals_backend.backend.service.AnimalService;

@CrossOrigin(origins = "http://localhost:8080")
@RestController
@RequestMapping("/animales") // Endpoint para acceder a los animales
public class AnimalController {

    @Autowired
    private AnimalService animalService;

    @GetMapping("/especies") // Para obtener la lista de especies
    public ResponseEntity<List<String>> obtenerEspecies() {
        return ResponseEntity.ok(animalService.obtenerEspecies());
    }

    @GetMapping("/edades") // Para obtener la lista de rangos de edad
    public ResponseEntity<List<String>> obtenerEdades() {
        return ResponseEntity.ok(animalService.obtenerEdades());
    }

    @GetMapping("/tamanos") // Para obtener la lista de tamaños
    public ResponseEntity<List<String>> obtenerTamanos() {
        return ResponseEntity.ok(animalService.obtenerTamanos());
    }
    
  
}
