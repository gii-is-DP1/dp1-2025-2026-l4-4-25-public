package es.us.dp1.l4_04_24_25.saboteur.deck;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.AdditionalAnswers.returnsFirstArg; 

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataAccessException;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.card.Card;


@ExtendWith(MockitoExtension.class)
class DeckServiceTests {

    @InjectMocks
    private DeckService deckService;

    @Mock
    private DeckRepository deckRepository;
    
    @Mock
    private ActivePlayerService activePlayerService;

    private Deck testDeck;
    private ActivePlayer testPlayer;

    private static final int TEST_DECK_ID = 1;
    private static final int TEST_AP_ID = 4;
    private static final int MOCK_CARD_COUNT = 5;


    @BeforeEach
    void setup() {
        testPlayer = new ActivePlayer();
        testPlayer.setId(TEST_AP_ID);
        testPlayer.setUsername("TestUser");
        testPlayer.setName("Test");
        testPlayer.setEmail("test@test.com"); 

        testDeck = new Deck();
        testDeck.setId(TEST_DECK_ID);
        testDeck.setActivePlayer(testPlayer);
        
        Card card = new Card();
        card.setId(200);
        card.setDeck(testDeck);
        testDeck.getCards().add(card);
    }

    

    @Test
    void shouldFindDeckById() {
        when(deckRepository.findById(TEST_DECK_ID)).thenReturn(Optional.of(testDeck));
        Deck foundDeck = deckService.findDeck(TEST_DECK_ID);
        assertNotNull(foundDeck);
        assertEquals(TEST_DECK_ID, foundDeck.getId());
    }

    @Test
    void shouldThrowExceptionWhenFindingNonExistingDeck() {
        when(deckRepository.findById(99999)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> deckService.findDeck(99999));
    }

    @Test
    void shouldInsertNewDeck() {
        
        when(deckRepository.save(any(Deck.class))).thenAnswer(returnsFirstArg());
        
        Deck newDeck = new Deck();
        newDeck.setActivePlayer(testPlayer);
        
        newDeck.setId(99); 

        Deck savedDeck = deckService.saveDeck(newDeck);

        
        verify(deckRepository).save(any(Deck.class));
        assertNotNull(savedDeck.getActivePlayer());
        assertEquals(TEST_AP_ID, savedDeck.getActivePlayer().getId());
    }

    @Test
    void shouldDeleteDeck() {
        when(deckRepository.findById(TEST_DECK_ID)).thenReturn(Optional.of(testDeck));
        deckService.deleteDeck(TEST_DECK_ID);
        verify(deckRepository).delete(testDeck);
    }
    
    
    @Test
    void shouldFindByActivePlayerId() {
        when(deckRepository.findByActivePlayerId(TEST_AP_ID)).thenReturn(Optional.of(testDeck));
        Deck foundDeck = deckService.findByActivePlayerId(TEST_AP_ID);
        assertEquals(TEST_DECK_ID, foundDeck.getId());
        assertEquals(TEST_AP_ID, foundDeck.getActivePlayer().getId());
    }
    
    @Test
    void shouldThrowExceptionWhenActivePlayerNotFound() {
        when(deckRepository.findByActivePlayerId(999)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> deckService.findByActivePlayerId(999));
    }
    
    @Test
    void shouldCountCardsInDeck() {
        when(deckRepository.findById(TEST_DECK_ID)).thenReturn(Optional.of(testDeck));
        when(deckRepository.countCardsByDeckId(TEST_DECK_ID)).thenReturn(MOCK_CARD_COUNT); 
        
        Integer count = deckService.countCardsInDeck(TEST_DECK_ID);
        
        assertEquals(MOCK_CARD_COUNT, count);
        verify(deckRepository).countCardsByDeckId(TEST_DECK_ID);
    }
}