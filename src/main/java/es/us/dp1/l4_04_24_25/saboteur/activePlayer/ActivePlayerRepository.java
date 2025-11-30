package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivePlayerRepository extends JpaRepository<ActivePlayer, Integer> {

    Optional<ActivePlayer> findByUsername(String username);

    //Iterable<ActivePlayer> findByGameId(Integer gameId);

    Iterable<ActivePlayer> findByRol(boolean rol);

 
    //@Query("SELECT ap FROM ActivePlayer ap WHERE ap.wonGame.id = :gameId")
    //Optional<ActivePlayer> findWinnerByGameId(Integer gameId);

    
    Iterable<ActivePlayer> findByPickaxeState(boolean pickaxeState);

    
    Iterable<ActivePlayer> findByCandleState(boolean candleState);


    Iterable<ActivePlayer> findByCartState(boolean cartState);

    boolean existsByUsername (String username);

} 