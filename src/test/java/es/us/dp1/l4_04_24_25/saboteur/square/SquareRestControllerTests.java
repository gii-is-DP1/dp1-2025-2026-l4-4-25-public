package es.us.dp1.l4_04_24_25.saboteur.square;

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
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.config.annotation.web.WebSecurityConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.board.BoardService;
import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import es.us.dp1.l4_04_24_25.saboteur.card.CardService;
import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Board's squares")
@Feature("Squares Controller Tests")
@Owner("DP1-tutors")
@WebMvcTest(controllers = SquareRestController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class),
    excludeAutoConfiguration = SecurityConfiguration.class)
class SquareRestControllerTests {

    private static final int TEST_SQUARE_ID = 100;
    private static final int TEST_BOARD_ID = 1;
    private static final String BASE_URL = "/api/v1/squares";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private SquareService squareService;

    @MockBean
    private BoardService boardService;

    @MockBean
    private CardService cardService;

    @MockBean
    private SimpMessagingTemplate messagingTemplate;

    private Square square;
    private Board board;

    @BeforeEach
    void setup() {
        board = new Board();
        board.setId(TEST_BOARD_ID);

        square = new Square();
        square.setId(TEST_SQUARE_ID);
        square.setCoordinateX(5);
        square.setCoordinateY(5);
        square.setOccupation(false);
        square.setType(type.PATH);
        square.setBoard(board);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindAllSquares() throws Exception {
        when(squareService.findAll()).thenReturn(List.of(square));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].coordinateX", is(5)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindSquareById() throws Exception {
        when(squareService.findSquare(TEST_SQUARE_ID)).thenReturn(square);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_SQUARE_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_SQUARE_ID)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByOccupation() throws Exception {
        when(squareService.findByOccupation(false)).thenReturn(List.of(square));

        mockMvc.perform(get(BASE_URL + "/byOccupation").param("occupation", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByType() throws Exception {
        when(squareService.findByType(type.PATH)).thenReturn(List.of(square));

        mockMvc.perform(get(BASE_URL + "/byType").param("type", "PATH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByCoordinates() throws Exception {
        when(squareService.findByCoordinates(5, 5)).thenReturn(square);

        mockMvc.perform(get(BASE_URL + "/byCoordinates")
                .param("coordinateX", "5")
                .param("coordinateY", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.coordinateX", is(5)));
    }
    
    @Test
    @WithMockUser("admin")
    void shouldFindByBoardAndCoordinates() throws Exception {
        when(boardService.findBoard(TEST_BOARD_ID)).thenReturn(board);
        when(squareService.findByBoardIdAndCoordinates(board, 5, 5)).thenReturn(square);

        mockMvc.perform(get(BASE_URL + "/byBoardAndCoordinates")
                .param("boardId", String.valueOf(TEST_BOARD_ID))
                .param("coordinateX", "5")
                .param("coordinateY", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_SQUARE_ID)));
    }

    @Test
    @WithMockUser("admin")
    void shouldCreateSquare() throws Exception {
        when(squareService.existsByCoordinateXAndCoordinateY(5, 5)).thenReturn(false);
        when(squareService.saveSquare(any(Square.class))).thenReturn(square);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(square)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.coordinateX", is(5)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFailCreateDuplicateSquare() throws Exception {
        when(squareService.existsByCoordinateXAndCoordinateY(5, 5)).thenReturn(true);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(square)))
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedSquareException));
    }

    @Test
    @WithMockUser("admin")
    void shouldUpdateSquare() throws Exception {
        when(squareService.findSquare(TEST_SQUARE_ID)).thenReturn(square);
        when(squareService.updateSquare(any(Square.class), eq(TEST_SQUARE_ID))).thenReturn(square);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_SQUARE_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(square)))
                .andExpect(status().isOk());
    }


    @Test
    @WithMockUser("admin")
    void shouldPatchSquareCoordinatesWithDuplicateCheck() throws Exception {
       
        Map<String, Object> updates = new HashMap<>();
        updates.put("coordinateX", 2);
        updates.put("coordinateY", 2);

        when(squareService.findSquare(TEST_SQUARE_ID)).thenReturn(square);
        when(squareService.existsByCoordinateXAndCoordinateY(2, 2)).thenReturn(true);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_SQUARE_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedSquareException));
    }

    
    @Test
    @WithMockUser("admin")
    void shouldPatchSquareAndPlaceCardAndNotifyWebSocket() throws Exception {
        Map<String, Object> updates = new HashMap<>();
        updates.put("card", 10);

        Card card = new Card(); card.setId(10);
        
        when(squareService.findSquare(TEST_SQUARE_ID)).thenReturn(square);
        when(cardService.findCard(10)).thenReturn(card);
        when(squareService.saveSquare(any(Square.class))).thenReturn(square);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_SQUARE_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());

       
        verify(cardService, org.mockito.Mockito.times(2)).findCard(10);
        verify(squareService).saveSquare(any(Square.class));
        verify(messagingTemplate).convertAndSend(eq("/topic/game/" + TEST_BOARD_ID), any(Map.class));
    }
    @Test
    @WithMockUser("admin")
    void shouldDeleteSquare() throws Exception {
        when(squareService.findSquare(TEST_SQUARE_ID)).thenReturn(square);
        doNothing().when(squareService).deleteSquare(TEST_SQUARE_ID);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_SQUARE_ID)
                .with(csrf()))
                .andExpect(status().isOk());
        
        verify(squareService).deleteSquare(TEST_SQUARE_ID);
    }
}