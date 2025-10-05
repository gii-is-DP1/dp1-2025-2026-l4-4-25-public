package es.us.dp1.l4_04_24_25.saboteur.model;

import java.util.ArrayList;
import java.util.List;

import es.us.dp1.l4_04_24_25.saboteur.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "Player")
public class Player extends User{

    private Integer playedGames = 0;

    private Integer wonGames = 0;

    private Integer destroyedPaths = 0;

    private Integer builtPaths = 0;

    private Integer acquiredGoldNuggets = 0;

    @Column(name = "isWatcher", nullable = false)
    private boolean isWatcher;

    //Relacion de muchos a muchos con amigos
    @ManyToMany
    @JoinTable(
        name = "friends",
        joinColumns = @JoinColumn(name = "player_id"),
        inverseJoinColumns = @JoinColumn(name = "friend_id")
    )
    private List<Player> friends = new ArrayList<>();



    //Relacion de muchos jugadores a muchos logros
    @ManyToMany
    @JoinTable(
        name = "accquiredAchievements",
        joinColumns = @JoinColumn(name = "player_id"),
        inverseJoinColumns = @JoinColumn(name = "achievement_id")
    )
    private List<Achievement> accquiredAchievements = new ArrayList<>();

    //Relacion muchos jugadores observan una partida
    @ManyToOne
    @JoinColumn(name = "game_id")
    private Game game;

  
}