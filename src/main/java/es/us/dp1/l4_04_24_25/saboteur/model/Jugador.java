package es.us.dp1.l4_04_24_25.saboteur.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.JoinColumn;

@MappedSuperclass
@Getter
@Setter
@Table(name = "Jugador")
public class Jugador extends Usuario{

    private Integer partidasJugadas = 0;

    private Integer partidasGanadas = 0;

    private Integer caminosDestruidos = 0;

    private Integer caminosConstruidos = 0;

    private Integer pepitasAcumuladas = 0;

    @Column(name = "esEspectador", nullable = false)
    private boolean esEspectador;

    //Relacion de muchos a muchos con amigos
    @ManyToMany
    @JoinTable(
        name = "amistades",
        joinColumns = @JoinColumn(name = "jugador_id"),
        inverseJoinColumns = @JoinColumn(name = "amigo_id")
    )
    private List<Jugador> amigos = new ArrayList<>();



    //Relacion de muchos jugadores a muchos logros
    @ManyToMany
    @JoinTable(
        name = "logros",
        joinColumns = @JoinColumn(name = "jugador_id"),
        inverseJoinColumns = @JoinColumn(name = "logro_id")
    )
    private List<Logro> logros = new ArrayList<>();

    //Relacion muchos jugadores observan una partida
    @ManyToOne
    @JoinColumn(name = "partida_id")
    private Partida partida;

    // AÑADIR MAS CUANDO TENGAMOS HECHA PARTIDA
}