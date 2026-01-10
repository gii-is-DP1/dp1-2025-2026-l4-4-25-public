package es.us.dp1.l4_04_24_25.saboteur.square;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.board.BoardService;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;

@Epic("Board's squares")
@Feature("Squares Service Tests")
// @Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
@Transactional
class SquareServiceTests {

    @Autowired
    private SquareService squareService;

    @Autowired
    private BoardService boardService;

    @Test
    void shouldFindSingleSquareById() {
        Integer id = 101;
        Square square = this.squareService.findSquare(id);
        assertEquals(id, square.getId());
    }

    @Test
    void shouldNotFindSingleSquareById() {
        Integer id = 30;
        assertThrows(ResourceNotFoundException.class, () -> this.squareService.findSquare(id));
    }

    @Test
    void shouldFindAllSquares() {
        List<Square> squares = (List<Square>) this.squareService.findAll();
        assertEquals(8, squares.size());
    }

    @ParameterizedTest
    @ValueSource(booleans = { true, false })
    void shouldFindSquaresByOccupation(boolean occupation) {
        List<Square> squares = this.squareService.findByOccupation(occupation);
        assertTrue(squares.size() == 7 || squares.size() == 1);
    }

    @Test
    void shouldFindSquaresByType() {
        List<Square> squares = this.squareService.findByType(Enum.valueOf(type.class, "PATH"));
        assertTrue(squares.size() == 1);
    }

    @Test
    void shouldNotFindSquaresByType() {
        List<Square> squares = this.squareService.findByType(Enum.valueOf(type.class, "START"));
        assertTrue(squares.isEmpty());
    }

    @Test
    void shouldFindSquareByCoordenates() {
        Integer x = 1;
        Integer y = 4;
        Square square = this.squareService.findByCoordinates(x, y);
        assertNotNull(square);
    }

    @Test
    void shouldNotFindSquareByCoordenates() {
        Integer x = 19;
        Integer y = 12;
        assertNull(this.squareService.findByCoordinates(x, y));
    }

    @Test
    void shouldPatchSquare() {
        Square square = this.squareService.findSquare(102);
        assertEquals(1, square.getBoard().getId());
        Square patchedSquare = this.squareService.patchSquare(102, Map.of("board", 2));
        assertEquals(2, patchedSquare.getBoard().getId());
    }

    @Test
    void shouldUpdateSquare() {
        Integer id = 102;
        Square square = this.squareService.findSquare(id);
        square.setOccupation(true);
        Square updatedSquare = this.squareService.updateSquare(square, id);
        assertTrue(updatedSquare.occupation);
    }

    @Test
    void shouldDeleteSquare() {
        Integer id = 102;
        Square squareToDelete = this.squareService.findSquare(id);
        assertEquals(id, squareToDelete.getId());
        this.squareService.deleteSquare(id);
        assertThrows(ResourceNotFoundException.class, () -> this.squareService.findSquare(id));
    }

    @Test
    void shouldExistByCoordinateXAndCoordinateY() {

        boolean exists = squareService.existsByCoordinateXAndCoordinateY(1, 4);
        assertTrue(exists);
    }

    @Test
    void shouldNotExistByCoordinateXAndCoordinateY() {

        boolean exists = squareService.existsByCoordinateXAndCoordinateY(99, 99);
        assertFalse(exists);
    }

    @Test
    void shouldFindByBoardIdAndCoordinates() {

        Board board = boardService.findBoard(1);
        Square square = squareService.findByBoardIdAndCoordinates(board, 1, 4);

        assertNotNull(square);
        assertEquals(1, square.getCoordinateX());
        assertEquals(4, square.getCoordinateY());
        assertEquals(1, square.getBoard().getId());
    }

    @Test
    void shouldPatchSquareWithoutBoardKey() {

        int squareId = 101;
        Square original = squareService.findSquare(squareId);
        int originalBoardId = original.getBoard().getId();

        Map<String, Object> updates = new HashMap<>();
        updates.put("occupation", !original.isOccupation());

        Square patched = squareService.patchSquare(squareId, updates);

        assertEquals(originalBoardId, patched.getBoard().getId());
    }

    @Test
    void shouldFindByIdOptional() {

        assertTrue(squareService.findById(101).isPresent());
        assertFalse(squareService.findById(999).isPresent());
    }

    @Test
    void shouldSaveSquare() {

        Square newSquare = new Square();
        newSquare.setCoordinateX(5);
        newSquare.setCoordinateY(5);
        newSquare.setOccupation(false);
        newSquare.setType(type.PATH);

        Square saved = squareService.saveSquare(newSquare);
        assertNotNull(saved.getId());
    }

    @Test
    void shouldTestTypeEnumValues() {
        // Test type enum
        for (type t : type.values()) {
            assertNotNull(t);
            assertNotNull(type.valueOf(t.name()));
        }
        assertEquals(type.PATH, type.valueOf("PATH"));
        assertEquals(type.GOAL, type.valueOf("GOAL"));
        assertEquals(type.START, type.valueOf("START"));
    }

    @Test
    void shouldTestGoalTypeEnumValues() {
        // Test GoalType enum
        for (GoalType gt : GoalType.values()) {
            assertNotNull(gt);
            assertNotNull(gt.getValue());
            assertNotNull(GoalType.valueOf(gt.name()));
        }
        assertEquals("gold", GoalType.GOLD.getValue());
        assertEquals("carbon_1", GoalType.CARBON_1.getValue());
        assertEquals("carbon_2", GoalType.CARBON_2.getValue());
    }

    @Test
    void shouldTestSquareGettersAndSetters() {
        Square square = new Square();

        square.setCoordinateX(3);
        assertEquals(3, square.getCoordinateX());

        square.setCoordinateY(7);
        assertEquals(7, square.getCoordinateY());

        square.setOccupation(true);
        assertTrue(square.isOccupation());

        square.setType(type.GOAL);
        assertEquals(type.GOAL, square.getType());

        square.setGoalType(GoalType.GOLD);
        assertEquals(GoalType.GOLD, square.getGoalType());
    }

    @Test
    void shouldTestSquareWithCard() {
        Square square = new Square();

        assertNull(square.getCard());

        es.us.dp1.l4_04_24_25.saboteur.tunnel.Tunnel tunnel = new es.us.dp1.l4_04_24_25.saboteur.tunnel.Tunnel();
        tunnel.setImage("test.png");
        tunnel.setArriba(true);
        tunnel.setAbajo(true);

        square.setCard(tunnel);
        assertNotNull(square.getCard());
        assertEquals(tunnel, square.getCard());
    }

    @Test
    void shouldTestSquareWithBoard() {
        Square square = new Square();

        Board board = new Board();
        board.setId(1);
        board.setBase(11);
        board.setHeight(9);

        square.setBoard(board);
        assertEquals(board, square.getBoard());
    }
}