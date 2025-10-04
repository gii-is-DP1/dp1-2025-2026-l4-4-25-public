package es.us.dp1.l4_04_24_25.saboteur.model;

import java.time.Duration;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;


@Entity
@Getter
@Setter
@Table(name = "Ronda")
public class Ronda extends BaseEntity{

    private Duration tiempoTranscurrido = Duration.ZERO;

    private Integer cartasRestantes;

    private boolean rolGanador;

    private Integer turno = 1;

    //Relacion n rondas pertenecen a 1 partida
    @ManyToOne
    @JoinColumn(name = "partida_id")
    private Partida partida;



}