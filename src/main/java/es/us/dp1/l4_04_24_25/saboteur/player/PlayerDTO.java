package es.us.dp1.l4_04_24_25.saboteur.player;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlayerDTO{

    private String username;
    private String name;
    private String birthDate;
    private LocalDateTime joined;
    private String image;
    private String email;
    private String authority;
    private Integer playedGames;
    private Integer wonGames;
    private Integer destroyedPaths;
    private Integer builtPaths;
    private Integer acquiredGoldNuggets;
    private Integer peopleDamaged;
    private Integer peopleRepaired;
    private boolean isWatcher;

    public PlayerDTO() {
    }

    public PlayerDTO(String username, String name, String birthDate, LocalDateTime joined, String image, String email, String authority, 
            Integer playedGames, Integer wonGames, Integer destroyedPaths, Integer builtPaths, Integer acquiredGoldNuggets, Integer peopleDamaged, Integer peopleRepaired, boolean isWatcher) {
        this.username = username;
        this.name = name;
        this.birthDate = birthDate;
        this.joined = joined;
        this.image = image;
        this.email = email;
        this.authority = authority;
        this.playedGames = playedGames;
        this.wonGames = wonGames;
        this.destroyedPaths = destroyedPaths;
        this.builtPaths = builtPaths;
        this.acquiredGoldNuggets = acquiredGoldNuggets;
        this.peopleDamaged = peopleDamaged;
        this.peopleRepaired = peopleRepaired;
        this.isWatcher = isWatcher;


    }
}