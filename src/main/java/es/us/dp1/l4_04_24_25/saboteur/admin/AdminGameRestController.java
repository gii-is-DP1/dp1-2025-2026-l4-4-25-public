package es.us.dp1.l4_04_24_25.saboteur.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.game.gameStatus;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/admin/games")
@SecurityRequirement(name = "bearerAuth")
public class AdminGameRestController {

    private final GameService gameService;
    private final ActivePlayerService activePlayerService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public AdminGameRestController(GameService gameService, 
                                   ActivePlayerService activePlayerService,
                                   SimpMessagingTemplate messagingTemplate) {
        this.gameService = gameService;
        this.activePlayerService = activePlayerService;
        this.messagingTemplate = messagingTemplate;}

    @PostMapping("/{gameId}/force-finish")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> forceFinishGame(
            @PathVariable Integer gameId, 
            @RequestBody @Valid ForceFinishRequest request) {
        
        try {
            Game game = gameService.findGame(gameId);
            
            if (!game.getGameStatus().equals(gameStatus.ONGOING)) {
                return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("🛑 Only ONGOING games can be force-finished. Current STATUS: " + game.getGameStatus()));}

            game.setGameStatus(gameStatus.FINISHED);
            gameService.updateGame(game, gameId);

            AdminActionMessage adminMessage = new AdminActionMessage(
                "FORCE_FINISH", 
                request.getReason());

            messagingTemplate.convertAndSend(
                "/topic/game/"+gameId, 
                createGameUpdateMessage(game, adminMessage));

            return ResponseEntity.ok(new MessageResponse("🟢 Game force-finished successfully"));
            
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("🔴 Error force-finishing game: " + e.getMessage()));
        }
    }

    @PostMapping("/{gameId}/expel-player")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> expelPlayer(
            @PathVariable Integer gameId, 
            @RequestBody @Valid ExpelPlayerRequest request) {
        
        try {
            Game game = gameService.findGame(gameId);
            
            if (game.getGameStatus() != gameStatus.CREATED) {
                return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("🛑 Players can only be expelled from CREATED games"));
            }

            List<ActivePlayer> activePlayers = game.getActivePlayers();
            ActivePlayer playerToExpel = null;
            
            for (ActivePlayer ap : activePlayers) {
                if (ap.getUsername() != null && ap.getUsername().equals(request.getUsername())) {
                    playerToExpel = ap;
                    break;
                }
            }

            if (playerToExpel == null) {
                return ResponseEntity
                    .badRequest()
                    .body(new MessageResponse("🔎 Player not found in game"));
            }

            AdminActionMessage adminMessage = new AdminActionMessage(
                "PLAYER_EXPELLED", 
                request.getReason(),
                request.getUsername()
            );

            activePlayers.remove(playerToExpel);
            game.setActivePlayers(activePlayers);
            Game updatedGame = gameService.saveGame(game);

            messagingTemplate.convertAndSend(
                "/topic/game/" + gameId, 
                createGameUpdateMessage(updatedGame, adminMessage)
            );

            return ResponseEntity.ok(new MessageResponse("🟢 Player expelled successfully"));
            
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MessageResponse("🔴 Error expelling player: " + e.getMessage()));
        }
    }

    private Map<String, Object> createGameUpdateMessage(Game game, AdminActionMessage adminMessage) {
        Map<String, Object> message = new HashMap<>();
        message.put("game", game);
        message.put("adminAction", adminMessage);
        return message;
    }
}
