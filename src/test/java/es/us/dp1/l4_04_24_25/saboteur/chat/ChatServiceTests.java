package es.us.dp1.l4_04_24_25.saboteur.chat;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameRepository;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;

@Epic("Chats")
@Feature("Chats Service Tests")
// @Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
class ChatServiceTests {

    @Autowired
    private ChatService chatService;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private GameRepository gameRepository;

    @Test
    void shouldFindSingleChatById() {
        Integer id = 1;
        Chat chat = this.chatService.findChat(id);
        assertEquals(id, chat.getId());
    }

    @Test
    void shouldNotFindSingleChatById() {
        Integer id = 40;
        assertThrows(ResourceNotFoundException.class, () -> this.chatService.findChat(id));
    }

    @Test
    void shouldFindAllChats() {
        List<Chat> chats = (List<Chat>) this.chatService.findAll();
        assertEquals(5, chats.size()); // 5 chats in data.sql
    }

    @Test
    void shouldFindByGameId() {
        Integer id = 1;
        Chat chat = this.chatService.findByGameId(id);
        assertTrue(chat.getGame().getId() == id);
    }

    @Test
    void shouldNotFindByGameId() {
        Integer id = 40;
        assertThrows(ResourceNotFoundException.class, () -> this.chatService.findByGameId(id));
    }

    @Test
    @Transactional
    void shouldDeleteChat() {

        Integer id = 2;
        Chat chatToDelete = this.chatService.findChat(id);
        assertEquals(id, chatToDelete.getId());

        if (chatToDelete.getGame() != null) {
            chatToDelete.getGame().setChat(null);
            gameRepository.save(chatToDelete.getGame());
        }

        this.chatService.deleteChat(id);
        assertThrows(ResourceNotFoundException.class, () -> this.chatService.findChat(id));
    }

    @Test
    @Transactional
    void shouldSaveChat() {
        Chat newChat = new Chat();
        Chat saved = chatService.saveChat(newChat);
        assertNotNull(saved.getId());
    }

    @Test
    @Transactional
    void shouldUpdateChat() {
        Integer id = 1;
        Chat updateInfo = new Chat();

        Chat updated = chatService.updateChat(updateInfo, id);

        assertNotNull(updated);
        assertEquals(id, updated.getId());
    }

    @Test
    void shouldFailDeleteNonExistentChat() {
        assertThrows(ResourceNotFoundException.class, () -> chatService.deleteChat(999));
    }

    @Test
    @Transactional
    void shouldReturnEmptyListWhenNoChatsExist() {

        List<Game> games = (List<Game>) gameRepository.findAll();
        for (Game g : games) {
            g.setChat(null);
            gameRepository.save(g);
        }

        chatRepository.deleteAll();

        List<Chat> chats = (List<Chat>) chatService.findAll();
        assertTrue(chats.isEmpty());
    }
}