package es.us.dp1.l4_04_24_25.saboteur.game;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.chat.Chat;
import es.us.dp1.l4_04_24_25.saboteur.model.Admin;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
//@EqualsAndHashCode(of = "id")
@Table(name = "Game")
public class Game extends BaseEntity{

    private Duration time = Duration.ZERO;

    @Column(name = "gameStatus", nullable = false)
    private gameStatus gameStatus;

    @Column(unique = true, nullable = false)
    private String link;

    // Relacion varias partidas son gestionadas por varios administradores
    @ManyToMany(mappedBy = "managedGames")
    private List<Admin> admins = new ArrayList<>();

    // Relación 1 partidas son observadas por n jugador

    @OneToMany(mappedBy = "game")
    private List<Player> watchers = new ArrayList<>();

    //Relacion n partida es jugada por n participantes

    @ManyToMany
    @JoinTable(
        name = "game_activePlayers",
        joinColumns = @JoinColumn(name = "game_id"),
        inverseJoinColumns = @JoinColumn(name = "activePlayer_id")
    )
    private List<ActivePlayer> activePlayers = new ArrayList<>();

    //Relacion 1 partida es ganada por 1 participante
    @OneToOne(mappedBy = "wonGame")
    private ActivePlayer winner;

    //Relacion 1 partida es creada por 1 participante
    @OneToOne(mappedBy = "createdGame")
    private ActivePlayer creator;

    //Relacion 1 partida tiene 3 rondas
    @OneToMany(mappedBy = "game")
    private List<Round> rounds = new ArrayList<>();

    //Relacion 1 partida 1 chat
    @OneToOne
    private Chat chat;


    public void agregarRonda (Round ronda){
        if(rounds.size()<3){
            rounds.add(ronda);
            ronda.setGame(this);
        } else{
            throw new IllegalStateException("Una partida no puede tener más de 3 rondas");
        }
    }

}
