package com.kleanimals_backend.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.kleanimals_backend.backend.models.AnimalEncontrado;
import com.kleanimals_backend.backend.repository.AnimalEncontradoRepository;

@Service
public class AnimalEncontradoService {
    @Autowired
    private AnimalEncontradoRepository animalEncontradoRepository;

    public void guardar(AnimalEncontrado animalEncontrado) {
        animalEncontradoRepository.save(animalEncontrado);
    }

    public List<AnimalEncontrado> encontrarPorUsuario(Long usuarioId) {
        return animalEncontradoRepository.findByUsuarioId(usuarioId);
    }
}
