package es.us.dp1.l4_04_24_25.saboteur.message;

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
import io.swagger.v3.oas.annotations.parameters.RequestBody;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/messages")
@SecurityRequirement(name = "bearerAuth")
public class MessageRestController {

    private final MessageService messageService;

    @Autowired
    public MessageRestController(MessageService messageService) {
        this.messageService = messageService;
    }

    @GetMapping
    public ResponseEntity<List<Message>> findAll(){

        Iterable<Message> res;
        res = (List<Message>) messageService.findAll();
        return new ResponseEntity<>((List<Message>) res, HttpStatus.OK);

    }
    
    @GetMapping("byChatId")
    public ResponseEntity<List<Message>> findAllByChatId(Integer chatId){

        List<Message> res;
        res = (List<Message>) messageService.findAllByChatId(chatId);
        return new ResponseEntity<>((List<Message>) res, HttpStatus.OK);

    }

    @GetMapping("byChatIdAndId")
    public ResponseEntity<Message> findByChatIdAndId(Integer chatId, Integer id){
        Message res;
        res = messageService.findByChatIdAndId(chatId, id);
        return new ResponseEntity<>(res, HttpStatus.OK);

    }

    @GetMapping("byActivePlayerId")
    public ResponseEntity<List<Message>> findAllByActivePlayerId(Integer activePlayerId){
        List<Message> res;
        res = (List<Message>) messageService.findAllByActivePlayerId(activePlayerId);
        return new ResponseEntity<>((List<Message>) res, HttpStatus.OK);

    }

    @GetMapping("{id}")
    public ResponseEntity<Message> findById(@PathVariable("id") Integer id){
        return new ResponseEntity<>(messageService.findMessage(id), HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Message> createMessage(@RequestBody @Valid Message message) {
        Message savedMessage = messageService.saveMessage(message);
        return new ResponseEntity<Message>(savedMessage, HttpStatus.CREATED);
    }

    @PutMapping(value = "{messageId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Message> updateMessage(@PathVariable("messageId") Integer id, @RequestBody @Valid Message message) {
        
        RestPreconditions.checkNotNull(messageService.findMessage(id), "Message", "ID", id);
        return new ResponseEntity<>(this.messageService.updateMessage(message, id), HttpStatus.OK);
    }

    @DeleteMapping(value = "{messageId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> deleteMessage(@PathVariable("messageId") Integer id) {
        RestPreconditions.checkNotNull(messageService.findMessage(id), "Message", "ID", id);
        messageService.deleteMessage(id);
        return new ResponseEntity<>(new MessageResponse("Message deleted!"),HttpStatus.OK);
    }


}
