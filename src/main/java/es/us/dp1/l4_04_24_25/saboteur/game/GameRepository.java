package es.us.dp1.l4_04_24_25.saboteur.game;

import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface GameRepository extends CrudRepository<Game, Integer> {

    // Para encontrar las partidas por el estado que introduzca como parametro
    @Query("SELECT g FROM Game g WHERE g.gameStatus = :gameStatus")
    List<Game> findGamesByStatus(@Param("gameStatus") gameStatus gameStatus); // Cambié gameStatus por GameStatus

    // Para encontrar partidas en las que participa/ó un jugador a partir de su id
    @Query("SELECT g FROM Game g JOIN g.activePlayers ap WHERE ap.id = :playerId")
    List<Game> findGamesByPlayerId(@Param("playerId") Integer playerId);

    // Para encontrar partidas a partir del id de un jugador y del estado de la misma(created,ongoing,finished)
    @Query("SELECT g FROM Game g JOIN g.activePlayers ap WHERE ap.id = :playerId AND g.gameStatus = :gameStatus")
    List<Game> findGamesByPlayerAndStatus(@Param("playerId") Integer playerId, @Param("gameStatus") gameStatus gameStatus); // Cambié gameStatus por GameStatus

    // Para encontrar la lista de partidas en las que puedo unirme
    @Query("SELECT g FROM Game g WHERE g.gameStatus = 'CREATED' AND SIZE(g.activePlayers) < 12")
    List<Game> findJoinableGames();
}