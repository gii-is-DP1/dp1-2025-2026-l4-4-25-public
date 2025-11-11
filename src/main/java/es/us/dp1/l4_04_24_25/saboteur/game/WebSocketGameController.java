package es.us.dp1.l4_04_24_25.saboteur.game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundService;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerService;

@Controller
public class WebSocketGameController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;
    private final PlayerService playerService;
    private final RoundService roundService;

    @Autowired
    public WebSocketGameController(GameService gameService,
                                   SimpMessagingTemplate messagingTemplate,
                                   PlayerService playerService,
                                   RoundService roundService) {
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
        this.playerService = playerService;
        this.roundService = roundService;
    }

    // Llamado cuando el creador da a "Start"
    @MessageMapping("/games/start/{gameId}")
    public void startGame(@DestinationVariable Integer gameId) {
        Game game = gameService.findGame(gameId);
        // Solo notifica a los clientes; el PATCH desde React ya cambió el estado

        // Envía notificación a todos los clientes suscritos al topic
        messagingTemplate.convertAndSend("/topic/game/" + gameId, game);
    }
}
