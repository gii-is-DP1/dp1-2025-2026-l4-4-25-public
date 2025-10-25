package es.us.dp1.l4_04_24_25.saboteur.round;

import java.util.List;
import java.util.Map;
import java.time.Duration;

import org.springframework.beans.BeanUtils; 
import org.springframework.beans.factory.annotation.Autowired;
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

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/rounds")
@SecurityRequirement(name = "bearerAuth")
public class RoundRestController {

    private final RoundService roundService;
    private final ObjectMapper objectMapper; 

    @Autowired
    public RoundRestController(RoundService roundService, ObjectMapper objectMapper) {
        this.roundService = roundService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<Round>> findAll(){
        List<Round> res = (List<Round>) roundService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Round> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(roundService.findRound(id), HttpStatus.OK);
    }
    
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Round> create(@RequestBody @Valid Round round) {
        Round newRound = new Round(); 
        BeanUtils.copyProperties(round, newRound, "id");
        Round savedRound = this.roundService.saveRound(newRound);
        return new ResponseEntity<>(savedRound, HttpStatus.CREATED);
    }


    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Round> update(@PathVariable("id") Integer id, @RequestBody @Valid Round round){
        RestPreconditions.checkNotNull(roundService.findRound(id), "Round", "ID", id);
        return new ResponseEntity<>(roundService.updateRound(round, id), HttpStatus.OK);
    }

    @PatchMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Round> patch(@PathVariable("id") Integer id, @RequestBody Map<String, Object> updates) throws JsonMappingException {
        RestPreconditions.checkNotNull(roundService.findRound(id), "Round", "ID", id);
        Round round = roundService.findRound(id);
        Round roundPatched = objectMapper.updateValue(round, updates);
        roundService.updateRound(roundPatched, id);
        return new ResponseEntity<>(roundPatched, HttpStatus.OK);
    }

    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(roundService.findRound(id), "Round", "ID", id);
        roundService.deleteRound(id);
        return new ResponseEntity<>(new MessageResponse("Round deleted!"), HttpStatus.OK);
    }

    @GetMapping("byGameId")
    public ResponseEntity<List<Round>> findByGameId(@RequestParam Integer gameId){
        List<Round> res = roundService.findByGameId(gameId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    
    @GetMapping("byGameIdAndNumber")
    public ResponseEntity<Round> findByGameIdAndRoundNumber(@RequestParam Integer gameId, @RequestParam Integer roundNumber){
        Round res = roundService.findByGameIdAndRoundNumber(gameId, roundNumber);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    
    @GetMapping("byWinnerRol")
    public ResponseEntity<List<Round>> findByWinnerRol(@RequestParam boolean winnerRol){
        List<Round> res = roundService.findByWinnerRol(winnerRol);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    
    @GetMapping("byRoundNumber")
    public ResponseEntity<List<Round>> findByRoundNumber(@RequestParam Integer roundNumber){
        List<Round> res = roundService.findByRoundNumber(roundNumber);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    
    @GetMapping("byLeftCards")
    public ResponseEntity<List<Round>> findByLeftCardsLessThanEqual(@RequestParam Integer leftCards){
        List<Round> res = roundService.findByLeftCardsLessThanEqual(leftCards);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}