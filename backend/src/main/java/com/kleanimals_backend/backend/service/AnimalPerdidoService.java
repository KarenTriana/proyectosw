package com.kleanimals_backend.backend.service;


import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kleanimals_backend.backend.models.AnimalPerdido;
import com.kleanimals_backend.backend.models.Usuario;
import com.kleanimals_backend.backend.repository.AnimalPerdidoRepository;



@Service
public class AnimalPerdidoService {
    @Autowired
    private AnimalPerdidoRepository animalPerdidoRepository;

    public void guardar(AnimalPerdido animalPerdido) {
        animalPerdidoRepository.save(animalPerdido);
    }

    public List<AnimalPerdido> encontrarPorUsuario(Usuario usuario) {
         if (usuario != null) {
        return animalPerdidoRepository.findByUsuarioId(usuario.getId());
    }
    return new ArrayList<>(); // Retorna una lista vacía si el usuario es null
}
}
