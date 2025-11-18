package es.us.dp1.l4_04_24_25.saboteur.board;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.square.Square;

@ExtendWith(MockitoExtension.class)
class BoardServiceTests {

    @InjectMocks
    private BoardService boardService;

    @Mock
    private BoardRepository boardRepository;

    private Board testBoard;
    private Round mockRound;
    private Square mockSquare;

    private static final int TEST_BOARD_ID = 1;
    private static final int TEST_BASE = 11;
    private static final int TEST_HEIGHT = 9;

    @BeforeEach
    void setup() {
        mockRound = new Round();
        mockRound.setId(1);

        mockSquare = new Square();
        mockSquare.setId(101);

        testBoard = new Board();
        testBoard.setId(TEST_BOARD_ID);
        testBoard.setBase(TEST_BASE);
        testBoard.setHeight(TEST_HEIGHT);   
        testBoard.setRound(mockRound);
        testBoard.getBusy().add(mockSquare);
    }

    @Test
    void shouldFindBoardById() {
        when(boardRepository.findById(TEST_BOARD_ID)).thenReturn(Optional.of(testBoard));

        Board foundBoard = boardService.findBoard(TEST_BOARD_ID);

        assertNotNull(foundBoard);
        assertEquals(TEST_BOARD_ID, foundBoard.getId());
    }

    @Test
    void shouldThrowExceptionWhenFindingNonExistingBoard() {
        when(boardRepository.findById(99999)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> boardService.findBoard(99999));
    }

    @Test
    void shouldInsertNewBoard() {
        Board newBoard = new Board();
        newBoard.setBase(TEST_BASE);
        newBoard.setHeight(TEST_HEIGHT);

        boardService.saveBoard(newBoard);

        verify(boardRepository).saveAndFlush(newBoard);
        assertEquals(TEST_BASE, newBoard.getBase());
        assertEquals(TEST_HEIGHT, newBoard.getHeight());
    }

    @Test
    void shouldUpdateBoardDimensions() {
        final int NEW_BASE = 15;

        Board updatedData = new Board();
        updatedData.setBase(NEW_BASE);
        updatedData.setHeight(TEST_HEIGHT);

        when(boardRepository.findById(TEST_BOARD_ID)).thenReturn(Optional.of(testBoard));
        when(boardRepository.save(any(Board.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Board updatedBoard = boardService.updateBoard(updatedData, TEST_BOARD_ID);

        assertEquals(NEW_BASE, updatedBoard.getBase());
        assertEquals(TEST_HEIGHT, updatedBoard.getHeight());
    }

    @Test
    void shouldDeleteBoard() {
        when(boardRepository.findById(TEST_BOARD_ID)).thenReturn(Optional.of(testBoard));

        boardService.deleteBoard(TEST_BOARD_ID);

        verify(boardRepository).delete(testBoard);
    }

    @Test
    void shouldFindByBase() {
        when(boardRepository.findByBase(TEST_BASE)).thenReturn(List.of(testBoard));

        List<Board> boards = boardService.findByBase(TEST_BASE);

        assertEquals(1, boards.size());
        assertEquals(TEST_BASE, boards.get(0).getBase());
    }

    @Test
    void shouldFindByHeigth() { 
        when(boardRepository.findByHeight(TEST_HEIGHT)).thenReturn(List.of(testBoard));

        List<Board> boards = boardService.findByHeigth(TEST_HEIGHT);

        assertEquals(1, boards.size());
        assertEquals(TEST_HEIGHT, boards.get(0).getHeight());
    }

    @Test
    void shouldFindByBaseAndHeigth() {
        when(boardRepository.findByBaseAndHeight(TEST_BASE, TEST_HEIGHT)).thenReturn(List.of(testBoard));

        List<Board> boards = boardService.findByBaseAndHeigth(TEST_BASE, TEST_HEIGHT);

        assertEquals(1, boards.size());
        assertEquals(TEST_BASE, boards.get(0).getBase());
        assertEquals(TEST_HEIGHT, boards.get(0).getHeight());
    }
}
