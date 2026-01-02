package es.us.dp1.l4_04_24_25.saboteur.card;

import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;

public interface CardRepository extends CrudRepository<Card,Integer> {
    @Query("SELECT c FROM Card c WHERE c.id NOT IN (125, 126, 127)")
    List<Card> findPlayableCards(); 
}
