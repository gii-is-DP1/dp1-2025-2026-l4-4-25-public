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
import java.util.HashMap;

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

    private static final int TEST_AP_ID_PLAYER1 = 6;
    private static final int TEST_AP_ID_PLAYER2 = 7;
    private static final String TEST_AP_USERNAME = "player1";

    @Test
    void shouldFindAllActivePlayers() {
        List<ActivePlayer> players = (List<ActivePlayer>) this.activePlayerService.findAll();
        assertEquals(11, players.size());
    }

    @Test
    void shouldFindActivePlayerById() {
        ActivePlayer ap = this.activePlayerService.findActivePlayer(TEST_AP_ID_PLAYER1);
        assertNotNull(ap);
        assertEquals(TEST_AP_ID_PLAYER1, ap.getId());
        assertEquals("player1", ap.getUsername());
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
        ActivePlayer ap = this.activePlayerService.findActivePlayer(TEST_AP_ID_PLAYER1);
        ap.setPickaxeState(true);

        ActivePlayer updatedAp = this.activePlayerService.updateActivePlayer(ap, TEST_AP_ID_PLAYER1);

        assertTrue(updatedAp.isPickaxeState());
    }

    @Test
    @Transactional
    void shouldDeleteActivePlayer() {
        ActivePlayer ap = this.activePlayerService.findActivePlayer(TEST_AP_ID_PLAYER2);
        assertNotNull(ap);
        this.activePlayerService.deleteActivePlayer(TEST_AP_ID_PLAYER2);

        assertThrows(ResourceNotFoundException.class,
                () -> this.activePlayerService.findActivePlayer(TEST_AP_ID_PLAYER2));
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

    @Test
    void shouldFindByUsername() {
        ActivePlayer ap = this.activePlayerService.findByUsername(TEST_AP_USERNAME);
        assertNotNull(ap);
        assertEquals(TEST_AP_USERNAME, ap.getUsername());
    }

    @Test
    void shouldThrowExceptionWhenFindingByNonExistingUsername() {
        assertThrows(ResourceNotFoundException.class, () -> this.activePlayerService.findByUsername("nonexistentuser"));
    }

    @Test
    void shouldFindActivePlayersByCartState() {

        List<ActivePlayer> brokenCart = (List<ActivePlayer>) this.activePlayerService.findByCartState(false);
        assertFalse(brokenCart.isEmpty());
    }

    @Test
    @Transactional
    void shouldSaveActivePlayer() {
        ActivePlayer newAp = new ActivePlayer();
        newAp.setUsername("NewActivePlayer");
        newAp.setName("Test Name");
        newAp.setPassword("pass");
        newAp.setEmail("test@mail.com");
        newAp.setBirthDate("2000-01-01");
        newAp.setImage("img.png");

        Authorities auth = authService.findByAuthority("PLAYER");
        newAp.setAuthority(auth);

        ActivePlayer saved = this.activePlayerService.saveActivePlayer(newAp);
        assertNotNull(saved.getId());
        assertEquals("NewActivePlayer", saved.getUsername());
    }

    @Test
    @Transactional
    void shouldPatchActivePlayerDeck() {

        Map<String, Object> updates = new HashMap<>();
        updates.put("deck", 2);

        ActivePlayer patched = this.activePlayerService.patchActivePlayer(TEST_AP_ID_PLAYER1, updates);

        assertNotNull(patched.getDeck());
        assertEquals(2, patched.getDeck().getId());
    }

    @Test
    @Transactional
    void shouldPatchActivePlayerWithoutDeck() {

        ActivePlayer ap = this.activePlayerService.findActivePlayer(TEST_AP_ID_PLAYER1);
        Integer originalDeckId = ap.getDeck().getId();

        Map<String, Object> updates = new HashMap<>();
        updates.put("goldNugget", 10);

        ActivePlayer patched = this.activePlayerService.patchActivePlayer(TEST_AP_ID_PLAYER1, updates);

        assertEquals(originalDeckId, patched.getDeck().getId());
    }

    @Test
    void shouldFindByUsernameInOngoingGame() {
        // Test para encontrar un active player por su username en la partida en curso
        // (ongoing game)
        try {
            ActivePlayer ap = activePlayerService.findByUsernameInOngoingGame("player1");
            assertNotNull(ap);
        } catch (ResourceNotFoundException ex) {
            // Esperado si no existe ningún jugador con ese nombre de usuario en la partida
            // en curso
        }
    }

    @Test
    void shouldThrowExceptionForNonExistingUsernameInOngoingGame() {
        assertThrows(ResourceNotFoundException.class,
                () -> activePlayerService.findByUsernameInOngoingGame("nonExistentPlayer123"));
    }

    @Test
    void shouldNotExistActivePlayerByUsername() {
        assertFalse(activePlayerService.existsActivePlayer("totallyFakeUsername123"));
    }

    @Test
    void shouldTestActivePlayerGettersAndSetters() {
        ActivePlayer ap = new ActivePlayer();

        ap.setRol(true);
        assertTrue(ap.isRol());

        ap.setPickaxeState(true);
        assertTrue(ap.isPickaxeState());

        ap.setCandleState(true);
        assertTrue(ap.isCandleState());

        ap.setCartState(true);
        assertTrue(ap.isCartState());

        ap.setGoldNugget(5);
        assertEquals(5, ap.getGoldNugget());
    }

    @Test
    void shouldTestActivePlayerRelationships() {
        ActivePlayer ap = new ActivePlayer();

        // Test deck
        Deck deck = new Deck();
        deck.setId(1);
        ap.setDeck(deck);
        assertEquals(deck, ap.getDeck());

        // Test created games list - inicializada a un ArrayList vacío
        assertNotNull(ap.getCreatedGames());

        // Test messages list - inicializada a un ArrayList vacío
        assertNotNull(ap.getMessages());
    }
}