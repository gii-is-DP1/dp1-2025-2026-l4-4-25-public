package es.us.dp1.l4_04_24_25.saboteur.message;

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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

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

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.chat.Chat;
import es.us.dp1.l4_04_24_25.saboteur.chat.ChatService;
import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Message Module")
@Feature("Message Controller Tests")
@Owner("DP1-tutors")
@WebMvcTest(controllers = MessageRestController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class),
    excludeAutoConfiguration = SecurityConfiguration.class)
class MessageRestControllerTests {

    private static final int TEST_MESSAGE_ID = 1;
    private static final int TEST_CHAT_ID = 10;
    private static final int TEST_PLAYER_ID = 100;
    private static final String TEST_PLAYER_NAME = "Player1";
    private static final String BASE_URL = "/api/v1/messages";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private MessageService messageService;

    @MockBean
    private ChatService chatService;

    @MockBean
    private ActivePlayerService activePlayerService;
    

    private Message message;
    private Chat chat;
    private ActivePlayer activePlayer;

    @BeforeEach
    void setup() {
        
        objectMapper.configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

        chat = new Chat();
        chat.setId(TEST_CHAT_ID);

        activePlayer = new ActivePlayer();
        activePlayer.setId(TEST_PLAYER_ID);
        activePlayer.setUsername(TEST_PLAYER_NAME);

        message = new Message();
        message.setId(TEST_MESSAGE_ID);
        message.setContent("Hello World");
        message.setChat(chat);
        message.setActivePlayer(activePlayer);

        when(chatService.findChat(TEST_CHAT_ID)).thenReturn(chat);
        when(activePlayerService.findByUsername(TEST_PLAYER_NAME)).thenReturn(activePlayer);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindAllMessages() throws Exception {
        when(messageService.findAll()).thenReturn(List.of(message));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(TEST_MESSAGE_ID)));
        
        verify(messageService).findAll();
    }

    @Test
    @WithMockUser("admin")
    void shouldFindById() throws Exception {
        when(messageService.findMessage(TEST_MESSAGE_ID)).thenReturn(message);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_MESSAGE_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_MESSAGE_ID)));
        
        verify(messageService).findMessage(TEST_MESSAGE_ID);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindAllByChatId() throws Exception {
        when(messageService.findAllByChatId(TEST_CHAT_ID)).thenReturn(List.of(message));

        mockMvc.perform(get(BASE_URL + "/byChatId").param("chatId", String.valueOf(TEST_CHAT_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(TEST_MESSAGE_ID)));
        
        verify(messageService).findAllByChatId(TEST_CHAT_ID);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByChatIdAndId() throws Exception {
        when(messageService.findByChatIdAndId(TEST_CHAT_ID, TEST_MESSAGE_ID)).thenReturn(message);

        mockMvc.perform(get(BASE_URL + "/byChatIdAndId")
                .param("chatId", String.valueOf(TEST_CHAT_ID))
                .param("id", String.valueOf(TEST_MESSAGE_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_MESSAGE_ID)));
        
        verify(messageService).findByChatIdAndId(TEST_CHAT_ID, TEST_MESSAGE_ID);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindAllByActivePlayerId() throws Exception {
        when(messageService.findAllByActivePlayerId(TEST_PLAYER_ID)).thenReturn(List.of(message));

        mockMvc.perform(get(BASE_URL + "/byActivePlayerId")
                .param("activePlayerId", String.valueOf(TEST_PLAYER_ID)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
        
        verify(messageService).findAllByActivePlayerId(TEST_PLAYER_ID);
    }


    @Test
    @WithMockUser("admin")
    void shouldCreateMessage() throws Exception {
        when(messageService.saveMessage(any(Message.class))).thenReturn(message);

        Map<String, Object> messageMap = new HashMap<>();
        messageMap.put("content", "New Message");
        messageMap.put("chat", TEST_CHAT_ID); 
        messageMap.put("activePlayer", TEST_PLAYER_NAME);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(messageMap)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(TEST_MESSAGE_ID)));
        
        verify(messageService).saveMessage(any(Message.class));
    }


    @Test
    @WithMockUser("admin")
    void shouldUpdateMessage() throws Exception {
        when(messageService.findMessage(TEST_MESSAGE_ID)).thenReturn(message);
        when(messageService.updateMessage(any(Message.class), eq(TEST_MESSAGE_ID))).thenReturn(message);

        Map<String, Object> messageMap = new HashMap<>();
        messageMap.put("content", "Updated Content");
        messageMap.put("chat", TEST_CHAT_ID);
        messageMap.put("activePlayer", TEST_PLAYER_NAME);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_MESSAGE_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(messageMap)))
                .andExpect(status().isOk());
        
        verify(messageService).updateMessage(any(Message.class), eq(TEST_MESSAGE_ID));
    }

    @Test
    @WithMockUser("admin")
    void shouldFailUpdateNonExistingMessage() throws Exception {
        when(messageService.findMessage(TEST_MESSAGE_ID))
            .thenThrow(new ResourceNotFoundException("Message", "id", TEST_MESSAGE_ID));

        Map<String, Object> messageMap = new HashMap<>();
        messageMap.put("content", "Updated Content");
        messageMap.put("chat", TEST_CHAT_ID);
        messageMap.put("activePlayer", TEST_PLAYER_NAME);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_MESSAGE_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(messageMap)))
                .andExpect(status().isNotFound());
    }


    @Test
    @WithMockUser("admin")
    void shouldDeleteMessage() throws Exception {
        when(messageService.findMessage(TEST_MESSAGE_ID)).thenReturn(message);
        doNothing().when(messageService).deleteMessage(TEST_MESSAGE_ID);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_MESSAGE_ID)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
        
        verify(messageService).deleteMessage(TEST_MESSAGE_ID);
    }
    
    @Test
    @WithMockUser("admin")
    void shouldFailDeleteNonExistingMessage() throws Exception {
        when(messageService.findMessage(TEST_MESSAGE_ID))
            .thenThrow(new ResourceNotFoundException("Message", "id", TEST_MESSAGE_ID));

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_MESSAGE_ID)
                .with(csrf()))
                .andExpect(status().isNotFound());
    }
}