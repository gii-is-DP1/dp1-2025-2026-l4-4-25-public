package es.us.dp1.l4_04_24_25.saboteur.player;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlayerDTO{

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

    public PlayerDTO(Integer playedGames, Integer wonGames, Integer destroyedPaths, Integer builtPaths,
            Integer acquiredGoldNuggets, Integer peopleDamaged, Integer peopleRepaired, boolean isWatcher) {
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