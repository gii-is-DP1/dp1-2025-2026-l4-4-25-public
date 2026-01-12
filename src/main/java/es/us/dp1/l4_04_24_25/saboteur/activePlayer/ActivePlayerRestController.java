package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
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
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedActivePlayerException;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedPlayerException;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedUserException;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.game.gameStatus;
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

    private static final Logger log = LoggerFactory.getLogger(ActivePlayerRestController.class);

    private final ActivePlayerService activePlayerService;
    private final PlayerService playerService;
    private final UserService userService;
    private final GameService gameService; 
    private final PasswordEncoder encoder;
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public ActivePlayerRestController(ActivePlayerService activePlayerService, PlayerService playerService, UserService userService,GameService gameService ,PasswordEncoder encoder, ObjectMapper objectMapper, SimpMessagingTemplate messagingTemplate) {
        this.activePlayerService = activePlayerService;
        this.encoder = encoder;
        this.userService = userService;
        this.playerService = playerService;
        this.gameService = gameService; 
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
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
    public ResponseEntity<ActivePlayer> partialUpdate(@PathVariable("id") Integer id, @RequestBody Map<String, Object> updates) throws JsonMappingException{
        RestPreconditions.checkNotNull(activePlayerService.findActivePlayer(id), "ActivePlayer", "ID", id);
        ActivePlayer activePlayer = activePlayerService.findActivePlayer(id);
        
        // Guardar estados anteriores de las herramientas para detectar si se destruyen o reparan
        boolean previousPickaxeState = activePlayer.isPickaxeState();
        boolean previousCandleState = activePlayer.isCandleState();
        boolean previousCartState = activePlayer.isCartState();
        
        // Guardar goldNugget anterior para detectar incrementos
        Integer previousGoldNugget = activePlayer.getGoldNugget() != null ? activePlayer.getGoldNugget() : 0;
        
        ActivePlayer achievementPatched = objectMapper.updateValue(activePlayer, updates);
        ActivePlayer savedPlayer = activePlayerService.updateActivePlayer(achievementPatched, id);
        
        // Actualizar acquiredGoldNuggets del Player si goldNugget incrementó
        if (updates.containsKey("goldNugget")) {
            Integer newGoldNugget = savedPlayer.getGoldNugget() != null ? savedPlayer.getGoldNugget() : 0;
            int increment = newGoldNugget - previousGoldNugget;
            if (increment > 0) {
                Player player = playerService.findPlayer(id);
                player.setAcquiredGoldNuggets(player.getAcquiredGoldNuggets() + increment);
                playerService.savePlayer(player);
            }
        }

        boolean toolsChanged = updates.containsKey("pickaxeState") || 
                               updates.containsKey("candleState") || 
                               updates.containsKey("cartState");

        if (toolsChanged) {
                // Verificar si alguna herramienta fue destruida (cambió de true a false)
                boolean pickaxeDestroyed = previousPickaxeState && !savedPlayer.isPickaxeState();
                boolean candleDestroyed = previousCandleState && !savedPlayer.isCandleState();
                boolean cartDestroyed = previousCartState && !savedPlayer.isCartState();
                
                // Verificar si alguna herramienta fue reparada (cambió de false a true)
                boolean pickaxeRepaired = !previousPickaxeState && savedPlayer.isPickaxeState();
                boolean candleRepaired = !previousCandleState && savedPlayer.isCandleState();
                boolean cartRepaired = !previousCartState && savedPlayer.isCartState();
                
                // Si alguna herramienta fue destruida, incrementar peopleDamaged del jugador que realizó la acción
                if(pickaxeDestroyed || candleDestroyed || cartDestroyed) {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if(auth != null) {
                        String currentUsername = auth.getName();
                        // Solo incrementar si el jugador que destruye es diferente al afectado
                        if(!currentUsername.equals(savedPlayer.getUsername())) {
                            if(activePlayerService.existsActivePlayer(currentUsername)) {
                                ActivePlayer currentActivePlayer = activePlayerService.findByUsernameInOngoingGame(currentUsername);
                                Player currentPlayer = playerService.findPlayer(currentActivePlayer.getId());
                                currentPlayer.setPeopleDamaged(currentPlayer.getPeopleDamaged() + 1);
                                playerService.savePlayer(currentPlayer);
                            }
                        }
                    }
                }
                
                // Si alguna herramienta fue reparada, incrementar peopleRepaired del jugador que realizó la acción
                // Ahora también cuenta cuando te reparas a ti mismo
                if(pickaxeRepaired || candleRepaired || cartRepaired) {
                    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                    if(auth != null) {
                        String currentUsername = auth.getName();
                        // Solo incrementar si el jugador que repara es diferente al afectado
                        if(!currentUsername.equals(savedPlayer.getUsername())) {
                            if(activePlayerService.existsActivePlayer(currentUsername)) {
                                ActivePlayer currentActivePlayer = activePlayerService.findByUsernameInOngoingGame(currentUsername);
                                Player currentPlayer = playerService.findPlayer(currentActivePlayer.getId());
                                currentPlayer.setPeopleRepaired(currentPlayer.getPeopleRepaired() + 1);
                                playerService.savePlayer(currentPlayer);
                            }
                        }
                    }
                }
                
                List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(id);
                // Obtener la partida más reciente en la que participa este ActivePlayer
                Game activeGame = games.stream()
                    .filter(game -> game.getGameStatus() == gameStatus.ONGOING)
                    .max((g1, g2) -> Integer.compare(g1.getId(), g2.getId()))
                    .orElse(null);
                
                if (activeGame != null) {
                    Integer gameId = activeGame.getId();
                    String username = savedPlayer.getUsername();

                    // Preparamos el mensaje
                    Map<String, Object> payload = new HashMap<>();
                    payload.put("action", "TOOLS_CHANGED");
                    payload.put("username", username);
                    
                    // Enviamos el estado limpio para que el frontend lo procese fácil
                    Map<String, Boolean> toolsPayload = new HashMap<>();
                    toolsPayload.put("pickaxe", savedPlayer.isPickaxeState());
                    toolsPayload.put("candle", savedPlayer.isCandleState());
                    toolsPayload.put("wagon", savedPlayer.isCartState());
                    
                    payload.put("tools", toolsPayload);

                    log.info(">>> WS Tools Update para: {} en partida {}", username, gameId);
                    messagingTemplate.convertAndSend("/topic/game/" + gameId, payload);
            }
        }

        return new ResponseEntity<>(savedPlayer, HttpStatus.OK);
    }

    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(activePlayerService.findActivePlayer(id), "ActivePlayer", "ID", id);
        activePlayerService.deleteActivePlayer(id);
        return new ResponseEntity<>(new MessageResponse("ActivePlayer deleted!"), HttpStatus.OK);
    }
    
    
}