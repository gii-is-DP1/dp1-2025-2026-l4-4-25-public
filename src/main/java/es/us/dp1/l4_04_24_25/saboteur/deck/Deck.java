package es.us.dp1.l4_04_24_25.saboteur.deck;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerSerializer;
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
    @JsonSerialize(using = ActivePlayerSerializer.class)
    @JsonDeserialize(using = ActivePlayerDeserializer.class)
    @OneToOne(mappedBy = "deck")
    private ActivePlayer activePlayer;

}