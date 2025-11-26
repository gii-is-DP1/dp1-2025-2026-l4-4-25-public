package es.us.dp1.l4_04_24_25.saboteur.game;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt; 
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.config.annotation.web.WebSecurityConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.chat.Chat;
import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerService;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Game Module")
@Feature("Game Management")
@Owner("DP1-tutors")
@WebMvcTest(controllers = GameRestController.class, 
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class), 
    excludeAutoConfiguration = SecurityConfiguration.class)
class GameRestControllerTests {

    private static final int TEST_GAME_ID = 1;
    private static final String BASE_URL = "/api/v1/games";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private GameService gameService;

    @MockBean
    private PlayerService playerService;

    @MockBean
    private RoundService roundService;

    @MockBean
    private ActivePlayerService activePlayerService; 

    @MockBean
    private SimpMessagingTemplate messagingTemplate;

    private Game game;
    private ActivePlayer creator;

    @BeforeEach
    void setup() {
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

        creator = new ActivePlayer();
        creator.setId(1);
        creator.setUsername("Creator");

        game = new Game();
        game.setId(TEST_GAME_ID);
        game.setLink("test-link");
        game.setCreator(creator);
        game.setGameStatus(gameStatus.CREATED);
        game.setMaxPlayers(5);
        game.setTime(Duration.ZERO);
        game.setActivePlayers(new ArrayList<>(List.of(creator))); 
        game.setWatchers(new ArrayList<>());
        game.setRounds(new ArrayList<>());
        
        Chat chat = new Chat();
        chat.setId(1);
        game.setChat(chat);

        when(activePlayerService.findActivePlayer(1)).thenReturn(creator);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindAllGames() throws Exception {
        when(gameService.findAll()).thenReturn(List.of(game));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].link", is("test-link")));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindById() throws Exception {
        when(gameService.findGame(TEST_GAME_ID)).thenReturn(game);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_GAME_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_GAME_ID)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByLink() throws Exception {
        String link = "test-link";
        when(gameService.findByLink(link)).thenReturn(game);

        mockMvc.perform(get(BASE_URL + "/byLink").param("link", link))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.link", is(link)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByCreator() throws Exception {
        String creatorUsername = "Creator";
        when(gameService.findByCreator(creatorUsername)).thenReturn(List.of(game));

        mockMvc.perform(get(BASE_URL + "/byCreator").param("creatorUsername", creatorUsername))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }
    
    @Test
    @WithMockUser("admin")
    void shouldReturnNotFoundWhenGameDoesNotExist() throws Exception {
        when(gameService.findGame(999)).thenThrow(new ResourceNotFoundException("Game", "id", 999));

        mockMvc.perform(get(BASE_URL + "/{id}", 999))
                .andExpect(status().isNotFound());
    }


    /* 
    @Test
    @WithMockUser("admin")
    void shouldCreateGame() throws Exception {
        when(gameService.existsByLink(any())).thenReturn(false);
        when(gameService.saveGame(any(Game.class))).thenReturn(game);

        Map<String, Object> gameData = new HashMap<>();
        gameData.put("link", "new-game-link");
        gameData.put("maxPlayers", 4);
        gameData.put("isPrivate", false);
        gameData.put("activePlayers", List.of(1)); 

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(gameData)))
                .andExpect(status().isCreated());
    }
    
    @Test
    @WithMockUser("admin")
    void shouldFailCreateGameIfLinkDuplicate() throws Exception {
        when(gameService.existsByLink(any())).thenReturn(true);
        
        Map<String, Object> gameData = new HashMap<>();
        gameData.put("link", "duplicate-link");
        gameData.put("activePlayers", List.of(1));

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(gameData)))
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof es.us.dp1.l4_04_24_25.saboteur.exceptions.EmptyActivePlayerListException));
    }
    */
    @Test
    @WithMockUser("admin")
    void shouldFailCreateGameIfNoActivePlayers() throws Exception {
        Map<String, Object> gameData = new HashMap<>();
        gameData.put("link", "link");

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(gameData)))
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof IllegalArgumentException));
    }


    @Test
    @WithMockUser("admin")
    void shouldUpdateGame() throws Exception {
        when(gameService.findGame(TEST_GAME_ID)).thenReturn(game);
        when(gameService.updateGame(any(Game.class), eq(TEST_GAME_ID))).thenReturn(game);

        Map<String, Object> gameData = new HashMap<>();
        gameData.put("link", "updated-link");

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_GAME_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(gameData)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser("admin")
    void shouldFailUpdateNonExistingGame() throws Exception {
        when(gameService.findGame(TEST_GAME_ID)).thenThrow(new ResourceNotFoundException("Game", "id", TEST_GAME_ID));

        Map<String, Object> gameData = new HashMap<>();
        gameData.put("link", "updated-link");

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_GAME_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(gameData)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser("admin")
    void shouldDeleteCreatedGame() throws Exception {
        game.setGameStatus(gameStatus.CREATED);
        when(gameService.findGame(TEST_GAME_ID)).thenReturn(game);
        doNothing().when(gameService).deleteGame(TEST_GAME_ID);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_GAME_ID)
                .with(csrf()))
                .andExpect(status().isOk());

        verify(gameService).deleteGame(TEST_GAME_ID);
    }

    @Test
    @WithMockUser("admin")
    void shouldFailDeleteOngoingGame() throws Exception {
        game.setGameStatus(gameStatus.ONGOING);
        when(gameService.findGame(TEST_GAME_ID)).thenReturn(game);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_GAME_ID)
                .with(csrf()))
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof IllegalStateException));

        verify(gameService, never()).deleteGame(anyInt());
    }
}