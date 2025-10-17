package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

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
@RequestMapping("/api/v1/activePlayers")
@SecurityRequirement(name = "bearerAuth")
class ActivePlayerRestController {

    private final ActivePlayerService activePlayerService;

    @Autowired
    public ActivePlayerRestController(ActivePlayerService activePlayerService) {
        this.activePlayerService = activePlayerService;
    }

    @GetMapping
    public ResponseEntity<List<ActivePlayer>> findAll(){

        List<ActivePlayer> res;
        res = (List<ActivePlayer>) activePlayerService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<ActivePlayer> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(activePlayerService.findActivePlayer(id), HttpStatus.OK);
    }

    @GetMapping("byRol")
    public ResponseEntity<List<ActivePlayer>> findByRol(@RequestParam Boolean rol){
        List<ActivePlayer> res;
        res = (List<ActivePlayer>) activePlayerService.findByRol(rol);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    /*
    @GetMapping("byGameId")
    public ResponseEntity<List<ActivePlayer>> findByGameId(@RequestParam Integer gameId){
        List<ActivePlayer> res;
        res = (List<ActivePlayer>) activePlayerService.findByGameId(gameId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    */

    @GetMapping("byUsername")
    public ResponseEntity<ActivePlayer> findByUsername(@RequestParam String username){
        ActivePlayer res;
        res = activePlayerService.findByUsername(username);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("creatorByGameId") 
    public ResponseEntity<ActivePlayer> findCreatorByGameId(@RequestParam Integer gameId){
        ActivePlayer res;
        res = activePlayerService.findCreatorByGameId(gameId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byPickaxeState")
    public ResponseEntity<List<ActivePlayer>> findByPickaxeState(@RequestParam Boolean pickaxeState){
        List<ActivePlayer> res;
        res = (List<ActivePlayer>) activePlayerService.findByPickaxeState(pickaxeState);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byCandleState")
    public ResponseEntity<List<ActivePlayer>> findByCandleState(@RequestParam Boolean candleState){
        List<ActivePlayer> res;
        res = (List<ActivePlayer>) activePlayerService.findByCandleState(candleState);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byCartState")
    public ResponseEntity<List<ActivePlayer>> findByCartState(@RequestParam Boolean cartState){
        List<ActivePlayer> res;
        res = (List<ActivePlayer>) activePlayerService.findByCartState(cartState);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    /*
    @GetMapping("winnerByGameId")
    public ResponseEntity<ActivePlayer> findWinnerByGameId(@RequestParam Integer gameId){
        ActivePlayer res;
        res = activePlayerService.findWinnerByGameId(gameId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    */

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<ActivePlayer> create(@RequestBody @Valid ActivePlayer activePlayer) {
        ActivePlayer savedActivePlayer = activePlayerService.saveActivePlayer(activePlayer);
        return new ResponseEntity<ActivePlayer>(savedActivePlayer, HttpStatus.CREATED);
    }

    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<ActivePlayer> update(@PathVariable("id") Integer id, @RequestBody @Valid ActivePlayer activePlayer){
        RestPreconditions.checkNotNull(activePlayerService.findActivePlayer(id), "ActivePlayer", "ID", id);
        return new ResponseEntity<>(activePlayerService.updateActivePlayer(activePlayer, id), HttpStatus.OK);
    }

    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(activePlayerService.findActivePlayer(id), "ActivePlayer", "ID", id);
        activePlayerService.deleteActivePlayer(id);
        return new ResponseEntity<>(new MessageResponse("ActivePlayer deleted!"), HttpStatus.OK);
    }
    
    
}