package es.us.dp1.l4_04_24_25.saboteur.player;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface PlayerRepository extends CrudRepository<Player, Integer> {

    @Override
    Optional<Player> findById(Integer id);

    Optional<Player> findByUsername(String username);

    Optional<Player> findByGameIdAndUsername(Integer gameId, String username);


    // Buscar todos los jugadores de una partida específica
    @Query("SELECT p FROM Player p WHERE p.game.id = :gameId")
    Iterable<Player> findAllByGameId(Integer gameId);

    
}
