package es.us.dp1.l4_04_24_25.saboteur.deck;

import java.util.ArrayList;
import java.util.List;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Deck")
public class Deck extends BaseEntity{

    //Relación 1 mano muchas cartas
    @OneToMany(mappedBy = "deck")
    private List<Card> cards = new ArrayList<>();

    //Relación 1 mano 1 participante
    @OneToOne(mappedBy = "deck")
    private ActivePlayer activePlayer;

}