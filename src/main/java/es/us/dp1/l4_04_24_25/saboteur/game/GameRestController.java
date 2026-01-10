package es.us.dp1.l4_04_24_25.saboteur.game;

import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.ReflectionUtils;
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

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import es.us.dp1.l4_04_24_25.saboteur.chat.Chat;
import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.EmptyActivePlayerListException;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerService;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundService;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/games")
@SecurityRequirement(name = "bearerAuth")
class GameRestController {

    private final GameService gameService;
    private final PlayerService playerService;
    private final ObjectMapper objectMapper;
    private final RoundService roundService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ActivePlayerService activePlayerService;


    @Autowired
    public GameRestController(GameService gameService, PlayerService playerService, ObjectMapper objectMapper, RoundService roundService, SimpMessagingTemplate messagingTemplate, ActivePlayerService activePlayerService) {
        this.gameService = gameService;
        this.playerService = playerService;
        this.objectMapper = objectMapper;
        this.roundService = roundService;
        this.messagingTemplate = messagingTemplate;
        this.activePlayerService = activePlayerService;
    }


    @GetMapping
    public ResponseEntity<List<Game>> findAll(){

        List<Game> res;
        res = (List<Game>) gameService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byCreator")
    public ResponseEntity<List<Game>> findByCreator(@RequestParam String creatorUsername){
        List<Game> res;
        res = gameService.findByCreator(creatorUsername);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("myGames")
    public ResponseEntity<List<Game>> findMyGames(){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        List<Game> res = gameService.findGamesByPlayerUsername(username);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Game> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(gameService.findGame(id), HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Game> create(@RequestBody @Valid Game game) throws EmptyActivePlayerListException {
        Game newGame = new Game();
        BeanUtils.copyProperties(game, newGame, "id", "time", "gameStatus", "chat", "watchers", "rounds" );
        if (newGame.getActivePlayers() == null || newGame.getActivePlayers().isEmpty()) {
            throw new IllegalArgumentException("A game must have at least one active player (the creator).");
        }
        Chat chat = new Chat();
        chat.setGame(newGame);
        newGame.setChat(chat);
        newGame.setCreatedAt(LocalDateTime.now());
        Game savedGame = gameService.saveGame(newGame);
        return new ResponseEntity<Game>(savedGame, HttpStatus.CREATED);
    }

    @PutMapping(value = "{gameId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Game> update(@PathVariable("gameId") Integer id, @RequestBody @Valid Game game){

        RestPreconditions.checkNotNull(gameService.findGame(id), "Game", "ID", id);
        return new ResponseEntity<>(this.gameService.updateGame(game, id), HttpStatus.OK);
    }

   @PatchMapping(value = "{gameId}")
    public ResponseEntity<Game> patchGame(@PathVariable("gameId") Integer id, @RequestBody Map<String, Object> updates) throws JsonMappingException {
        Game game = gameService.findGame(id);
        RestPreconditions.checkNotNull(game, "Game", "ID", id);
        
        if (updates.containsKey("watchers")) {
        Object playerObj = updates.get("watchers");
        List<Player> updatedPlayers = new ArrayList<>();

        if (playerObj != null) {
            List<String> playerUsernames = (List<String>) playerObj;

          
            List<Player> oldWatchers = new ArrayList<>(game.getWatchers());
            for (Player oldWatcher : oldWatchers) {
                if (!playerUsernames.contains(oldWatcher.getUsername())) {
                    oldWatcher.setGame(null); // desvincula del Deck
                    playerService.savePlayer(oldWatcher);
                    game.getWatchers().remove(oldWatcher);
                }
            }

            for (String playerUsername : playerUsernames) {
                Player p = playerService.findByUsername(playerUsername);
                Integer pId = p.getId();
                Player watcher = playerService.patchPlayer(pId, Map.of("game", game.getId()));
                updatedPlayers.add(watcher);
            }
        }

        game.setWatchers(updatedPlayers);
    }

    if (updates.containsKey("rounds")) {
        Object roundObj = updates.get("rounds");
        List<Round> updatedRounds = new ArrayList<>();

        if (roundObj != null) {
            List<Integer> roundIds = (List<Integer>) roundObj;

         
            List<Round> oldRounds = new ArrayList<>(game.getRounds());
            for (Round oldRound : oldRounds) {
                if (!roundIds.contains(oldRound.getId())) {
                    oldRound.setGame(null); 
                    roundService.saveRound(oldRound);
                    game.getRounds().remove(oldRound);
                }
            }

            for (Integer roundId : roundIds) {
                Round round = roundService.patchRoundGame(roundId, Map.of("game", game.getId()));
                updatedRounds.add(round);
            }
        }

        game.setRounds(updatedRounds);
    }

    if (updates.containsKey("winner")) {
        Object winnerObj = updates.get("winner");
        if (winnerObj != null) {
            Integer winnerId = null;
            if (winnerObj instanceof Map) {
                Map<String, Object> winnerMap = (Map<String, Object>) winnerObj;
                if (winnerMap.containsKey("id")) {
                    winnerId = ((Number) winnerMap.get("id")).intValue();
                }
            } else if (winnerObj instanceof Number) {
                winnerId = ((Number) winnerObj).intValue();
            }
            
            if (winnerId != null) {
                ActivePlayer winner = activePlayerService.findActivePlayer(winnerId);
                if (winner != null) {
                    game.setWinner(winner);
                    System.out.println(">>> WINNER SET: ID=" + winnerId + ", Username=" + winner.getUsername());
}
            }
        }
        updates.remove("winner");
    }

    Game gamePatched = objectMapper.updateValue(game, updates);
    Game savedGame = gameService.updateGame(gamePatched, id);

    System.out.println(">>> PATCH RECIBIDO. Updates: " + updates);

    if (updates.containsKey("gameStatus") && "FINISHED".equals(updates.get("gameStatus"))) {
        if (savedGame.getStartTime() != null && updates.containsKey("endTime")) {
            String endTimeStr = updates.get("endTime").toString();
            LocalDateTime endTime;
            try {
                java.time.Instant instant = java.time.Instant.parse(endTimeStr);
                endTime = LocalDateTime.ofInstant(instant, java.time.ZoneId.systemDefault());
            } catch (Exception e) {
                endTime = LocalDateTime.parse(endTimeStr.replace("Z", ""));
            }
            
            java.time.Duration duration = java.time.Duration.between(savedGame.getStartTime(), endTime);
            if (duration.isNegative()) {
                duration = duration.abs();
                System.out.println(">>> WARNING: Duration was negative, using absolute value");
            }
            savedGame.setTime(duration);
            gameService.saveGame(savedGame);
            System.out.println(">>> GAME FINISHED. Start: " + savedGame.getStartTime() + ", End: " + endTime + ", Duration: " + duration);
        }
    }
    
    if (updates.containsKey("gameStatus") && "ONGOING".equals(updates.get("gameStatus"))) {

        System.out.println(">>> CAMBIO A ONGOING DETECTADO. Preparando payload para WebSocket.");

        savedGame.setStartTime(LocalDateTime.now());
        gameService.saveGame(savedGame);

        // 1. Obtener la ronda actual
        List<Round> rounds = roundService.findByGameId(id);

        if (rounds.isEmpty()) {
            System.out.println(">>> ERROR: NO EXISTE ROUND PARA ESTE GAME");
        }

        Round currentRound = rounds.get(rounds.size() - 1);

        // 2. Cargar el game completo
        Game fullGame = gameService.findGame(id);

        // 3. Montar payload explícito
        Map<String, Object> payload = Map.of(
            "game", fullGame,
            "round", currentRound
        );

        System.out.println(">>> ENVIANDO PAYLOAD AL SOCKET:");
        System.out.println(payload);

        messagingTemplate.convertAndSend("/topic/game/" + id, payload);
    }

    return new ResponseEntity<>(savedGame, HttpStatus.OK);
}

    @DeleteMapping(value = "{gameId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("gameId") int id) {
        Game game = gameService.findGame(id);
        RestPreconditions.checkNotNull(game, "Game", "ID", id);
        
        if (game.getGameStatus().equals(Enum.valueOf(gameStatus.class, "CREATED"))) {
            Map<String, Object> payload = Map.of(
                "gameCancelled", true,
                "gameId", id,
                "message", "The game has been cancelled by the creator"
            );
            
            System.out.println(">>> GAME CANCELLED. Notifying all players via WebSocket for game ID: " + id);
            messagingTemplate.convertAndSend("/topic/game/" + id, payload);
            
            gameService.deleteGame(id);
        } else {
            throw new IllegalStateException("You can't delete an ongoing or finished game!");
        }
        
        return new ResponseEntity<>(new MessageResponse("Game deleted!"), HttpStatus.OK);
    }
    
}
