package es.us.dp1.l4_04_24_25.saboteur.model;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;


import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;


@Entity
@Getter
@Setter
//@EqualsAndHashCode(of = "id")
@Table(name = "Partida")
public class Partida extends BaseEntity{

    private Duration tiempoTranscurrido = Duration.ZERO;

    @Column(name = "estadoPartida", nullable = false)
    private estadoPartida estadoPartida;

    @Column(unique = true, nullable = false)
    private String enlace;

    // Relacion varias partidas son gestionadas por varios administradores
    @ManyToMany(mappedBy = "partidasGestionadas")
    private List<Administrador> administradores = new ArrayList<>();

    // Relación 1 partidas son observadas por n jugador

    @OneToMany(mappedBy = "partida")
    private List<Jugador> espectadores = new ArrayList<>();

    //Relacion n partida es jugada por n participantes

    @ManyToMany
    @JoinTable(
        name = "partida_participante",
        joinColumns = @JoinColumn(name = "partida_id"),
        inverseJoinColumns = @JoinColumn(name = "participante_id")
    )
    private List<Participante> participantes = new ArrayList<>();

    //Relacion 1 partida es ganada por 1 participante
    @OneToOne(mappedBy = "partidaGanada")
    private Participante ganador;

    //Relacion 1 partida es creada por 1 participante
    @OneToOne(mappedBy = "partidaCreada")
    private Participante creador;

    //Relacion 1 partida tiene 3 rondas
    @OneToMany(mappedBy = "partida")
    private List<Ronda> rondas = new ArrayList<>();

    //Relacion 1 partida 1 chat
    @OneToOne
    private Chat chat;


    public void agregarRonda (Ronda ronda){
        if(rondas.size()<3){
            rondas.add(ronda);
            ronda.setPartida(this);
        } else{
            throw new IllegalStateException("Una partida no puede tener más de 3 rondas");
        }
    }

}
