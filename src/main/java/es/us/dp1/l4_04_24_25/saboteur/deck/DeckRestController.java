package es.us.dp1.l4_04_24_25.saboteur.deck;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/decks")
@SecurityRequirement(name = "bearerAuth")
public class DeckRestController {

    private final DeckService deckService;
    private final ObjectMapper objectMapper;
    private final ActivePlayerService activePlayerService;
    private final CardService cardService;

    @Autowired
    public DeckRestController(DeckService deckService, ObjectMapper objectMapper, ActivePlayerService activePlayerService, CardService cardService) {
        this.deckService = deckService;
        this.objectMapper = objectMapper;
        this.activePlayerService = activePlayerService;
        this.cardService = cardService;
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
/* 
    @PatchMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Deck> patch(@PathVariable("id") Integer id, @RequestBody Map<String, Object> updates) throws JsonMappingException{
        RestPreconditions.checkNotNull(deckService.findDeck(id), "Deck", "ID", id);
        Deck deck = deckService.findDeck(id);
        Deck deckPatched = objectMapper.updateValue(deck, updates);
        deckService.updateDeck(deckPatched, id);
        return new ResponseEntity<>(deckPatched, HttpStatus.OK);
    }
*/

@PatchMapping(value = "{id}")
@ResponseStatus(HttpStatus.OK)
public ResponseEntity<Deck> patch(@PathVariable("id") Integer id, @RequestBody Map<String, Object> updates) throws JsonMappingException {
    // 1️⃣ Obtenemos el Deck
    Deck deck = deckService.findDeck(id);
    RestPreconditions.checkNotNull(deck, "Deck", "ID", id);

    // 2️⃣ Actualizar ActivePlayer si viene en el JSON
    if (updates.containsKey("activePlayer")) {
        Object activePlayerObj = updates.get("activePlayer");

        if (activePlayerObj != null) {
            if (activePlayerObj instanceof Integer){
                Integer activePlayerId = (Integer) activePlayerObj;
                // Llamada al PATCH de ActivePlayer para actualizar su deck
                ActivePlayer ap = activePlayerService.patchActivePlayer(activePlayerId, Map.of("deck", deck.getId()));
                deck.setActivePlayer(ap);
            } else {
                String activePlayerUsername = (String) activePlayerObj;
                ActivePlayer ap = activePlayerService.findByUsername(activePlayerUsername);
                Integer activePlayerId = ap.getId();
                ActivePlayer apPatched = activePlayerService.patchActivePlayer(activePlayerId, Map.of("deck", deck.getId()));
                deck.setActivePlayer(apPatched);
            }
        } else {
            // Quitar el ActivePlayer anterior
            if (deck.getActivePlayer() != null) {
                deck.getActivePlayer().setDeck(null);
            }
            deck.setActivePlayer(null);
        }
    }

    // 3️⃣ Actualizar Cards si vienen en el JSON
    if (updates.containsKey("cards")) {
        Object cardsObj = updates.get("cards");
        List<Card> updatedCards = new ArrayList<>();

        if (cardsObj != null) {
            List<Integer> cardIds = (List<Integer>) cardsObj;

            // Desvinculamos cartas antiguas que no están en la nueva lista
            List<Card> oldCards = new ArrayList<>(deck.getCards());
            for (Card oldCard : oldCards) {
                if (!cardIds.contains(oldCard.getId())) {
                    oldCard.setDeck(null); // desvincula del Deck
                    cardService.saveCard(oldCard);
                    deck.getCards().remove(oldCard);
                }
            }

            // Vinculamos las nuevas cartas
            for (Integer cardId : cardIds) {
                Card card = cardService.patchCard(cardId, Map.of("deck", deck.getId()));
                updatedCards.add(card);
            }
        }

        deck.setCards(updatedCards);
    }

    // 4️⃣ Guardamos el Deck para sincronizar las colecciones en memoria
    Deck updatedDeck = deckService.saveDeck(deck);

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