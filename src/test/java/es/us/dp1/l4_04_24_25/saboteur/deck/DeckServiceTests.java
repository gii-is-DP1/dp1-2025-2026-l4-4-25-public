package es.us.dp1.l4_04_24_25.saboteur.deck;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.Collection;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;


@AutoConfigureTestDatabase
class DeckServiceTests {

    @Autowired
    private DeckService deckService;
    
    @Autowired
    private ActivePlayerService activePlayerService; 

    private static final int TEST_DECK_ID = 1;
    private static final int TEST_DECK_ID_TO_DELETE = 2; 
    private static final int TEST_AP_ID_CARLOS = 4;
    private static final int TEST_AP_ID_MARCOS = 5;
    
    @Test
    void shouldFindDeckById() {
        Deck deck = this.deckService.findDeck(TEST_DECK_ID);
        assertNotNull(deck);
        assertEquals(TEST_DECK_ID, deck.getId());
        assertNotNull(deck.getActivePlayer()); 
    }

    @Test
    void shouldThrowExceptionWhenFindingNonExistingDeck() {
        assertThrows(ResourceNotFoundException.class, () -> this.deckService.findDeck(99999));
    }
    
    @Test
    @Transactional
    void shouldInsertNewDeck() {
       
        int initialCount = ((Collection<Deck>) this.deckService.findAll()).size();
        
        assertTrue(initialCount >= 2);
    }
    
    @Test
    @Transactional
    void shouldFindDeckByActivePlayerId() {
        
        Deck deck = this.deckService.findByActivePlayerId(TEST_AP_ID_CARLOS);
       
        assertEquals(TEST_DECK_ID, deck.getId());
        assertEquals(TEST_AP_ID_CARLOS, deck.getActivePlayer().getId());
    }
    
    @Test
    void shouldThrowExceptionWhenFindingDeckByNonExistingActivePlayer() {
        
        assertThrows(ResourceNotFoundException.class, () -> this.deckService.findByActivePlayerId(99999));
    }

    @Test
    @Transactional
    void shouldCountCardsInDeck() {
        
        Integer count = this.deckService.countCardsInDeck(TEST_DECK_ID);
        
        assertEquals(3, count); 
    }
    
    @Test
    @Transactional
    void shouldDeleteDeck() {
       
        Deck deckToDelete = this.deckService.findDeck(TEST_DECK_ID_TO_DELETE);
        assertNotNull(deckToDelete);

        this.deckService.deleteDeck(TEST_DECK_ID_TO_DELETE);
        
        assertThrows(ResourceNotFoundException.class, () -> this.deckService.findDeck(TEST_DECK_ID_TO_DELETE));
    }
}