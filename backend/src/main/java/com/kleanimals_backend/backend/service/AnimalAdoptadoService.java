package com.kleanimals_backend.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kleanimals_backend.backend.models.AnimalAdoptado;
import com.kleanimals_backend.backend.repository.AnimalAdoptadoRepository;

@Service
public class AnimalAdoptadoService {
    @Autowired
    private AnimalAdoptadoRepository animalAdoptadoRepository;

    public void guardar(AnimalAdoptado animalAdoptado) {
        animalAdoptadoRepository.save(animalAdoptado);
    }

    public List<AnimalAdoptado> encontrarPorUsuario(Long usuarioId) {
        return animalAdoptadoRepository.findByUsuarioId(usuarioId);
    }
}
