package es.us.dp1.l4_04_24_25.saboteur.round;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

public interface RoundRepository extends CrudRepository<Round, Integer> {

    @Override
    Optional<Round> findById(Integer id);

   
    List<Round> findByRoundNumber(Integer roundNumber);

    List<Round> findByGameId(Integer gameId);

    Optional<Round> findByGameIdAndRoundNumber(Integer gameId, Integer roundNumber);

    List<Round> findByWinnerRol(boolean winnerRol);

    List<Round> findByLeftCardsLessThanEqual(Integer leftCards);
}