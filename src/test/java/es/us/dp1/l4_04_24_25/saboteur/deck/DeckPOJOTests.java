package es.us.dp1.l4_04_24_25.saboteur.deck;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;

import org.junit.jupiter.api.Test;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;

class DeckPOJOTests {

    @Test
    void testGetterSetter() {
        Deck d = new Deck();

        d.setCards(new ArrayList<>());
        assertTrue(d.getCards().isEmpty());

        ActivePlayer ap = new ActivePlayer();
        d.setActivePlayer(ap);
        assertEquals(ap, d.getActivePlayer());

        d.setId(1);
        assertEquals(1, d.getId());
    }
}
