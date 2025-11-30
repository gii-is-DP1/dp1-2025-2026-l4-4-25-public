package es.us.dp1.l4_04_24_25.saboteur.game;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import es.us.dp1.l4_04_24_25.saboteur.player.PlayerService;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundService;

@ExtendWith(MockitoExtension.class)
class WebSocketGameControllerTests {

    @Mock
    private GameService gameService;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private PlayerService playerService;
    @Mock
    private RoundService roundService;

    private WebSocketGameController controller;

    @BeforeEach
    void setUp() {
        controller = new WebSocketGameController(gameService, messagingTemplate, playerService, roundService);
    }

    @Test
    void shouldStartGameAndNotifyClients() {
        
        Integer gameId = 1;
        Game game = new Game();
        game.setId(gameId);
        
        when(gameService.findGame(gameId)).thenReturn(game);

        controller.startGame(gameId);

        verify(gameService).findGame(gameId);
    
        verify(messagingTemplate).convertAndSend(eq("/topic/game/" + gameId), eq(game));
    }
}