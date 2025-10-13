package es.us.dp1.l4_04_24_25.saboteur.round;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
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
@Table(name = "Round")
public class Round extends BaseEntity{

    private Duration timeSpent = Duration.ZERO;

    @Column(name = "leftCards", nullable = false)
    private Integer leftCards;

    @Column(name = "winnerRol", nullable = false)
    private boolean winnerRol;

    private Integer turn = 1;

    //Relacion n rondas pertenecen a 1 partida
    @ManyToOne
    @JoinColumn(name = "game_id")
    private Game game;

    //Relacion 1 ronda tiene 1 tablero
    @OneToOne
    @JoinColumn(name = "board_id")
    private Board board;



}