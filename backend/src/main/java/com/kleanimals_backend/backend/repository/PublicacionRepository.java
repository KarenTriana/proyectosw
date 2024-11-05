package com.kleanimals_backend.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.kleanimals_backend.backend.models.Publicaciones;

public interface PublicacionRepository extends JpaRepository<Publicaciones, Long> {
    List<Publicaciones> findByTipoPublicacion(Publicaciones.Categoria tipoPublicacion);
}
