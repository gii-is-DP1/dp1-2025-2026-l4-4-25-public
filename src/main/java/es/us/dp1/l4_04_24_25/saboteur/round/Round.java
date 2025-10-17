package es.us.dp1.l4_04_24_25.saboteur.round;

import java.time.Duration;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.game.GameSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "Round")
public class Round extends BaseEntity{

    private Duration timeSpent = Duration.ZERO;

    @Column(name = "left_cards", nullable = false)
    private Integer leftCards;

    @Column(name = "winner_rol", nullable = false)
    private boolean winnerRol;

    private Integer turn = 1;

    @JsonSerialize(using = GameSerializer.class)
    @JsonDeserialize(using = GameDeserializer.class)
    //Relacion n rondas pertenecen a 1 partida
    @ManyToOne
    @JoinColumn(name = "game_id")
    private Game game;

    //Relacion 1 ronda tiene 1 tablero
    @OneToOne
    @JoinColumn(name = "board_id")
    private Board board;



}