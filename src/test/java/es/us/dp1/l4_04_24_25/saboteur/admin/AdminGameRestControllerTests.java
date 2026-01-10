package es.us.dp1.l4_04_24_25.saboteur.admin;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.List;

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

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.game.gameStatus;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ExceptionHandlerController;
import org.springframework.context.annotation.Import;

@WebMvcTest(controllers = AdminGameRestController.class, excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class), excludeAutoConfiguration = SecurityConfiguration.class)
@Import(ExceptionHandlerController.class)
class AdminGameRestControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GameService gameService;

    @MockBean
    private ActivePlayerService activePlayerService;

    @MockBean
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(authorities = "ADMIN")
    void shouldForceFinishGameSuccessfully() throws Exception {
        Game game = new Game();
        game.setId(1);
        game.setGameStatus(gameStatus.ONGOING);

        when(gameService.findGame(1)).thenReturn(game);

        mockMvc.perform(post("/api/v1/admin/games/1/force-finish")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ForceFinishRequest("Testing finish")))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("🟢 Game force-finished successfully"));

        verify(gameService).updateGame(any(Game.class), eq(1));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void shouldNotForceFinishIfNotOngoing() throws Exception {
        Game game = new Game();
        game.setId(1);
        game.setGameStatus(gameStatus.FINISHED);

        when(gameService.findGame(1)).thenReturn(game);

        mockMvc.perform(post("/api/v1/admin/games/1/force-finish")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ForceFinishRequest("Testing finish")))
                .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("🛑 Only ONGOING games can be force-finished. Current STATUS: FINISHED"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void shouldHandleErrorOnForceFinish() throws Exception {
        when(gameService.findGame(1)).thenThrow(new RuntimeException("DB Error"));

        mockMvc.perform(post("/api/v1/admin/games/1/force-finish")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ForceFinishRequest("Testing finish")))
                .with(csrf()))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("🔴 Error force-finishing game: DB Error"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void shouldExpelPlayerSuccessfully() throws Exception {
        Game game = new Game();
        game.setId(1);
        game.setGameStatus(gameStatus.CREATED);

        ActivePlayer p1 = new ActivePlayer();
        p1.setId(1);
        p1.setUsername("player1");

        List<ActivePlayer> players = new ArrayList<>();
        players.add(p1);
        game.setActivePlayers(players);

        when(gameService.findGame(1)).thenReturn(game);
        when(gameService.saveGame(any(Game.class))).thenReturn(game);

        mockMvc.perform(post("/api/v1/admin/games/1/expel-player")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ExpelPlayerRequest("player1", "Bad behavior")))
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("🟢 Player expelled successfully"));

        verify(gameService).saveGame(any(Game.class));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void shouldNotExpelPlayerIfNotCreated() throws Exception {
        Game game = new Game();
        game.setId(1);
        game.setGameStatus(gameStatus.ONGOING);

        when(gameService.findGame(1)).thenReturn(game);

        mockMvc.perform(post("/api/v1/admin/games/1/expel-player")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ExpelPlayerRequest("player1", "Bad behavior")))
                .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("🛑 Players can only be expelled from CREATED games"));
    }

    @Test
    @WithMockUser(authorities = "ADMIN")
    void shouldNotExpelPlayerIfNotFound() throws Exception {
        Game game = new Game();
        game.setId(1);
        game.setGameStatus(gameStatus.CREATED);
        game.setActivePlayers(new ArrayList<>()); // No players

        when(gameService.findGame(1)).thenReturn(game);

        mockMvc.perform(post("/api/v1/admin/games/1/expel-player")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ExpelPlayerRequest("player1", "Bad behavior")))
                .with(csrf()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("🔎 Player not found in game"));
    }

    @Test
    @WithMockUser(authorities = "PLAYER")
    void shouldForbidExpelPlayerForNonAdmin() throws Exception {
        mockMvc.perform(post("/api/v1/admin/games/1/expel-player")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new ExpelPlayerRequest("player1", "Bad behavior")))
                .with(csrf()))
                .andExpect(status().isInternalServerError()); // ExceptionHandler handles custom AccessDeniedException,
                                                              // not Spring Security's -> falls to 500
    }
}
