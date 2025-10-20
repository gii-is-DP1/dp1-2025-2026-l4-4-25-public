package es.us.dp1.l4_04_24_25.saboteur.player;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
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
    public ResponseEntity<List<PlayerDTO>> findAll(){
        List<PlayerDTO> res;
        res = (List<PlayerDTO>) playerService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    
    @GetMapping("byGameId")
    public ResponseEntity<List<PlayerDTO>> findAllByGameId(Integer gameId){
        List<PlayerDTO> res;
        res = (List<PlayerDTO>) playerService.findAllByGameId(gameId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byUsername")
    public ResponseEntity<PlayerDTO> findByUsername(@RequestParam String username){
        PlayerDTO res = playerService.findByUsername(username);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byGameIdAndUsername")
    public ResponseEntity<PlayerDTO> findByGameIdAndUsername(Integer gameId, String username){
        PlayerDTO res = playerService.findByGameIdAndUsername(gameId, username);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<PlayerDTO> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(playerService.findPlayerDTO(id), HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Player> createPlayer( @RequestBody @Valid Player player) {
        Player savedPlayer = playerService.savePlayer(player);
        return new ResponseEntity<>(savedPlayer, HttpStatus.CREATED);
    }

    @PutMapping(value = "{playerId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<PlayerDTO> update(@PathVariable("playerId") Integer id, @RequestBody @Valid Player player){
        RestPreconditions.checkNotNull(playerService.findPlayer(id), "Player", "ID", id);
        return new ResponseEntity<>(this.playerService.updatePlayer(player, id), HttpStatus.OK);
    }

    @DeleteMapping(value = "{playerId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("playerId") Integer id) {
        RestPreconditions.checkNotNull(playerService.findPlayer(id), "Player", "ID", id);
        playerService.deletePlayer(id);
        return new ResponseEntity<>(new MessageResponse("Player deleted!"), HttpStatus.OK);
        
    }
}
