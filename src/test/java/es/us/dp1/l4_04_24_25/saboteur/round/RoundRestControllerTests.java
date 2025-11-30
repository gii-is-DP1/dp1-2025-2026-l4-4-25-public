package es.us.dp1.l4_04_24_25.saboteur.round;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
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

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.board.BoardService;
import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.log.LogService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Round Module")
@Feature("Round Controller Tests")
@Owner("DP1-tutors")
@WebMvcTest(controllers = RoundRestController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class),
    excludeAutoConfiguration = SecurityConfiguration.class)
class RoundRestControllerTests {

    private static final int TEST_ROUND_ID = 1;
    private static final int TEST_GAME_ID = 10;
    private static final String BASE_URL = "/api/v1/rounds";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RoundService roundService;

    @MockBean
    private GameService gameService;

    @MockBean
    private BoardService boardService;
    
    @MockBean
    private ActivePlayerService activePlayerService;
    
    @MockBean
    private LogService logService;
    
    @MockBean
    private SimpMessagingTemplate messagingTemplate;

    private Round round;
    private Game game;

    @BeforeEach
    void setup() {
        
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

        game = new Game();
        game.setId(TEST_GAME_ID);

        // Crear un board mock para evitar NullPointerException en el controlador
        Board board = new Board();
        board.setId(1);

        round = new Round();
        round.setId(TEST_ROUND_ID);
        round.setRoundNumber(1);
        round.setLeftCards(60);
        round.setTimeSpent(Duration.ZERO);
        round.setGame(game);
        round.setBoard(board);  // Asignar board al round
        round.setWinnerRol(false);
    }


    @Test
    @WithMockUser("admin")
    void shouldFindAllRounds() throws Exception {
        when(roundService.findAll()).thenReturn(List.of(round));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(TEST_ROUND_ID)));
        
        verify(roundService).findAll();
    }

    @Test
    @WithMockUser("admin")
    void shouldFindRoundById() throws Exception {
        when(roundService.findRound(TEST_ROUND_ID)).thenReturn(round);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_ROUND_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_ROUND_ID)));

        verify(roundService).findRound(TEST_ROUND_ID);
    }

    @Test
    @WithMockUser("admin")
    void shouldReturnNotFoundWhenRoundDoesNotExist() throws Exception {
        when(roundService.findRound(999)).thenThrow(new ResourceNotFoundException("Round", "id", 999));

        mockMvc.perform(get(BASE_URL + "/{id}", 999))
                .andExpect(status().isNotFound());
        
        verify(roundService).findRound(999);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByGameId() throws Exception {
        when(roundService.findByGameId(TEST_GAME_ID)).thenReturn(List.of(round));

        mockMvc.perform(get(BASE_URL + "/byGameId").param("gameId", String.valueOf(TEST_GAME_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(TEST_ROUND_ID)));
        
        verify(roundService).findByGameId(TEST_GAME_ID);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByGameIdAndRoundNumber() throws Exception {
        when(roundService.findByGameIdAndRoundNumber(TEST_GAME_ID, 1)).thenReturn(round);

        mockMvc.perform(get(BASE_URL + "/byGameIdAndNumber")
                .param("gameId", String.valueOf(TEST_GAME_ID))
                .param("roundNumber", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_ROUND_ID)));
        
        verify(roundService).findByGameIdAndRoundNumber(TEST_GAME_ID, 1);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByWinnerRol() throws Exception {
        when(roundService.findByWinnerRol(false)).thenReturn(List.of(round));

        mockMvc.perform(get(BASE_URL + "/byWinnerRol").param("winnerRol", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
        
        verify(roundService).findByWinnerRol(false);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByRoundNumber() throws Exception {
        when(roundService.findByRoundNumber(1)).thenReturn(List.of(round));

        mockMvc.perform(get(BASE_URL + "/byRoundNumber").param("roundNumber", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
        
        verify(roundService).findByRoundNumber(1);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByLeftCardsLessThanEqual() throws Exception {
        when(roundService.findByLeftCardsLessThanEqual(60)).thenReturn(List.of(round));

        mockMvc.perform(get(BASE_URL + "/byLeftCards").param("leftCards", "60"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
        
        verify(roundService).findByLeftCardsLessThanEqual(60);
    }


    @Test
    @WithMockUser("admin")
    void shouldCreateRound() throws Exception {
        when(gameService.findGame(TEST_GAME_ID)).thenReturn(game);
        when(roundService.initializeRound(game, 1)).thenReturn(round);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .param("gameId", String.valueOf(TEST_GAME_ID))
                .param("roundNumber", "1"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(TEST_ROUND_ID)));

        verify(gameService).findGame(TEST_GAME_ID);
        verify(roundService).initializeRound(game, 1);
    }


    @Test
    @WithMockUser("admin")
    void shouldUpdateRound() throws Exception {
        when(roundService.findRound(TEST_ROUND_ID)).thenReturn(round);
        when(roundService.updateRound(any(Round.class), eq(TEST_ROUND_ID))).thenReturn(round);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_ROUND_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(round)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_ROUND_ID)));

        verify(roundService).updateRound(any(Round.class), eq(TEST_ROUND_ID));
    }

    @Test
    @WithMockUser("admin")
    void shouldFailUpdateNonExistingRound() throws Exception {
        when(roundService.findRound(TEST_ROUND_ID))
            .thenThrow(new ResourceNotFoundException("Round", "id", TEST_ROUND_ID));

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_ROUND_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(round)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser("admin")
    void shouldPatchRound() throws Exception {
        Map<String, Object> updates = new HashMap<>();
        updates.put("leftCards", 10);

        when(roundService.findRound(TEST_ROUND_ID)).thenReturn(round);
       
        when(roundService.updateRound(any(Round.class), eq(TEST_ROUND_ID))).thenReturn(round);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_ROUND_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());

        verify(roundService).updateRound(any(Round.class), eq(TEST_ROUND_ID));
    }

    @Test
    @WithMockUser("admin")
    void shouldFailPatchNonExistingRound() throws Exception {
        when(roundService.findRound(TEST_ROUND_ID))
            .thenThrow(new ResourceNotFoundException("Round", "id", TEST_ROUND_ID));

        Map<String, Object> updates = new HashMap<>();
        updates.put("leftCards", 10);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_ROUND_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser("admin")
    void shouldDeleteRound() throws Exception {
        when(roundService.findRound(TEST_ROUND_ID)).thenReturn(round);
        doNothing().when(roundService).deleteRound(TEST_ROUND_ID);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_ROUND_ID)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());

        verify(roundService).deleteRound(TEST_ROUND_ID);
    }
    
    @Test
    @WithMockUser("admin")
    void shouldFailDeleteNonExistingRound() throws Exception {
        when(roundService.findRound(TEST_ROUND_ID))
            .thenThrow(new ResourceNotFoundException("Round", "id", TEST_ROUND_ID));

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_ROUND_ID)
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(roundService, times(0)).deleteRound(anyInt());
    }
}