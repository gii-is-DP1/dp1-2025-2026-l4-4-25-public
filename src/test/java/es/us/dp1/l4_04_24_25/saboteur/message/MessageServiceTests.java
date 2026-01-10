package es.us.dp1.l4_04_24_25.saboteur.message;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;

@Epic("Messages")
@Feature ("Messages Tests")
//@Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
class MessageServiceTests {
    @Autowired
    private MessageService messageService;

    @Test
    void shouldFindSingleMessageById(){
        Integer id = 1;
        Message message = this.messageService.findMessage(id);
        assertEquals(id, message.getId());
    }

    @Test
    void shouldNotFindSingleMessageById(){
        Integer id = 30;
        assertThrows(ResourceNotFoundException.class, () -> this.messageService.findMessage(id));
    }

    @Test
    void shouldFindAllMessages(){
        List<Message> messages = (List<Message>) this.messageService.findAll();
        assertEquals(2, messages.size());
    }

    @Test
    void ShouldFindByChatId(){
        Integer id = 1;
        List<Message> messages = (List<Message>) this.messageService.findAllByChatId(id);
        assertTrue(messages.stream().allMatch(x-> x.getChat().getId()==id));
    }
    
    @Test
    void ShouldNotFindByChatId(){
        Integer id = 40;
        List<Message> messages = (List<Message>) this.messageService.findAllByChatId(id);
        assertTrue(messages.isEmpty());
    }
    @Test
    void ShouldFindByChatIdAndId(){
        Integer Cid = 1;
        Integer Mid= 1;
        Message message = this.messageService.findByChatIdAndId(Cid, Mid);
        assertTrue(message.getChat().getId()==Cid && message.getId()==Mid);
    }

    @Test
    void ShouldNotFindByChatIdAndId(){
        Integer Cid = 2;
        Integer Mid = 4;
        assertThrows(ResourceNotFoundException.class, ()->this.messageService.findByChatIdAndId(Cid, Mid));
    }

    @Test
    void ShouldFindAllByActivePlayerId(){
        Integer id = 4;
        List<Message> messages = (List<Message>) this.messageService.findAllByActivePlayerId(id);
        assertTrue(messages.stream().allMatch(x->x.getActivePlayer().getId()==id));
    }

    @Test
    void ShouldNotFindAllByActivePlayerId(){
        Integer id = 50;
        List<Message> messages = (List<Message>) this.messageService.findAllByActivePlayerId(id);
        assertTrue(messages.isEmpty());
    }

    @Test
    void shouldUpdateMessage(){
        Integer id = 2;
        Message message = this.messageService.findMessage(id);
        message.setContent("Updated");
        Message updatedMessage = this.messageService.updateMessage(message, id);
        assertEquals("Updated", updatedMessage.getContent()); 
    }

    @Test
    void shouldDeleteMessage(){
        Integer id = 1;
        Message messageToDelete = this.messageService.findMessage(id);
        assertEquals(id, messageToDelete.getId());
        this.messageService.deleteMessage(id);
        assertThrows(ResourceNotFoundException.class, ()-> this.messageService.findMessage(id));
    }
}
