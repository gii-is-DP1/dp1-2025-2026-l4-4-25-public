package es.us.dp1.l4_04_24_25.saboteur.game;

import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface GameRepository extends CrudRepository<Game, Integer> {

    @Override
    Optional<Game> findById(Integer id);

    Optional<Game> findByLink(String link);

    Optional<Game> findByCreatorUsername(String creatorUsername);

    Boolean existsByLink(String link);
/* 
   // Buscar todas las partidas gestionadas por un administrador específico
    @Query("SELECT g FROM Game g JOIN g.admins a WHERE a.username = :adminUsername")
    Iterable<Game> findAllByAdminUsername(String adminUsername);
*/
    // Buscar todas las partidas que no son privadas
    @Query("SELECT g FROM Game g WHERE g.isPrivate = false")
    Iterable<Game> findAllPublicGames();

    // Buscar todas las partidas que son privadas
    @Query("SELECT g FROM Game g WHERE g.isPrivate = true")
    Iterable<Game> findAllPrivateGames();

    @Query("SELECT g FROM Game g JOIN g.activePlayers ap WHERE ap.id = :activePlayerId")
    Iterable<Game> findAllByActivePlayerId(@Param("activePlayerId") Integer activePlayerId);
    
}
