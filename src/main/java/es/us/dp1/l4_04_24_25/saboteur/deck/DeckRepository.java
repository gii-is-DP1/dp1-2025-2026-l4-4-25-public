package es.us.dp1.l4_04_24_25.saboteur.deck;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


public interface DeckRepository extends CrudRepository<Deck, Integer> {
    
    @Override
    Optional<Deck> findById(Integer id);

    Optional<Deck> findByActivePlayerId(Integer activePlayerId);

    
    @Query("SELECT COUNT(c) FROM Card c WHERE c.deck.id = :deckId")
    Integer countCardsByDeckId(@Param("deckId") Integer deckId);
}