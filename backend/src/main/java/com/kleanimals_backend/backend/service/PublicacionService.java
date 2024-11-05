package com.kleanimals_backend.backend.service;

import java.util.List;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.kleanimals_backend.backend.models.Publicaciones;
import com.kleanimals_backend.backend.repository.PublicacionRepository;

@Service
public class PublicacionService {

    @Autowired
    private PublicacionRepository publicacionRepository;


    public List<Publicaciones> listarTodas() {
        return publicacionRepository.findAll();
    }

    public Publicaciones guardarPublicacion(Publicaciones publicacion) {
        return publicacionRepository.save(publicacion);
    }

    public Publicaciones obtenerPublicacionPorId(Long id) {
        return publicacionRepository.findById(id).orElse(null);
    }

    
}


