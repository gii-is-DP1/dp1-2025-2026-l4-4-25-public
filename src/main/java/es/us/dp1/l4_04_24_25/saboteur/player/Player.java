package es.us.dp1.l4_04_24_25.saboteur.player;

import java.util.ArrayList;
import java.util.List;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
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

    @Column(name = "playedGames", nullable = false)
    private Integer playedGames = 0;

    @Column(name = "wonGames", nullable = false)
    private Integer wonGames = 0;

    @Column(name = "destroyedPaths", nullable = false)
    private Integer destroyedPaths = 0;

    @Column(name = "builtPaths", nullable = false)
    private Integer builtPaths = 0;

    @Column(name = "acquiredGoldNuggets", nullable = false)
    private Integer acquiredGoldNuggets = 0;

    @Column(name = "peopleDamaged", nullable = false)
    private Integer peopleDamaged = 0;

    @Column(name = "peopleRepaired", nullable = false)
    private Integer peopleRepaired = 0;

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