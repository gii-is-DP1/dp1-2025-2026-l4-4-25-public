package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
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

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedActivePlayerException;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedPlayerException;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedUserException;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerDTO;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerService;
import es.us.dp1.l4_04_24_25.saboteur.user.UserDTO;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/activePlayers")
@SecurityRequirement(name = "bearerAuth")
class ActivePlayerRestController {

    private final ActivePlayerService activePlayerService;
    private final PlayerService playerService;
    private final UserService userService;
    private final PasswordEncoder encoder;

    @Autowired
    public ActivePlayerRestController(ActivePlayerService activePlayerService, PlayerService playerService, UserService userService, PasswordEncoder encoder) {
        this.activePlayerService = activePlayerService;
        this.encoder = encoder;
        this.userService = userService;
        this.playerService = playerService;
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
    public ResponseEntity<ActivePlayer> createPlayer(@RequestBody @Valid Player activePlayer)
    throws DataAccessException, DuplicatedPlayerException, DuplicatedUserException, DuplicatedActivePlayerException {
        
        if (activePlayerService.existsActivePlayer(activePlayer.getUsername())){
            throw new DuplicatedActivePlayerException("An activePlayer with username '" + activePlayer.getUsername() + "' already exists");
         }
     
         List<ActivePlayer> existingActivePlayers = activePlayerService.findAll();
         boolean emailExistsActivePlayer = existingActivePlayers.stream()
            .anyMatch(u -> u.getEmail().equalsIgnoreCase(activePlayer.getEmail()));
         if (emailExistsActivePlayer) {
            throw new DuplicatedUserException("A user with email '" + activePlayer.getEmail() + "' already exists");
          }
        
        try {
            playerService.findByUsername(activePlayer.getUsername());
            throw new DuplicatedPlayerException("Username already exists: " + activePlayer.getUsername());
        } catch (ResourceNotFoundException e) {
       
        }
        
        if (userService.existsUser(activePlayer.getUsername())) {
            throw new DuplicatedUserException("A user with username '" + activePlayer.getUsername() + "' already exists");
         }

         List<UserDTO> existingUsers = userService.findAll();
         boolean emailExists = existingUsers.stream()
            .anyMatch(u -> u.getEmail().equalsIgnoreCase(activePlayer.getEmail()));

         if (emailExists) {
            throw new DuplicatedUserException("A user with email '" + activePlayer.getEmail() + "' already exists");
          }
        
        try {
            playerService.findByUsername(activePlayer.getUsername());
            throw new DuplicatedPlayerException("Username already exists: " + activePlayer.getUsername());
        } catch (ResourceNotFoundException e) {
        }

        List<PlayerDTO> existingPlayers = playerService.findAll();
        boolean emailExistsPlayer = existingPlayers.stream()
            .anyMatch(u -> u.getEmail().equalsIgnoreCase(activePlayer.getEmail()));

        if (emailExistsPlayer) {
            throw new DuplicatedUserException("A user with email '" + activePlayer.getEmail() + "' already exists");
        }

        ActivePlayer newActivePlayer = new ActivePlayer();
        ActivePlayer savedActivePlayer;

        BeanUtils.copyProperties(activePlayer, newActivePlayer, "id");

        newActivePlayer.setPassword(encoder.encode(activePlayer.getPassword()));
               
        savedActivePlayer = this.activePlayerService.saveActivePlayer(newActivePlayer);

        return new ResponseEntity<>(savedActivePlayer, HttpStatus.CREATED);

    }

    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<ActivePlayer> update(@PathVariable("id") Integer id, @RequestBody @Valid ActivePlayer activePlayer){
        RestPreconditions.checkNotNull(activePlayerService.findActivePlayer(id), "ActivePlayer", "ID", id);
        return new ResponseEntity<>(activePlayerService.updateActivePlayer(activePlayer, id), HttpStatus.OK);
    }

    @PatchMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<ActivePlayer> partialUpdate(@PathVariable("id") Integer id, @RequestBody Map<String, Object> updates){
        RestPreconditions.checkNotNull(activePlayerService.findActivePlayer(id), "ActivePlayer", "ID", id);
        ActivePlayer activePlayer = activePlayerService.findActivePlayer(id);
        updates.forEach((k, v) -> {
            Field field = ReflectionUtils.findField(ActivePlayer.class, k);
            if (field == null) return; 
            ReflectionUtils.makeAccessible(field);
            ReflectionUtils.setField(field, activePlayer, v);
        });
        return new ResponseEntity<>(activePlayerService.updateActivePlayer(activePlayer, id), HttpStatus.OK);
    }
    /*
    @PatchMapping(value = "{username}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<ActivePlayer> partialUpdateByUsername(@PathVariable("username") String username, @RequestBody Map<String, Object> updates){
        RestPreconditions.checkNotNull(activePlayerService.findByUsername(username), "ActivePlayer", "USERNAME", username);
        ActivePlayer activePlayer = activePlayerService.findByUsername(username);
        updates.forEach((k, v) -> {
            Field field = ReflectionUtils.findField(ActivePlayer.class, k);
            ReflectionUtils.makeAccessible(field);
            ReflectionUtils.setField(field, activePlayer, v);
        });
        ActivePlayer updatedActivePlayer = activePlayerService.updateActivePlayer(activePlayer, activePlayer.getId());
        return new ResponseEntity<>(updatedActivePlayer, HttpStatus.OK);
    }
    */
    

    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(activePlayerService.findActivePlayer(id), "ActivePlayer", "ID", id);
        activePlayerService.deleteActivePlayer(id);
        return new ResponseEntity<>(new MessageResponse("ActivePlayer deleted!"), HttpStatus.OK);
    }
    
    
}