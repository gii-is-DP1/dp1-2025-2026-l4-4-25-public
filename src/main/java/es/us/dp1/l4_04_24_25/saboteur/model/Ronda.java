package es.us.dp1.l4_04_24_25.saboteur.model;

import java.time.Duration;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;


@Entity
@Getter
@Setter
@Table(name = "Ronda")
public class Ronda extends BaseEntity{

    private Duration tiempoTranscurrido = Duration.ZERO;

    @Column(name = "cartasRestantes", nullable = false)
    private Integer cartasRestantes;

    @Column(name = "rolGanador", nullable = false)
    private boolean rolGanador;

    private Integer turno = 1;

    //Relacion n rondas pertenecen a 1 partida
    @ManyToOne
    @JoinColumn(name = "partida_id")
    private Partida partida;

    //Relacion 1 ronda tiene 1 tablero
    @OneToOne
    @JoinColumn(name = "tablero_id")
    private Tablero tablero;



}