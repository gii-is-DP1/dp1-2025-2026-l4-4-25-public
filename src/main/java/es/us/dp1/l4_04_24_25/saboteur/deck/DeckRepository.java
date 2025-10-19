package es.us.dp1.l4_04_24_25.saboteur.deck;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import es.us.dp1.l4_04_24_25.saboteur.card.Card;

public interface DeckRepository extends CrudRepository<Deck, Integer> {
    
    Optional<Deck> findByActivePlayerId(Integer activePlayerId);


    @Query("SELECT c.deck FROM Card c WHERE c.id = :cardId") 
    Optional<Deck> findDeckByCardId(@Param("cardId") Integer cardId); 

    @Query("SELECT COUNT(c) FROM Card c WHERE c.deck.id = :deckId")
    Integer countCardsByDeckId(@Param("deckId") Integer deckId);
}