package es.us.dp1.l4_04_24_25.saboteur.board;

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
import java.util.Optional;

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

import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundService;
import es.us.dp1.l4_04_24_25.saboteur.square.Square;
import es.us.dp1.l4_04_24_25.saboteur.square.SquareService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Board Module")
@Feature("Board Management")
@Owner("DP1-tutors")
@WebMvcTest(controllers = BoardRestController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class),
    excludeAutoConfiguration = SecurityConfiguration.class)
class BoardRestControllerTests {

    private static final int TEST_BOARD_ID = 1;
    private static final int TEST_BASE = 11;
    private static final int TEST_HEIGHT = 9;
    private static final String BASE_URL = "/api/v1/boards";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BoardService boardService;

    @MockBean
    private SquareService squareService;

    @MockBean
    private RoundService roundService;

    private Board board;

    @BeforeEach
    void setup() {
        board = new Board();
        board.setId(TEST_BOARD_ID);
        board.setBase(TEST_BASE);
        board.setHeight(TEST_HEIGHT);
        board.setBusy(new ArrayList<>());
    }


    @Test
    @WithMockUser("admin")
    void shouldFindAllBoards() throws Exception {
        when(boardService.findAll()).thenReturn(List.of(board));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].base", is(TEST_BASE)));
        
        verify(boardService).findAll();
    }

    @Test
    @WithMockUser("admin")
    void shouldFindBoardById() throws Exception {
        when(boardService.findBoard(TEST_BOARD_ID)).thenReturn(board);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_BOARD_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_BOARD_ID)));
        
        verify(boardService).findBoard(TEST_BOARD_ID);
    }

    @Test
    @WithMockUser("admin")
    void shouldCreateBoard() throws Exception {
        when(boardService.saveBoard(any(Board.class))).thenReturn(board);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(board)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.base", is(TEST_BASE)));
        
        verify(boardService).saveBoard(any(Board.class));
    }

    @Test
    @WithMockUser("admin")
    void shouldUpdateBoard() throws Exception {
        when(boardService.findBoard(TEST_BOARD_ID)).thenReturn(board);
        when(boardService.updateBoard(any(Board.class), eq(TEST_BOARD_ID))).thenReturn(board);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_BOARD_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(board)))
                .andExpect(status().isOk());
        
        verify(boardService).updateBoard(any(Board.class), eq(TEST_BOARD_ID));
    }
    
    @Test
    @WithMockUser("admin")
    void shouldFailUpdateNonExistingBoard() throws Exception {
        when(boardService.findBoard(TEST_BOARD_ID)).thenThrow(new ResourceNotFoundException("Board", "id", TEST_BOARD_ID));

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_BOARD_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(board)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser("admin")
    void shouldDeleteBoard() throws Exception {
        when(boardService.findBoard(TEST_BOARD_ID)).thenReturn(board);
        doNothing().when(boardService).deleteBoard(TEST_BOARD_ID);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_BOARD_ID)
                .with(csrf()))
                .andExpect(status().isOk());
        
        verify(boardService).deleteBoard(TEST_BOARD_ID);
    }
    
    @Test
    @WithMockUser("admin")
    void shouldFailDeleteNonExistingBoard() throws Exception {
        when(boardService.findBoard(TEST_BOARD_ID)).thenThrow(new ResourceNotFoundException("Board", "id", TEST_BOARD_ID));

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_BOARD_ID)
                .with(csrf()))
                .andExpect(status().isNotFound());
    }


    @Test
    @WithMockUser("admin")
    void shouldFindByBase() throws Exception {
        when(boardService.findByBase(TEST_BASE)).thenReturn(List.of(board));

        mockMvc.perform(get(BASE_URL + "/byBase").param("base", String.valueOf(TEST_BASE)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }
    
    @Test
    @WithMockUser("admin")
    void shouldFindByHeigth() throws Exception {
        when(boardService.findByHeigth(TEST_HEIGHT)).thenReturn(List.of(board));

        mockMvc.perform(get(BASE_URL + "/byHeigth").param("heigth", String.valueOf(TEST_HEIGHT)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }
    
    @Test
    @WithMockUser("admin")
    void shouldFindByBaseAndHeigth() throws Exception {
        when(boardService.findByBaseAndHeigth(TEST_BASE, TEST_HEIGHT)).thenReturn(List.of(board));

        mockMvc.perform(get(BASE_URL + "/byBaseAndHeigth")
                .param("base", String.valueOf(TEST_BASE))
                .param("heigth", String.valueOf(TEST_HEIGHT)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    
    @Test
    @WithMockUser("admin")
    void shouldPatchBoardSquaresAndRound() throws Exception {
        
        Square oldSquare = new Square(); oldSquare.setId(10);
        Round oldRound = new Round(); oldRound.setId(50);
        board.getBusy().add(oldSquare);
        board.setRound(oldRound);

        when(boardService.findBoard(TEST_BOARD_ID)).thenReturn(board);

        Square newSquare = new Square(); newSquare.setId(20);
      
        when(squareService.findById(20)).thenReturn(Optional.of(newSquare));
        
        when(squareService.patchSquare(eq(20), any())).thenReturn(newSquare);
        
        when(roundService.patchRoundBoard(eq(99), any())).thenReturn(new Round());
        when(boardService.updateBoard(any(Board.class), eq(TEST_BOARD_ID))).thenReturn(board);

        Map<String, Object> updates = new HashMap<>();
        updates.put("busy", List.of(20)); 
        updates.put("round", 99); 

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_BOARD_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());

        verify(squareService).patchSquare(eq(20), any());
        verify(roundService).patchRoundBoard(eq(99), any());
        verify(boardService).updateBoard(any(Board.class), eq(TEST_BOARD_ID));
    }

    @Test
    @WithMockUser("admin")
    void shouldPatchBoardRemoveRound() throws Exception {
       
        Round oldRound = new Round(); oldRound.setId(50);
        board.setRound(oldRound);

        when(boardService.findBoard(TEST_BOARD_ID)).thenReturn(board);
        when(boardService.updateBoard(any(Board.class), eq(TEST_BOARD_ID))).thenReturn(board);

        Map<String, Object> updates = new HashMap<>();
        updates.put("round", null);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_BOARD_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());
        
        verify(boardService).updateBoard(any(Board.class), eq(TEST_BOARD_ID));
    }
}