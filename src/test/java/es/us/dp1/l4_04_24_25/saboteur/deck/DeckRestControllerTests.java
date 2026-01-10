package es.us.dp1.l4_04_24_25.saboteur.deck;

import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import es.us.dp1.l4_04_24_25.saboteur.card.CardService;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.game.gameStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.time.LocalDateTime;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.anyString;

class DeckRestControllerTests {

    private MockMvc mockMvc;

    @Mock
    private DeckService deckService;

    @Mock
    private ActivePlayerService activePlayerService;

    @Mock
    private CardService cardService;

    @Mock
    private GameService gameService;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private DeckRestController deckRestController;

    private Deck testDeck;
    private ActivePlayer testPlayer;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);

        mockMvc = MockMvcBuilders
                .standaloneSetup(deckRestController)
                .build();

        testPlayer = new ActivePlayer();
        testPlayer.setId(4);

        testDeck = new Deck();
        testDeck.setId(1);
        testDeck.setActivePlayer(testPlayer);

        Card c = new Card();
        c.setId(200);
        testDeck.setCards(List.of(c));
    }

    @Test
    void shouldGetAllDecks() throws Exception {
        when(deckService.findAll()).thenReturn(List.of(testDeck));

        mockMvc.perform(get("/api/v1/decks"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(testDeck.getId()));
    }

    @Test
    void shouldGetDeckById() throws Exception {
        when(deckService.findDeck(1)).thenReturn(testDeck);

        mockMvc.perform(get("/api/v1/decks/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testDeck.getId()));
    }

    @Test
    void shouldCreateDeck() throws Exception {
        when(deckService.saveDeck(any())).thenReturn(testDeck);

        Deck newDeck = new Deck();
        String body = objectMapper.writeValueAsString(newDeck);

        mockMvc.perform(post("/api/v1/decks")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isCreated());
    }

    @Test
    void shouldUpdateDeck() throws Exception {
        when(deckService.findDeck(1)).thenReturn(testDeck);
        when(deckService.updateDeck(any(), any())).thenReturn(testDeck);

        Deck updated = new Deck();
        updated.setActivePlayer(testPlayer);

        mockMvc.perform(put("/api/v1/decks/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldDeleteDeck() throws Exception {
        when(deckService.findDeck(1)).thenReturn(testDeck);

        mockMvc.perform(delete("/api/v1/decks/1"))
                .andExpect(status().isOk());

        verify(deckService).deleteDeck(1);
    }

    @Test
    void shouldFindByActivePlayerId() throws Exception {
        when(deckService.findByActivePlayerId(4)).thenReturn(testDeck);

        mockMvc.perform(get("/api/v1/decks/byActivePlayerId?activePlayerId=4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testDeck.getId()));
    }

    @Test
    void shouldCountCards() throws Exception {
        when(deckService.countCardsInDeck(1)).thenReturn(5);
        when(deckService.findDeck(1)).thenReturn(testDeck);

        mockMvc.perform(get("/api/v1/decks/1/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }

    @Test
    void shouldPatchDeckFull() throws Exception {
        when(deckService.findDeck(1)).thenReturn(testDeck);

        // Mock active player patch
        testPlayer.setUsername("player1");
        when(activePlayerService.patchActivePlayer(eq(4), any())).thenReturn(testPlayer);

        // Mock save deck
        when(deckService.saveDeck(any())).thenReturn(testDeck);

        // Mock game service for WS
        Game game = new Game();
        game.setId(100);
        game.setGameStatus(gameStatus.ONGOING);
        game.setStartTime(LocalDateTime.now());
        when(gameService.findAllByActivePlayerId(4)).thenReturn(List.of(game));

        String json = """
                {
                  "activePlayer": 4,
                  "cards": [200]
                }
                """;

        mockMvc.perform(patch("/api/v1/decks/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isOk());

        verify(messagingTemplate).convertAndSend(eq("/topic/game/100/deck"), any(Map.class));
    }
}
