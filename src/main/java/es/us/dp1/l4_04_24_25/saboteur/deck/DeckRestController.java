package es.us.dp1.l4_04_24_25.saboteur.deck;

import java.util.List;

import org.springframework.beans.BeanUtils;
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
@RequestMapping("/api/v1/decks")
@SecurityRequirement(name = "bearerAuth")
public class DeckRestController {

    private final DeckService deckService;

    @Autowired
    public DeckRestController(DeckService deckService) {
        this.deckService = deckService;
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
    public ResponseEntity<Deck> create(@Valid @RequestBody Deck deck) {
        Deck newDeck = new Deck();
        BeanUtils.copyProperties(deck, newDeck, "id");
        Deck savedDeck = deckService.saveDeck(newDeck);
        return new ResponseEntity<>(savedDeck, HttpStatus.CREATED);
    }

    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Deck> update(@PathVariable("id") Integer id, @RequestBody Deck deck) {
        RestPreconditions.checkNotNull(deckService.findDeck(id), "Deck", "ID", id);
        return new ResponseEntity<>(deckService.updateDeck(deck, id), HttpStatus.OK);
    }

    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(deckService.findDeck(id), "Deck", "ID", id);
        deckService.deleteDeck(id);
        return new ResponseEntity<>(new MessageResponse("Deck deleted!"), HttpStatus.OK);
    }


    @GetMapping("byActivePlayerId")
    public ResponseEntity<Deck> findByActivePlayerId(@RequestParam Integer activePlayerId) {
        Deck res = deckService.findByActivePlayerId(activePlayerId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("card")
    public ResponseEntity<Deck> findDeckByCardId(@RequestParam Integer cardId) { 
        Deck res = deckService.findDeckByCardId(cardId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}/count")
    public ResponseEntity<Integer> countCardsInDeck(@PathVariable("id") Integer deckId) {
        Integer res = deckService.countCardsInDeck(deckId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}