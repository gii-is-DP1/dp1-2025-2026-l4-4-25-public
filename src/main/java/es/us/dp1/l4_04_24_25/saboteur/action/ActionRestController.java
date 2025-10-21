package es.us.dp1.l4_04_24_25.saboteur.action;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
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
import es.us.dp1.l4_04_24_25.saboteur.card.effectValue;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/actions")
@SecurityRequirement(name = "bearerAuth")
public class ActionRestController {

    private final ActionService actionService;

    @Autowired
    public ActionRestController(ActionService actionService) {
        this.actionService = actionService;
    }

    @GetMapping
    public ResponseEntity<List<Action>> findAll() {
        List<Action> res;
        res = (List<Action>) actionService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Action> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(actionService.findAction(id), HttpStatus.OK);
    }

    @GetMapping("byName")
    public ResponseEntity<List<Action>> findByNameAction(@RequestParam nameAction nameAction) {
        List<Action> res;
        res = (List<Action>) actionService.findByNameAction(nameAction);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byEffectValue")
    public ResponseEntity<List<Action>> findByEffectValue(@RequestParam effectValue effectValue) {
        List<Action> res;
        res = (List<Action>) actionService.findByEffectValue(effectValue);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byObjectAffect")
    public ResponseEntity<List<Action>> findByObjectAffect(@RequestParam boolean objectAffect) {
        List<Action> res;
        res = (List<Action>) actionService.findByObjectAffect(objectAffect);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Action> create(@RequestBody @Valid Action action) throws DataAccessException{
        Action newAction = new Action();
        Action savedAction;
        BeanUtils.copyProperties(action, newAction, "id");
        savedAction = this.actionService.saveAction(newAction);
        return new ResponseEntity<>(savedAction, HttpStatus.CREATED);
    }

    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Action> update(@PathVariable("id") Integer id, @RequestBody @Valid Action action) {
        RestPreconditions.checkNotNull(actionService.findAction(id), "Action", "ID", id);
        return new ResponseEntity<>(actionService.updateAction(action, id), HttpStatus.OK);
    }

    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(actionService.findAction(id), "Action", "ID", id);
        actionService.deleteAction(id);
        return new ResponseEntity<>(new MessageResponse("Action deleted!"), HttpStatus.OK);
    }
}