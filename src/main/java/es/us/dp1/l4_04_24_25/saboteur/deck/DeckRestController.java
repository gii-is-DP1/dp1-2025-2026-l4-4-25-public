package es.us.dp1.l4_04_24_25.saboteur.deck;

import java.util.ArrayList;
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
import es.us.dp1.l4_04_24_25.saboteur.card.CardService;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.game.gameStatus;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/decks")
@SecurityRequirement(name = "bearerAuth")
public class DeckRestController {

    private static final Logger log = LoggerFactory.getLogger(DeckRestController.class);

    private final DeckService deckService;
    private final ObjectMapper objectMapper;
    private final ActivePlayerService activePlayerService;
    private final CardService cardService;
    private final SimpMessagingTemplate messagingTemplate; 
    private final GameService gameService; 
    @Autowired
    public DeckRestController(DeckService deckService, ObjectMapper objectMapper, ActivePlayerService activePlayerService, CardService cardService, SimpMessagingTemplate messagingTemplate, GameService gameService) {
        this.deckService = deckService;
        this.objectMapper = objectMapper;
        this.activePlayerService = activePlayerService;
        this.cardService = cardService;
        this.messagingTemplate = messagingTemplate;
        this.gameService = gameService;
    }

    @GetMapping
    public ResponseEntity<List<Deck>> findAll() {
        List<Deck> res = (List<Deck>) deckService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Deck> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(deckService.findDeck(id), HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Deck> create(@Valid @RequestBody Deck deck) throws DataAccessException{
        
        Deck newDeck = new Deck();
        BeanUtils.copyProperties(deck, newDeck, "id", "cards","activePlayer");
    
    if (deck.getCards() != null && !deck.getCards().isEmpty()) {
        for (var card : deck.getCards()) {
            card.setDeck(newDeck);
            newDeck.getCards().add(card);
        }
    }

     if (deck.getActivePlayer() != null) {
        var activePlayer = deck.getActivePlayer();
        activePlayer.setDeck(newDeck);  
        newDeck.setActivePlayer(activePlayer);
    }

    Deck savedDeck = this.deckService.saveDeck(newDeck);
    return new ResponseEntity<>(savedDeck, HttpStatus.CREATED);
    }

    //Revisar el PATCH

    
    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Deck> update(@PathVariable("id") Integer id, @RequestBody Deck deck) {
        RestPreconditions.checkNotNull(deckService.findDeck(id), "Deck", "ID", id);
        Deck updatedDeck = deckService.updateDeck(deck, id);
    return new ResponseEntity<>(updatedDeck, HttpStatus.OK);
    }

    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(deckService.findDeck(id), "Deck", "ID", id);
        deckService.deleteDeck(id);
        return new ResponseEntity<>(new MessageResponse("Deck deleted!"), HttpStatus.OK);
    }

@PatchMapping(value = "{id}")
@ResponseStatus(HttpStatus.OK)
public ResponseEntity<Deck> patch(@PathVariable("id") Integer id, @RequestBody Map<String, Object> updates) throws JsonMappingException {
    
    Deck deck = deckService.findDeck(id);
    RestPreconditions.checkNotNull(deck, "Deck", "ID", id);


    if (updates.containsKey("activePlayer")) {
        Object activePlayerObj = updates.get("activePlayer");

        if (activePlayerObj != null) {
            if (activePlayerObj instanceof Integer){
                Integer activePlayerId = (Integer) activePlayerObj;
                
                ActivePlayer ap = activePlayerService.patchActivePlayer(activePlayerId, Map.of("deck", deck.getId()));
                deck.setActivePlayer(ap);
            } else {
                String activePlayerUsername = (String) activePlayerObj;
                // Usar findByUsernameInOngoingGame para obtener el ActivePlayer correcto de la partida actual
                ActivePlayer ap = activePlayerService.findByUsernameInOngoingGame(activePlayerUsername);
                Integer activePlayerId = ap.getId();
                ActivePlayer apPatched = activePlayerService.patchActivePlayer(activePlayerId, Map.of("deck", deck.getId()));
                deck.setActivePlayer(apPatched);
            }
        } else {
            
            if (deck.getActivePlayer() != null) {
                deck.getActivePlayer().setDeck(null);
            }
            deck.setActivePlayer(null);
        }
    }

   
    if (updates.containsKey("cards")) {
        Object cardsObj = updates.get("cards");
        List<Card> updatedCards = new ArrayList<>();

        if (cardsObj != null) {
            List<Integer> cardIds = (List<Integer>) cardsObj;

           
            List<Card> oldCards = new ArrayList<>(deck.getCards());
            for (Card oldCard : oldCards) {
                if (!cardIds.contains(oldCard.getId())) {
                    oldCard.setDeck(null); 
                    cardService.saveCard(oldCard);
                    deck.getCards().remove(oldCard);
                }
            }

            
            for (Integer cardId : cardIds) {
                Card card = cardService.patchCard(cardId, Map.of("deck", deck.getId()));
                updatedCards.add(card);
            }
        }
        
        deck.setCards(updatedCards);
    }
        Deck updatedDeck = deckService.saveDeck(deck); 

        ActivePlayer currentPlayer = deck.getActivePlayer();
        if(currentPlayer != null){
            String username = currentPlayer.getUsername();
            Integer leftCards = updatedDeck.getCards() != null ? updatedDeck.getCards().size() : 0;
            // Obtener todas las partidas del jugador
            List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(currentPlayer.getId());
            //Seleccionamos solo la partida que está en ONGOING y más reciente
            Game activeGame = games.stream()
            .filter(g -> g.getGameStatus() == gameStatus.ONGOING)
            .sorted((g1, g2) -> {
                // Ordenar por fecha de inicio descendente (más reciente primero)
                if (g1.getStartTime() == null && g2.getStartTime() == null) return 0;
                if (g1.getStartTime() == null) return 1;
                if (g2.getStartTime() == null) return -1;
                return g2.getStartTime().compareTo(g1.getStartTime());
            })
            .findFirst()
            .orElse(null);

            if(activeGame != null){
                Integer gameId = activeGame.getId();
                // Enviar mensaje a todos los suscriptores de /topic/deck-count
                messagingTemplate.convertAndSend("/topic/game/" + gameId + "/deck", Map.of(
                    "action", "DECK_COUNT", 
                    "username", username,
                    "leftCards", leftCards
                ));
                log.info("WS >> Deck update enviado a game {} | user={} | leftCards={}", gameId, username, leftCards);
            }

        }

    return new ResponseEntity<>(updatedDeck, HttpStatus.OK);
}

    @GetMapping("byActivePlayerId")
    public ResponseEntity<Deck> findByActivePlayerId(@RequestParam Integer activePlayerId) {
        Deck res = deckService.findByActivePlayerId(activePlayerId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}/count")
    public ResponseEntity<Integer> countCardsInDeck(@PathVariable("id") Integer deckId) {
        Integer res = deckService.countCardsInDeck(deckId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}