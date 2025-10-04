package es.us.dp1.l4_04_24_25.saboteur.model;

import java.util.ArrayList;
import java.util.List;


import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Administrador")
public class Administrador extends Usuario {

    //RELACION CON USUARIOS
    @JoinTable(
        name = "administrador_usuario",
        joinColumns = @JoinColumn(name = "administrador_id"),
        inverseJoinColumns = @JoinColumn(name = "usuario_id")
    )
    private List<Usuario> usuarios = new ArrayList<>();

    //RELACION -> ADMIN CREA LGORO
    @OneToMany (mappedBy = "creador", cascade = CascadeType.ALL, orphanRemoval = true) //CASCADE ES PARA QUE CUALQIUER ACCIÓN SOBRE EL PADRE (EL ADMIN) SE APLIQUE TAMBIEN SOBRE SU HIJO (LOGRO)
    private List<Logro> logrosCreados = new ArrayList<>();

    //RELACION -> ADMIN EDITA LOGRO
    @ManyToMany
    @JoinTable(
        name = "administrador_logro",
        joinColumns = @JoinColumn(name = "administrador_id"),
        inverseJoinColumns = @JoinColumn(name = "logro_id")
    )
    private List<Logro> logrosGestionados = new ArrayList<>();


    //RELACION -> ADMIN GESTIONA PARTIDA
    @ManyToMany
    @JoinTable(
        name = "administrador_partida",
        joinColumns = @JoinColumn(name = "administrador_id"),
        inverseJoinColumns = @JoinColumn(name = "partida_id")
    )
    private List<Partida> partidasGestionadas = new ArrayList<>();

}