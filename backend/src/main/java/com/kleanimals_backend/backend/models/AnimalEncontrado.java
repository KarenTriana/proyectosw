package com.kleanimals_backend.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "animales_encontrados")
public class AnimalEncontrado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idAnimal", nullable = false)
    private Animales animal;

    @ManyToOne
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @Column(nullable = false) // La ubicación no puede ser nula
    private String ubicacion;

    @Column(nullable = false) // La fecha de encontrado no puede ser nula
    private LocalDate fechaEncontrado;

    @ManyToOne
    @JoinColumn(name = "idPublicacion_AnimalEncontrado")  // Define la clave foránea hacia `Publicaciones`
    private Publicaciones publicacion;

    // Getters y Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Animales getAnimal() {
        return animal;
    }

    public void setAnimal(Animales animal) {
        this.animal = animal;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public String getUbicacion() {
        return ubicacion;
    }

    public void setUbicacion(String ubicacion) {
        this.ubicacion = ubicacion;
    }

    public LocalDate getFechaEncontrado() {
        return fechaEncontrado;
    }

    public void setFechaEncontrado(LocalDate fechaEncontrado) {
        this.fechaEncontrado = fechaEncontrado;
    }
}
