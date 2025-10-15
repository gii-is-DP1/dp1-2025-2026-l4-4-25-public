package es.us.dp1.l4_04_24_25.saboteur.player;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.autoconfigure.observation.ObservationProperties.Http;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/players")
@SecurityRequirement(name = "bearerAuth")
public class PlayerRestController {

    private final PlayerService playerService;

    @Autowired
    public PlayerRestController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ResponseEntity<List<Player>> findAll(){

        List<Player> res;
        res = (List<Player>) playerService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    
    @GetMapping("byGameId")
    public ResponseEntity<List<Player>> findAllByGameId(Integer gameId){

        List<Player> res;
        res = (List<Player>) playerService.findAllByGameId(gameId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byUsername")
    public ResponseEntity<Player> findByUsername(String username){
        Player res;
        res = playerService.findByUsername(username);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byGameIdAndUsername")
    public ResponseEntity<Player> findByGameIdAndUsername(Integer gameId, String username){
        Player res;
        res = playerService.findByGameIdAndUsername(gameId, username);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Player> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(playerService.findPlayer(id), HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Player> createPlayer( @RequestBody @Valid Player player) {
        Player savedPlayer = playerService.savePlayer(player);
        return new ResponseEntity<Player>(savedPlayer, HttpStatus.CREATED);
    }

    @PutMapping(value = "{playerId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Player> update(@PathVariable("playerId") Integer id, @RequestBody @Valid Player player){

        RestPreconditions.checkNotNull(playerService.findPlayer(id), "Player", "ID", id);
        return new ResponseEntity<>(this.playerService.updatePlayer(player, id), HttpStatus.OK);
    }

    @DeleteMapping(value = "{playerId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("playerId") int id) {
        RestPreconditions.checkNotNull(playerService.findPlayer(id), "Player", "ID", id);
        playerService.deletePlayer(id);
        return new ResponseEntity<>(new MessageResponse("Player deleted!"), HttpStatus.OK);
        
    }
}
