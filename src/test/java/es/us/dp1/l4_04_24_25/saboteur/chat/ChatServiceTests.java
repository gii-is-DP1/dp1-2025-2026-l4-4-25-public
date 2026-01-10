package es.us.dp1.l4_04_24_25.saboteur.chat;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertThrowsExactly;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.message.Message;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;

@Epic("Chats")
@Feature("Chats Service Tests")
//@Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
class ChatServiceTests {

    @Autowired
    private ChatService chatService;
   
    
    @Test
    void shouldFindSingleChatById(){
        Integer id = 1;
        Chat chat = this.chatService.findChat(id);
        assertEquals(id, chat.getId());
    }

    @Test
    void shouldNotFindSingleChatById(){
        Integer id = 40;
        assertThrows(ResourceNotFoundException.class, ()->this.chatService.findChat(id));
    }

    @Test
    void shouldFindAllChats(){
        List<Chat> chats = (List<Chat>) this.chatService.findAll();
        assertEquals(2, chats.size());
    }

    @Test
    void shouldFindByGameId(){
        Integer id = 1;
        Chat chat = this.chatService.findByGameId(id);
        assertTrue(chat.getGame().getId()==id);
    }

    @Test
    void shouldNotFindByGameId(){
        Integer id = 40;
        assertThrows(ResourceNotFoundException.class,()->this.chatService.findByGameId(id));
    }

    @Test
    void shouldDeleteChat(){
        Integer id = 2;
        Chat chatToDelete = this.chatService.findChat(id);
        assertEquals(id, chatToDelete.getId());
        this.chatService.deleteChat(id);
        assertThrows(ResourceNotFoundException.class, ()->this.chatService.findChat(id));
    }
}
