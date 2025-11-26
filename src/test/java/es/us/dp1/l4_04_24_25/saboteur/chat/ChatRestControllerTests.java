package es.us.dp1.l4_04_24_25.saboteur.chat;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.WebSecurityConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Chat Module")
@Feature("Chat Controller Tests")
@Owner("DP1-tutors")
@WebMvcTest(controllers = ChatRestController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class),
    excludeAutoConfiguration = SecurityConfiguration.class)
class ChatRestControllerTests {

    private static final int TEST_CHAT_ID = 1;
    private static final String BASE_URL = "/api/v1/chats";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatService chatService;

    @MockBean
    private GameService gameService;

    @MockBean
    private MessageService messageService;
    
    private Chat chat;

    @BeforeEach
    void setup() {
        
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

        chat = new Chat();
        chat.setId(TEST_CHAT_ID);
        chat.setMessages(new ArrayList<>());
      
        Game game = new Game();
        game.setId(100);
        chat.setGame(game);
     
        when(gameService.findGame(100)).thenReturn(game);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindAllChats() throws Exception {
        when(chatService.findAll()).thenReturn(List.of(chat));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(TEST_CHAT_ID)));
        
        verify(chatService).findAll();
    }

    @Test
    @WithMockUser("admin")
    void shouldFindChatById() throws Exception {
        when(chatService.findChat(TEST_CHAT_ID)).thenReturn(chat);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_CHAT_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_CHAT_ID)));
        
        verify(chatService).findChat(TEST_CHAT_ID);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByGameId() throws Exception {
        int gameId = 100;
        when(chatService.findByGameId(gameId)).thenReturn(chat);

        mockMvc.perform(get(BASE_URL + "/byGameId").param("gameId", String.valueOf(gameId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_CHAT_ID)));
        
        verify(chatService).findByGameId(gameId);
    }

    @Test
    @WithMockUser("admin")
    void shouldCreateChat() throws Exception {
        when(chatService.saveChat(any(Chat.class))).thenReturn(chat);

        Map<String, Object> chatMap = new HashMap<>();

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(chatMap)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(TEST_CHAT_ID)));
        
        verify(chatService).saveChat(any(Chat.class));
    }

    @Test
    @WithMockUser("admin")
    void shouldUpdateChat() throws Exception {
        when(chatService.findChat(TEST_CHAT_ID)).thenReturn(chat);
        when(chatService.updateChat(any(Chat.class), eq(TEST_CHAT_ID))).thenReturn(chat);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_CHAT_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(chat)))
                .andExpect(status().isOk());
        
        verify(chatService).updateChat(any(Chat.class), eq(TEST_CHAT_ID));
    }

    @Test
    @WithMockUser("admin")
    void shouldPatchChat() throws Exception {
        Map<String, Object> updates = new HashMap<>();
        
        when(chatService.findChat(TEST_CHAT_ID)).thenReturn(chat);
        
        when(chatService.updateChat(any(Chat.class), eq(TEST_CHAT_ID))).thenReturn(chat);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_CHAT_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());
        
        verify(chatService).updateChat(any(Chat.class), eq(TEST_CHAT_ID));
    }

    @Test
    @WithMockUser("admin")
    void shouldDeleteChat() throws Exception {
        when(chatService.findChat(TEST_CHAT_ID)).thenReturn(chat);
        doNothing().when(chatService).deleteChat(TEST_CHAT_ID);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_CHAT_ID)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
        
        verify(chatService).deleteChat(TEST_CHAT_ID);
    }
    
    @Test
    @WithMockUser("admin")
    void shouldFailDeleteNonExistingChat() throws Exception {
        when(chatService.findChat(TEST_CHAT_ID))
            .thenThrow(new ResourceNotFoundException("Chat", "id", TEST_CHAT_ID));

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_CHAT_ID)
                .with(csrf()))
                .andExpect(status().isNotFound());
    }
}