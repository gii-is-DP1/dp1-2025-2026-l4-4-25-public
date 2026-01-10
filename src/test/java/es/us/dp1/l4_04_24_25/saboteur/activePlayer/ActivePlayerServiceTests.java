package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.deck.DeckService;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.user.AuthoritiesService;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;
import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.user.Authorities;


@SpringBootTest
@AutoConfigureTestDatabase
class ActivePlayerServiceTests {

    @Autowired
    private ActivePlayerService activePlayerService;
    
    @Autowired
    private DeckService deckService;

    @Autowired
    private AuthoritiesService authService; 

    @Autowired
    private GameService gameService; 

    
    private static final int TEST_AP_ID_CARLOS = 4;
    private static final int TEST_AP_ID_MARCOS = 5;
    private static final String TEST_AP_USERNAME = "mantecaoHacker";


    @Test
    void shouldFindAllActivePlayers() {
        List<ActivePlayer> players = (List<ActivePlayer>) this.activePlayerService.findAll();
        assertEquals(2, players.size()); 
    }

    @Test
    void shouldFindActivePlayerById() {
        ActivePlayer ap = this.activePlayerService.findActivePlayer(TEST_AP_ID_CARLOS);
        assertNotNull(ap);
        assertEquals(TEST_AP_ID_CARLOS, ap.getId());
        assertEquals("Carlosbox2k", ap.getUsername());
    }

    @Test
    void shouldThrowExceptionWhenFindingNonExistingActivePlayer() {
        assertThrows(ResourceNotFoundException.class, () -> this.activePlayerService.findActivePlayer(99999));
    }
    
    @Test
    @Transactional
    void shouldExistActivePlayerByUsername() {
        assertTrue(this.activePlayerService.existsActivePlayer(TEST_AP_USERNAME));
    }

    @Test
    @Transactional
    void shouldUpdateActivePlayerState() {
        ActivePlayer ap = this.activePlayerService.findActivePlayer(TEST_AP_ID_CARLOS);
        ap.setPickaxeState(true);

        ActivePlayer updatedAp = this.activePlayerService.updateActivePlayer(ap, TEST_AP_ID_CARLOS);
        
        assertTrue(updatedAp.isPickaxeState());
    }
    
    @Test
    @Transactional
    void shouldDeleteActivePlayer() {
        ActivePlayer ap = this.activePlayerService.findActivePlayer(TEST_AP_ID_MARCOS);
        assertNotNull(ap);
        this.activePlayerService.deleteActivePlayer(TEST_AP_ID_MARCOS);
        
        assertThrows(ResourceNotFoundException.class, () -> this.activePlayerService.findActivePlayer(TEST_AP_ID_MARCOS));
    }


    @Test
    void shouldFindActivePlayersByRol() {
        List<ActivePlayer> miners = (List<ActivePlayer>) this.activePlayerService.findByRol(true);
        assertTrue(miners.size() >= 1);
        assertTrue(miners.stream().allMatch(ActivePlayer::isRol));
    }
    
    @Test
    void shouldFindActivePlayersByPickaxeState() {
        List<ActivePlayer> broken = (List<ActivePlayer>) this.activePlayerService.findByPickaxeState(false);
        assertTrue(broken.size() >= 1);
        assertFalse(broken.get(0).isPickaxeState());
    }
    
    @Test
    void shouldFindActivePlayersByCandleState() {
        List<ActivePlayer> dark = (List<ActivePlayer>) this.activePlayerService.findByCandleState(false);
        assertTrue(dark.size() >= 1);
        assertFalse(dark.get(0).isCandleState());
    }
}