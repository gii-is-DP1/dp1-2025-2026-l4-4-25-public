package es.us.dp1.l4_04_24_25.saboteur.card;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;

@WebMvcTest(controllers = CardRestController.class)
@ComponentScan(basePackageClasses = { es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions.class })
class CardRestControllerTests {

    private static final String BASE_URL = "/api/v1/cards";
    private static final int TEST_CARD_ID = 1;

    @MockBean
    private CardService cardService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Card testCard;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public ObjectMapper objectMapper() {
            ObjectMapper om = new ObjectMapper();
            om.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            om.disable(MapperFeature.USE_ANNOTATIONS);
            return om;
        }
    }

    @BeforeEach
    void setup() {
        Deck deck = new Deck();
        deck.setId(1);

        testCard = new Card();
        testCard.setId(TEST_CARD_ID);
        testCard.setImage("img.png");
        testCard.setStatus(true);
        testCard.setDeck(deck);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindAllCards() throws Exception {
        when(cardService.findPlayableCards()).thenReturn(List.of(testCard));
        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk());
        verify(cardService).findPlayableCards();
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindCardById() throws Exception {
        when(cardService.findCard(TEST_CARD_ID)).thenReturn(testCard);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_CARD_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_CARD_ID));

        verify(cardService).findCard(TEST_CARD_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenCardDoesNotExist() throws Exception {
        when(cardService.findCard(TEST_CARD_ID))
                .thenThrow(new ResourceNotFoundException("Card", "id", TEST_CARD_ID));

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_CARD_ID))
                .andExpect(status().isNotFound());

        verify(cardService).findCard(TEST_CARD_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldCreateCard() throws Exception {
        when(cardService.saveCard(any(Card.class))).thenReturn(testCard);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCard)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(TEST_CARD_ID));

        verify(cardService).saveCard(any(Card.class));
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnErrorWhenCreateFails() throws Exception {
        when(cardService.saveCard(any(Card.class)))
                .thenThrow(new DataAccessException("DB Error") {});

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCard)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldUpdateCard() throws Exception {
        when(cardService.findCard(TEST_CARD_ID)).thenReturn(testCard);
        when(cardService.updateCard(any(Card.class), anyInt())).thenReturn(testCard);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_CARD_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCard)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_CARD_ID));

        verify(cardService).updateCard(any(Card.class), anyInt());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenUpdatingNonExistingCard() throws Exception {
        when(cardService.findCard(TEST_CARD_ID))
                .thenThrow(new ResourceNotFoundException("Card", "id", TEST_CARD_ID));

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_CARD_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testCard)))
                .andExpect(status().isNotFound());

        verify(cardService, never()).updateCard(any(Card.class), anyInt());
    }

    
    @Test
    @WithMockUser(value = "spring")
    void shouldPatchCard() throws Exception {

        Map<String, Object> updates = new HashMap<>();
        updates.put("image", "new.png");

        Card patched = new Card();
        patched.setId(TEST_CARD_ID);
        patched.setImage("new.png");
        patched.setStatus(testCard.isStatus());
        patched.setDeck(testCard.getDeck());

        when(cardService.findCard(TEST_CARD_ID)).thenReturn(testCard);
        when(cardService.updateCard(any(Card.class), anyInt())).thenReturn(patched);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_CARD_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.image").value("new.png"));

        verify(cardService).updateCard(any(Card.class), anyInt());
    }
    
    @Test
    @WithMockUser(value = "spring")
    void shouldDeleteCard() throws Exception {
        when(cardService.findCard(TEST_CARD_ID)).thenReturn(testCard);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_CARD_ID)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Card deleted!"));

        verify(cardService).deleteCard(TEST_CARD_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenDeletingNonExistingCard() throws Exception {
        when(cardService.findCard(TEST_CARD_ID))
                .thenThrow(new ResourceNotFoundException("Card", "id", TEST_CARD_ID));

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_CARD_ID)
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(cardService, never()).deleteCard(anyInt());
    }
}
