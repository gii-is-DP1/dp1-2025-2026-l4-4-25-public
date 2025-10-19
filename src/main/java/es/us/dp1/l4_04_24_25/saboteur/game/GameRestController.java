package es.us.dp1.l4_04_24_25.saboteur.game;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

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

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

import java.lang.reflect.Method;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/v1/games")
@SecurityRequirement(name = "bearerAuth")
class GameRestController {

    private final GameService gameService;
    private final ActivePlayerService activePlayerService;

    @Autowired
    public GameRestController(GameService gameService, ActivePlayerService activePlayerService) {
        this.gameService = gameService;
        this.activePlayerService = activePlayerService;
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
    public ResponseEntity<Game> create(@RequestBody @Valid Game game) {
        Game savedGame = gameService.saveGame(new Game(
            game.getTime(),
            game.getGameStatus(),
            game.getLink(),
            game.isPrivate(),
            game.getMaxPlayers(),
            game.getAdmins(),
            game.getWatchers(),
            game.getActivePlayers(),
            game.getWinner(),
            game.getCreator(),
            game.getRounds(),
            game.getChat()
        ));
        return new ResponseEntity<Game>(savedGame, HttpStatus.CREATED);
    }

    @PutMapping(value = "{gameId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Game> update(@PathVariable("gameId") Integer id, @RequestBody @Valid Game game){

        RestPreconditions.checkNotNull(gameService.findGame(id), "Game", "ID", id);
        return new ResponseEntity<>(this.gameService.updateGame(game, id), HttpStatus.OK);
    }

   @PatchMapping(value = "{gameId}")
    public ResponseEntity<Game> patchGame(@PathVariable("gameId") Integer id, @RequestBody Map<String, Object> updates) {
    Game game = gameService.findGame(id);

    updates.forEach((k, v) -> {
        String fieldName = k.equals("private") ? "isPrivate" : k;
        Field field = ReflectionUtils.findField(Game.class, fieldName);
        if (field == null) {
            return ;
        }
        field.setAccessible(true);

        
        try {
            if (field.getType().equals(List.class) && (fieldName.equals("activePlayers") || fieldName.equals("admins") || fieldName.equals("watchers"))) {
            List<String> names = (List<String>) v;
            List<ActivePlayer> objectList = new ArrayList<>();
            for (String name: names){
                ActivePlayer activePlayer = activePlayerService.findByUsername(name);
                objectList.add(activePlayer);
                }
            ReflectionUtils.setField(field, game, objectList);
            }

            if (field.getType().isEnum()) {
                var r = Enum.valueOf((Class<Enum>) field.getType(), v.toString());
                ReflectionUtils.setField(field, game, r);
            } else {
                ReflectionUtils.setField(field, game, v);
            }
           
        } catch (Exception e) {
            throw new RuntimeException("Error applying patch", e);
        }
        
    });

    gameService.saveGame(game);
    return ResponseEntity.ok(game);
}

    @DeleteMapping(value = "{gameId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("gameId") int id) {
        RestPreconditions.checkNotNull(gameService.findGame(id), "Game", "ID", id);
        if (gameService.findGame(id).getGameStatus().equals("CREATED"))
            gameService.deleteGame(id);
        else
            throw new IllegalStateException("You can't delete an ongoing or finished game!");
        return new ResponseEntity<>(new MessageResponse("Game deleted!"), HttpStatus.OK);
    }
    
}
