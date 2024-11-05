package com.kleanimals_backend.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "animales_adoptados")
public class AnimalAdoptado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "idAnimal", nullable = false)
    private Animales animal;

    @ManyToOne
    @JoinColumn(name = "idUsuario", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "idPublicacion_AnimalAdoptado")  // Define la clave foránea hacia `Publicaciones`
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

}
