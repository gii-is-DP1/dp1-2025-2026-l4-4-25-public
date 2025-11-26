package es.us.dp1.l4_04_24_25.saboteur.request;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.WebSecurityConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Requests Module")
@Feature("Requests Management")
@Owner("DP1-tutors")
@WebMvcTest(controllers = RequestRestController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class),
    excludeAutoConfiguration = SecurityConfiguration.class)
class RequestRestControllerTests {

    private static final int TEST_REQUEST_ID = 1;
    private static final String BASE_URL = "/api/v1/requests";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private RequestService requestService;

    @MockBean
    private PlayerService playerService; 

    private Request request;
    private Player sender;
    private Player receiver;

    @BeforeEach
    void setup() {
        sender = new Player();
        sender.setId(10);
        sender.setUsername("Sender");
        sender.setFriends(new ArrayList<>());

        receiver = new Player();
        receiver.setId(20);
        receiver.setUsername("Receiver");
        receiver.setFriends(new ArrayList<>());

        request = new Request();
        request.setId(TEST_REQUEST_ID);
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setStatus(RequestStatus.PENDING);

        when(playerService.findByUsername("Sender")).thenReturn(sender);
        when(playerService.findByUsername("Receiver")).thenReturn(receiver);
    }


    @Test
    @WithMockUser("admin")
    void shouldFindAllRequests() throws Exception {
        when(requestService.findAll()).thenReturn(List.of(request));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindRequestById() throws Exception {
        when(requestService.findRequest(TEST_REQUEST_ID)).thenReturn(request);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_REQUEST_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_REQUEST_ID)));
    }
    
    @Test
    @WithMockUser("admin")
    void shouldFindBySenderId() throws Exception {
        when(requestService.findBySenderId(10)).thenReturn(request);
        mockMvc.perform(get(BASE_URL + "/bySenderId").param("senderId", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByReceiverId() throws Exception {
        when(requestService.findByReceiverId(20)).thenReturn(request);
        mockMvc.perform(get(BASE_URL + "/byReceiverId").param("receiverId", "20"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser("admin")
    void shouldFindBySenderUsername() throws Exception {
        when(requestService.findBySenderUsername("Sender")).thenReturn(request);
        mockMvc.perform(get(BASE_URL + "/bySenderUsername").param("senderUsername", "Sender"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByReceiverUsername() throws Exception {
        when(requestService.findByReceiverUsername("Receiver")).thenReturn(request);
        mockMvc.perform(get(BASE_URL + "/byReceiverUsername").param("receiverUsername", "Receiver"))
                .andExpect(status().isOk());
    }


    @Test
    @WithMockUser("admin")
    void shouldCreateRequestSuccessfully() throws Exception {
        when(requestService.existsPendingRequestBetweenPlayers(any(), any())).thenReturn(false);
        when(requestService.saveRequest(any(Request.class))).thenReturn(request);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser("admin")
    void shouldFailCreateIfSenderEqualsReceiver() throws Exception {
        
        request.setReceiver(sender);
      
        when(playerService.findByUsername("Sender")).thenReturn(sender);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(result -> assertTrue(result.getResolvedException().getMessage().contains("Sender and Receiver cannot be the same")));
    }

    @Test
    @WithMockUser("admin")
    void shouldFailCreateIfRequestAlreadyExists() throws Exception {
        when(requestService.existsPendingRequestBetweenPlayers(any(), any())).thenReturn(true);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(result -> assertTrue(result.getResolvedException().getMessage().contains("already a pending request")));
    }

    @Test
    @WithMockUser("admin")
    void shouldFailCreateIfStatusNotPending() throws Exception {
        request.setStatus(RequestStatus.APPROVED);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(result -> assertTrue(result.getResolvedException().getMessage().contains("must have PENDING status")));
    }

    @Test
    @WithMockUser("admin")
    void shouldFailCreateIfAlreadyFriends() throws Exception {
       
        sender.getFriends().add(receiver);
        
        when(requestService.existsPendingRequestBetweenPlayers(any(), any())).thenReturn(false);
     
        when(playerService.findByUsername("Sender")).thenReturn(sender);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isInternalServerError())
                .andExpect(result -> assertTrue(result.getResolvedException().getMessage().contains("already friends")));
    }

    @Test
    @WithMockUser("admin")
    void shouldUpdateRequest() throws Exception {
        when(requestService.findRequest(TEST_REQUEST_ID)).thenReturn(request);
        when(requestService.updateRequest(eq(TEST_REQUEST_ID), any(Request.class))).thenReturn(request);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_REQUEST_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser("admin")
    void shouldPatchRequest() throws Exception {
        Map<String, Object> updates = new HashMap<>();
        updates.put("status", "APPROVED");

        when(requestService.findRequest(TEST_REQUEST_ID)).thenReturn(request);
        when(requestService.updateRequest(eq(TEST_REQUEST_ID), any(Request.class))).thenReturn(request);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_REQUEST_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser("admin")
    void shouldDeleteRequest() throws Exception {
        when(requestService.findRequest(TEST_REQUEST_ID)).thenReturn(request);
        doNothing().when(requestService).deleteRequest(TEST_REQUEST_ID);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_REQUEST_ID)
                .with(csrf()))
                .andExpect(status().isOk());
        
        verify(requestService).deleteRequest(TEST_REQUEST_ID);
    }
    
    @Test
    @WithMockUser("admin")
    void shouldFailDeleteNonExistentRequest() throws Exception {
        when(requestService.findRequest(TEST_REQUEST_ID)).thenThrow(new ResourceNotFoundException("Request", "id", TEST_REQUEST_ID));

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_REQUEST_ID)
                .with(csrf()))
                .andExpect(status().isNotFound());
    }
}