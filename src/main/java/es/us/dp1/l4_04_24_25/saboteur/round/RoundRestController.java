package es.us.dp1.l4_04_24_25.saboteur.round;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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
import org.springframework.web.bind.annotation.RequestBody;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/rounds")
@SecurityRequirement(name = "bearerAuth")
public class RoundRestController {

    private final RoundService roundService;

    @Autowired
    public RoundRestController(RoundService roundService) {
        this.roundService = roundService;
    }

    @GetMapping
    public ResponseEntity<List<Round>> findAll(){
        List<Round> res;
        res = (List<Round>) roundService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Round> findById(@PathVariable Integer id){
        Round res;
        res = roundService.findRound(id);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Round> createRound(@Valid @RequestBody Round round){
        Round res = roundService.saveRound(round);
        return new ResponseEntity<>(res, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Round> updateRound(@Valid @RequestBody Round round, @PathVariable Integer id){
        RestPreconditions.checkNotNull(roundService.findRound(id), "Round", "id", id);
        Round updatedRound = roundService.updateRound(round, id);
        return new ResponseEntity<>(updatedRound, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteRound(@PathVariable Integer id){
        RestPreconditions.checkNotNull(roundService.findRound(id), "Round", "id", id);
        roundService.deleteRound(id);
        return new ResponseEntity<>(new MessageResponse("Round deleted successfully!"), HttpStatus.OK);
    }
}
