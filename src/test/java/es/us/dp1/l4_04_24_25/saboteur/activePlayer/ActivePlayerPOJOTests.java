package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;

import org.junit.jupiter.api.Test;

import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;

class ActivePlayerPOJOTests {

    @Test
    void testActivePlayerGettersSetters() {
        ActivePlayer ap = new ActivePlayer();

        ap.setRol(true);
        assertTrue(ap.isRol());

        ap.setGoldNugget(5);
        assertEquals(5, ap.getGoldNugget());

        ap.setPickaxeState(false);
        assertFalse(ap.isPickaxeState());

        ap.setCandleState(true);
        assertTrue(ap.isCandleState());

        ap.setCartState(false);
        assertFalse(ap.isCartState());

        ap.setWonGame(new ArrayList<>());
        assertTrue(ap.getWonGame().isEmpty());

        ap.setCreatedGames(new ArrayList<>());
        assertTrue(ap.getCreatedGames().isEmpty());

        es.us.dp1.l4_04_24_25.saboteur.deck.Deck deck = new es.us.dp1.l4_04_24_25.saboteur.deck.Deck();
        ap.setDeck(deck);
        assertEquals(deck, ap.getDeck());

        ap.setMessages(new ArrayList<>());
        assertTrue(ap.getMessages().isEmpty());

        ap.setId(99);
        assertEquals(99, ap.getId());
    }
}
