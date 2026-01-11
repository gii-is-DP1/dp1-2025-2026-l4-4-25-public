package es.us.dp1.l4_04_24_25.saboteur.round;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/rounds")
@SecurityRequirement(name = "bearerAuth")
public class RoundRestController {

    private static final Logger log = LoggerFactory.getLogger(RoundRestController.class);

    // Map para trackear qué jugadores están listos por cada ronda
    // Key: roundId, Value: Set de usernames que ya están listos
    private static final Map<Integer, Set<String>> readyPlayersByRound = new ConcurrentHashMap<>();

    private final RoundService roundService;
    private final ObjectMapper objectMapper;
    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public RoundRestController(RoundService roundService, ObjectMapper objectMapper, GameService gameService,
            SimpMessagingTemplate messagingTemplate) {
        this.roundService = roundService;
        this.objectMapper = objectMapper;
        this.gameService = gameService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Round>> findAll() {
        List<Round> res = (List<Round>) roundService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Round> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(roundService.findRound(id), HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Round> create(@RequestParam @Valid Integer gameId, @RequestParam @Valid Integer roundNumber) {
        Game game = gameService.findGame(gameId);
        Round newRound = roundService.initializeRound(game, roundNumber);

        // Enviar mensaje WebSocket a todos los jugadores para que naveguen a la nueva
        // ronda
        Map<String, Object> payload = new HashMap<>();
        payload.put("action", "NEW_ROUND");
        payload.put("newRound", newRound);
        payload.put("boardId", newRound.getBoard().getId());
        payload.put("roundNumber", roundNumber);

        log.info(">>> WS: Enviando NEW_ROUND a /topic/game/{} con boardId: {}", gameId, newRound.getBoard().getId());
        messagingTemplate.convertAndSend("/topic/game/" + gameId, payload);

        return new ResponseEntity<>(newRound, HttpStatus.CREATED);
    }

    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Round> update(@PathVariable("id") Integer id, @RequestBody @Valid Round round) {
        RestPreconditions.checkNotNull(roundService.findRound(id), "Round", "ID", id);
        return new ResponseEntity<>(roundService.updateRound(round, id), HttpStatus.OK);
    }

    @PatchMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Round> patch(@PathVariable("id") Integer id, @RequestBody Map<String, Object> updates)
            throws JsonMappingException {
        RestPreconditions.checkNotNull(roundService.findRound(id), "Round", "ID", id);
        Round round = roundService.findRound(id);
        Round roundPatched = objectMapper.updateValue(round, updates);
        roundService.updateRound(roundPatched, id);
        if (updates.containsKey("turn")) {
            // Obtenemos ID del juego para saber a que topic enviarlo
            Integer gameId = roundPatched.getGame().getId();
            Map<String, Object> payload = new HashMap<>();
            payload.put("action", "TURN_CHANGED");
            payload.put("newTurnIndex", roundPatched.getTurn());
            payload.put("roundId", roundPatched.getId());
            payload.put("leftCards", roundPatched.getLeftCards());

            log.info(">>> WS: Enviando cambio de turno a /topic/game/{}", gameId);
            messagingTemplate.convertAndSend("/topic/game/" + gameId, payload);
        }
        return new ResponseEntity<>(roundPatched, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteRound(@PathVariable Integer id) {
        RestPreconditions.checkNotNull(roundService.findRound(id), "Round", "id", id);
        roundService.deleteRound(id);
        return new ResponseEntity<>(new MessageResponse("Round deleted!"), HttpStatus.OK);
    }

    @GetMapping("byGameId")
    public ResponseEntity<List<Round>> findByGameId(@RequestParam Integer gameId) {
        List<Round> res = roundService.findByGameId(gameId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byGameIdAndNumber")
    public ResponseEntity<Round> findByGameIdAndRoundNumber(@RequestParam Integer gameId,
            @RequestParam Integer roundNumber) {
        Round res = roundService.findByGameIdAndRoundNumber(gameId, roundNumber);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byWinnerRol")
    public ResponseEntity<List<Round>> findByWinnerRol(@RequestParam boolean winnerRol) {
        List<Round> res = roundService.findByWinnerRol(winnerRol);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byRoundNumber")
    public ResponseEntity<List<Round>> findByRoundNumber(@RequestParam Integer roundNumber) {
        List<Round> res = roundService.findByRoundNumber(roundNumber);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byLeftCards")
    public ResponseEntity<List<Round>> findByLeftCardsLessThanEqual(@RequestParam Integer leftCards) {
        List<Round> res = roundService.findByLeftCardsLessThanEqual(leftCards);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byBoardId")
    public ResponseEntity<Round> findByBoardId(@RequestParam Integer boardId) {
        Round res = roundService.findByBoardId(boardId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    // Endpoint para notificar el fin de ronda a todos los jugadores via WebSocket
    @PostMapping("/{id}/notifyRoundEnd")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Map<String, Object>> notifyRoundEnd(
            @PathVariable("id") Integer id,
            @RequestBody Map<String, Object> roundEndData) {

        Round round = roundService.findRound(id);
        RestPreconditions.checkNotNull(round, "Round", "ID", id);

        Integer gameId = round.getGame().getId();

        Map<String, Object> payload = new HashMap<>();
        payload.put("action", "ROUND_END");
        payload.put("roundId", id);
        payload.put("winnerTeam", roundEndData.get("winnerTeam"));
        payload.put("reason", roundEndData.get("reason"));
        payload.put("goldDistribution", roundEndData.get("goldDistribution"));
        payload.put("playerRoles", roundEndData.get("playerRoles"));

        log.info(">>> WS: Enviando ROUND_END a /topic/game/{}", gameId);
        messagingTemplate.convertAndSend("/topic/game/" + gameId, payload);

        return new ResponseEntity<>(payload, HttpStatus.OK);
    }

    // Endpoint para que cada jugador notifique que está listo
    @PostMapping("/playerReady")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Map<String, Object>> playerReady(@RequestBody Map<String, Object> body) {
        Integer roundId = (Integer) body.get("roundId");
        String username = (String) body.get("username");

        Round round = roundService.findRound(roundId);
        RestPreconditions.checkNotNull(round, "Round", "ID", roundId);

        Integer gameId = round.getGame().getId();
        // Usar el número REAL de jugadores activos, no el máximo permitido
        int expectedPlayers = round.getGame().getActivePlayers().size();

        // Añadir jugador al set de listos
        readyPlayersByRound.computeIfAbsent(roundId, k -> new HashSet<>()).add(username);
        Set<String> readyPlayers = readyPlayersByRound.get(roundId);

        log.info(">>> Player {} ready for round {}. Ready: {}/{}", username, roundId, readyPlayers.size(), expectedPlayers);
        log.info(">>> Active players for game {}: {}", gameId, round.getGame().getActivePlayers());
        log.info(">>> Ready players set for round {}: {}", roundId, readyPlayers);

        Map<String, Object> response = new HashMap<>();
        response.put("readyCount", readyPlayers.size());
        response.put("expectedPlayers", expectedPlayers);

        // Si todos los jugadores están listos, emitir WebSocket
        if (readyPlayers.size() >= expectedPlayers) {
            Map<String, Object> payload = new HashMap<>();
            payload.put("action", "ALL_PLAYERS_READY");
            payload.put("roundId", roundId);

            log.info(">>> WS: Enviando ALL_PLAYERS_READY a /topic/game/{}", gameId);
            messagingTemplate.convertAndSend("/topic/game/" + gameId, payload);

            // Limpiar el set para esta ronda (ya no lo necesitamos)
            readyPlayersByRound.remove(roundId);
        }

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    /*
     * @PostMapping("/initialize/{gameId}")
     * public ResponseEntity<Round> initializeRound(@PathVariable Integer gameId) {
     * Game game = gameService.findGame(gameId);
     * 
     * // Suponemos que siempre se crea la primera ronda (por ahora)
     * Round round = roundService.initializeRound(game, 1);
     * 
     * return ResponseEntity.ok(round);
     * }
     */
}