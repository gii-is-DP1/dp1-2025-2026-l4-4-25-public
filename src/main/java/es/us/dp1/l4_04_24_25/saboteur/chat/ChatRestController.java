package es.us.dp1.l4_04_24_25.saboteur.chat;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/chats")
@SecurityRequirement(name = "bearerAuth")
public class ChatRestController {

    private final ChatService chatService;

    @Autowired
    public ChatRestController(ChatService chatService) {
        this.chatService = chatService;
    }

    @GetMapping
    public ResponseEntity<List<Chat>> findAll(){

        List<Chat> res;
        res = (List<Chat>) chatService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byGameId")
    public ResponseEntity<Chat> findByGameId(Integer gameId){
        Chat res;
        res = chatService.findByGameId(gameId);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Chat> findById(@PathVariable("id")Integer id){
        return new ResponseEntity<>(chatService.findChat(id),HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Chat> createChat(@RequestBody @Valid Chat chat){
        Chat newChat = new Chat();
        BeanUtils.copyProperties(chat, newChat, "id");
        Chat savedChat = chatService.saveChat(newChat);
        return new ResponseEntity<Chat>(savedChat,HttpStatus.CREATED);
    }

    @PutMapping(value = "{chatId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Chat> updateChat(@PathVariable("chatId") Integer id, @RequestBody @Valid Chat chat){

       
        RestPreconditions.checkNotNull(chatService.findChat(id), "Chat", "ID", id);
        return new ResponseEntity<>(this.chatService.updateChat(chat, id), HttpStatus.OK);
    }

    @PatchMapping(value = "{chatId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Chat> patchChat(@PathVariable("chatId") Integer id, @RequestBody Map<String, Object> updates){
        RestPreconditions.checkNotNull(chatService.findChat(id), "Chat", "ID", id);
        Chat chat = chatService.findChat(id);
        updates.forEach((k, v) -> {
            Field field = ReflectionUtils.findField(Chat.class, k);
            if (field == null) {
                throw new IllegalArgumentException("Field '" + k + "' not found on Achievement class");
            }
            field.setAccessible(true);
            try {
                ReflectionUtils.setField(field, chat, v);
            } catch (Exception e) {
                throw new RuntimeException("Error applying patch", e);
            }
        });
        chatService.saveChat(chat);
        return new ResponseEntity<>(chat, HttpStatus.OK);
    }


    @DeleteMapping(value = "{chatId}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("chatId") int id) {
        RestPreconditions.checkNotNull(chatService.findChat(id), "Chat", "ID", id);
        chatService.deleteChat(id);
        return new ResponseEntity<>(new MessageResponse("Chat deleted!"), HttpStatus.OK);
    }
    
}
