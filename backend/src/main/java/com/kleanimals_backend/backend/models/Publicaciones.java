package com.kleanimals_backend.backend.models;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;

@Entity
@Table(name = "publicaciones")
public class Publicaciones {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false) // Aseguramos que el tipo de publicación no puede ser nulo
    private Categoria tipoPublicacion; // Ahora es un Enum

    @ManyToOne
    @JoinColumn(name = "idAnimal_Publicacion", nullable = false)
    private Animales animal;

    @ManyToOne
    @JoinColumn(name = "idUsuario_Publicacion", nullable = false)
    private Usuario usuario;

    @OneToOne(mappedBy = "publicacion")  // Relaciona a `AnimalPerdido` con `Publicaciones`
    private AnimalPerdido animalPerdido;

    @OneToOne(mappedBy = "publicacion")  // Relaciona a `AnimalEncontrado` con `Publicaciones`
    private AnimalEncontrado animalEncontrado;

    @OneToOne(mappedBy = "publicacion")  // Relaciona a `AnimalAdoptado` con `Publicaciones`
    private AnimalAdoptado animalAdoptado;
 

    @Column(nullable = false) // Aseguramos que la descripción no puede ser nula
    private String descripcion;

    @ElementCollection
    private List<String> video = new ArrayList<>(); // Inicializa la lista

    @ElementCollection
    private List<String> imagen = new ArrayList<>(); // Inicializa la lista

    // Getters y Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Categoria getTipoPublicacion() {
        return tipoPublicacion;
    }

    public void setTipoPublicacion(Categoria tipoPublicacion) {
        this.tipoPublicacion = tipoPublicacion;
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

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public List<String> getVideo() {
        return video;
    }

    public void setVideo(List<String> video) { // Cambiar el tipo a List<String>
        this.video = video;
    }

    public List<String> getImagen() {
        return imagen;
    }

    public void setImagen(List<String> imagen) { // Cambiar el tipo a List<String>
        this.imagen = imagen;
    }

    public enum Categoria {
        PERDIDO,
        ENCONTRADO,
        ADOPCION
    }



}
