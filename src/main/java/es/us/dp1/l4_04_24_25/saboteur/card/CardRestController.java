package es.us.dp1.l4_04_24_25.saboteur.card;

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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/cards")
@SecurityRequirement(name = "bearerAuth")
public class CardRestController {

    private final CardService cardService;

    @Autowired
    public CardRestController(CardService cardService) {
        this.cardService = cardService;
    }

    @GetMapping
    public ResponseEntity<List<Card>> findAll() {
        List<Card> res;
        res = (List<Card>) cardService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Card> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(cardService.findCard(id), HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Card> create(@RequestBody @Valid Card card) {
        Card newCard = new Card();
        BeanUtils.copyProperties(card, newCard, "id");
        Card savedCard = cardService.saveCard(card);
        return new ResponseEntity<>(savedCard, HttpStatus.CREATED);
    }

    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Card> update(@PathVariable("id") Integer id, @RequestBody @Valid Card card) {
        RestPreconditions.checkNotNull(cardService.findCard(id), "Card", "ID", id);
        return new ResponseEntity<>(cardService.updateCard(card, id), HttpStatus.OK);
    }

    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(cardService.findCard(id), "Card", "ID", id);
        cardService.deleteCard(id);
        return new ResponseEntity<>(new MessageResponse("Card deleted!"), HttpStatus.OK);
    }
}