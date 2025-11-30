package es.us.dp1.l4_04_24_25.saboteur.card;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Collection;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckService;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.tunnel.Tunnel;

@SpringBootTest
@AutoConfigureTestDatabase
class CardServiceTests {

    @Autowired
    private CardService cardService;
    
    @Autowired
    private DeckService deckService; 

    private static final int TEST_DECK_ID = 1;
    
    private static final int TEST_ACTION_CARD_ID = 25; 
    
    private static final int TEST_TUNNEL_CARD_ID_TO_DELETE = 31;

   @Test
    @Transactional
    void shouldFindAllCards() {
        List<Card> cards = (List<Card>) this.cardService.findAll();
        assertTrue(cards.size() == 127); 
    }
   
    @Test
    void shouldFindCardById() {
        Card card = this.cardService.findCard(TEST_ACTION_CARD_ID);
        assertNotNull(card);
        assertEquals(TEST_ACTION_CARD_ID, card.getId());
    }

    @Test
    void shouldThrowExceptionWhenFindingNonExistingCard() {
        assertThrows(ResourceNotFoundException.class, () -> this.cardService.findCard(99999));
    }
    
    @Test
    @Transactional
    void shouldInsertNewTunnel() {
        int initialCount = ((Collection<Card>) this.cardService.findAll()).size();
        Deck deckRef = deckService.findDeck(TEST_DECK_ID);
        
        Tunnel newCard = new Tunnel();
        newCard.setStatus(true);
        newCard.setImage("tunnel_test_image.png");
        newCard.setDeck(deckRef);

        newCard.setArriba(true);
        newCard.setAbajo(true);
        newCard.setIzquierda(true);
        newCard.setDerecha(true);
        newCard.setCentro(false);
        newCard.setRotacion(false);
        
        Card savedCard = this.cardService.saveCard(newCard);
        
        assertNotNull(savedCard.getId());
        assertEquals("tunnel_test_image.png", savedCard.getImage());
        
        int finalCount = ((Collection<Card>) this.cardService.findAll()).size();
        assertTrue(finalCount > initialCount);
    }
    
    @Test
    @Transactional
    void shouldUpdateCardImage() {
        String newImage = "new_image_path.png";
        Card card = this.cardService.findCard(TEST_ACTION_CARD_ID);
        
        card.setImage(newImage);
        Card updatedCard = this.cardService.updateCard(card, TEST_ACTION_CARD_ID);
   
        assertEquals(newImage, updatedCard.getImage());
        assertEquals(TEST_ACTION_CARD_ID, updatedCard.getId());
    }
    
    @Test
    @Transactional
    void shouldDeleteCard() {
        Card cardToDelete = this.cardService.findCard(TEST_TUNNEL_CARD_ID_TO_DELETE);
        assertNotNull(cardToDelete);

        this.cardService.deleteCard(TEST_TUNNEL_CARD_ID_TO_DELETE);
        
        assertThrows(ResourceNotFoundException.class, () -> this.cardService.findCard(TEST_TUNNEL_CARD_ID_TO_DELETE));
    }
}