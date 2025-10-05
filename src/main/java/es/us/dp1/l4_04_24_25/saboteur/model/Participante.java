package es.us.dp1.l4_04_24_25.saboteur.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Participante")
public class Participante extends Jugador{

    private boolean rol;

    @Max(50)
    private Integer pepitas = 0;

    private boolean estadoPico;

    private boolean estadoLampara;

    private boolean estadoVagoneta;

    // Relación varios participantes ayudan a varios participantes
    @ManyToMany
    @JoinTable(
        name = "ayudas",
        joinColumns = @JoinColumn(name = "participante_id"),
        inverseJoinColumns = @JoinColumn(name = "participanteAyudado_id")
    )
    private List<Jugador> ayudas = new ArrayList<>();

    // Relación varios participantes perjudican a varios jugadores
    @ManyToMany
    @JoinTable(
        name = "perjudicaciones",
        joinColumns = @JoinColumn(name = "participante_id"),
        inverseJoinColumns = @JoinColumn(name = "participantePerjudicado_id")
    )
    private List<Jugador> perjudicaciones = new ArrayList<>();

    //Relacion varios participantes juegan varias partidas
    @ManyToMany(mappedBy = "participantes")
    private List<Partida> partidas = new ArrayList<>();

    //Relación 1 participante gana 1 partida
    @OneToOne
    @JoinColumn(name = "partida_ganada_id")
    private Partida partidaGanada;

    //Relación 1 participante crea 1 partida
    @OneToOne
    @JoinColumn(name = "partida_creada_id")
    private Partida partidaCreada;

    // Relación 1 participante 1 mano
    @OneToOne
    @JoinColumn(name = "mano_id")
    private Mano mano;

    //Relación 1 participante ocupa varias casillas
    @OneToMany(mappedBy = "participante")
    private List<Casillas> casillas = new ArrayList<>();

    //Relación 1 participante varios mensajes
    @OneToMany(mappedBy = "participante")
    private List<Mensaje> mensajes = new ArrayList<>();


    //AÑADIR RELACIÓN CON MANO, CASILLAS, MENSAJE, PARTIDA (JUEGAN, CREA, GANA)
}