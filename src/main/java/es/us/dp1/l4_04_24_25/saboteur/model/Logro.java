package es.us.dp1.l4_04_24_25.saboteur.model;

import java.util.ArrayList;
import java.util.List;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Logro")
public class Logro extends BaseEntity{

    @NotEmpty
    @Column (unique = true, nullable = false)
    private String titulo;

    @NotEmpty
    @Column(name = "descripcion", nullable = false)
    private String descripcion;

    private Integer puntuacion = 0; //Valor inicial es 0 si no se indica lo contrario

    //Relacion muchos logros a un administrador que lo crea

    @ManyToOne
    @JoinColumn(name = "creador_id")
    private Administrador creador;

    //Relacion muchos logros a muchos administradores que lo gestionan
    @ManyToMany(mappedBy = "logrosGestionados")
    private List<Administrador> administradores =  new ArrayList<>();
    
    //Relacion muchos logros a muchos jugadores que lo han adquirido
    @ManyToMany(mappedBy = "logrosAdquiridos")
    private List<Jugador> jugadores = new ArrayList<>();


}