package es.us.dp1.l4_04_24_25.saboteur.game;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedLinkException;
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

    @Autowired
    public GameRestController(GameService gameService, PlayerService playerService, ObjectMapper objectMapper, RoundService roundService) {
        this.gameService = gameService;
        this.playerService = playerService;
        this.objectMapper = objectMapper;
        this.roundService = roundService;
    }


    @GetMapping
    public ResponseEntity<List<Game>> findAll(){

        List<Game> res;
        res = (List<Game>) gameService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }


    @GetMapping("byLink")
    public ResponseEntity<Game> findByLink(@RequestParam String link){
        Game res;
        res = gameService.findByLink(link);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byCreator")
    public ResponseEntity<Game> findByCreator(@RequestParam String creatorUsername){
        Game res;
        res = gameService.findByCreator(creatorUsername);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Game> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(gameService.findGame(id), HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Game> create(@RequestBody @Valid Game game) throws DuplicatedLinkException, EmptyActivePlayerListException {
        Game newGame = new Game();
        BeanUtils.copyProperties(game, newGame, "id", "time", "gameStatus", "chat", "watchers", "rounds" );
        if (newGame.getActivePlayers() == null || newGame.getActivePlayers().isEmpty()) {
            throw new IllegalArgumentException("A game must have at least one active player (the creator).");
        }
        if (gameService.existsByLink(newGame.getLink())) {
            throw new EmptyActivePlayerListException("A game with the same link already exists.");
        }
        Chat chat = new Chat();
        chat.setGame(newGame);
        newGame.setChat(chat);
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

            // Desvinculamos cartas antiguas que no están en la nueva lista
            List<Player> oldWatchers = new ArrayList<>(game.getWatchers());
            for (Player oldWatcher : oldWatchers) {
                if (!playerUsernames.contains(oldWatcher.getUsername())) {
                    oldWatcher.setGame(null); // desvincula del Deck
                    playerService.savePlayer(oldWatcher);
                    game.getWatchers().remove(oldWatcher);
                }
            }

            // Vinculamos las nuevas cartas
            for (String playerUsername : playerUsernames) {
                Player p = playerService.findByUsername(playerUsername);
                Integer pId = p.getId();
                Player watcher = playerService.patchPlayer(pId, Map.of("game", game.getId()));
                updatedPlayers.add(watcher);
            }
        }

        game.setWatchers(updatedPlayers);
    }

    // 3️⃣ Actualizar Round si vienen en el JSON
    if (updates.containsKey("rounds")) {
        Object roundObj = updates.get("rounds");
        List<Round> updatedRounds = new ArrayList<>();

        if (roundObj != null) {
            List<Integer> roundIds = (List<Integer>) roundObj;

            // Desvinculamos cartas antiguas que no están en la nueva lista
            List<Round> oldRounds = new ArrayList<>(game.getRounds());
            for (Round oldRound : oldRounds) {
                if (!roundIds.contains(oldRound.getId())) {
                    oldRound.setGame(null); // desvincula del Deck
                    roundService.saveRound(oldRound);
                    game.getRounds().remove(oldRound);
                }
            }

            // Vinculamos las nuevas cartas
            for (Integer roundId : roundIds) {
                Round round = roundService.patchRoundGame(roundId, Map.of("game", game.getId()));
                updatedRounds.add(round);
            }
        }

        game.setRounds(updatedRounds);
    }

    // 4️⃣ Guardamos el Deck para sincronizar las colecciones en memoria
    //Game updatedGame = gameService.saveGame(game);
    Game gamePatched = objectMapper.updateValue(game, updates);
    gameService.updateGame(gamePatched, id);

    return new ResponseEntity<>(gamePatched, HttpStatus.OK);
}

    @DeleteMapping(value = "{gameId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("gameId") int id) {
        RestPreconditions.checkNotNull(gameService.findGame(id), "Game", "ID", id);
        if (gameService.findGame(id).getGameStatus().equals(Enum.valueOf(gameStatus.class, "CREATED")))
            gameService.deleteGame(id);
        else
            throw new IllegalStateException("You can't delete an ongoing or finished game!");
        return new ResponseEntity<>(new MessageResponse("Game deleted!"), HttpStatus.OK);
    }
    
}
