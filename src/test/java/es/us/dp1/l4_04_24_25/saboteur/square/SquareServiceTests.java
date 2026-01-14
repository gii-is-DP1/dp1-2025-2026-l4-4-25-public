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
import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import es.us.dp1.l4_04_24_25.saboteur.card.CardService;
import es.us.dp1.l4_04_24_25.saboteur.tunnel.Tunnel;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;

@Epic("Board's squares")
@Feature("Squares Service Tests")
@SpringBootTest
@AutoConfigureTestDatabase
@Transactional
class SquareServiceTests {

    @Autowired
    private SquareService squareService;

    @Autowired
    private BoardService boardService;

    @Autowired
    private CardService cardService;

    @Test
    void shouldFindSingleSquareById() {
        Integer id = 101;
        Square square = this.squareService.findSquare(id);
        assertEquals(id, square.getId());
    }

    @Test
    void shouldNotFindSingleSquareById() {
        Integer id = 9999;
        assertThrows(ResourceNotFoundException.class, () -> this.squareService.findSquare(id));
    }

    @Test
    void shouldFindAllSquares() {
        List<Square> squares = (List<Square>) this.squareService.findAll();
        assertFalse(squares.isEmpty());
    }

    @ParameterizedTest
    @ValueSource(booleans = { true, false })
    void shouldFindSquaresByOccupation(boolean occupation) {
        List<Square> squares = this.squareService.findByOccupation(occupation);
        assertNotNull(squares);
    }

    @Test
    void shouldFindSquaresByType() {
        List<Square> squares = this.squareService.findByType(type.PATH);
        assertNotNull(squares);
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
        assertNull(this.squareService.findByCoordinates(99, 99));
    }

    @Test
    void shouldPatchSquare() {
        Square patchedSquare = this.squareService.patchSquare(102, Map.of("board", 2));
        assertEquals(2, patchedSquare.getBoard().getId());
    }

    @Test
    void shouldUpdateSquare() {
        Integer id = 101;
        Square square = this.squareService.findSquare(id);
        square.setOccupation(true);
        Square updatedSquare = this.squareService.updateSquare(square, id);
        assertTrue(updatedSquare.isOccupation());
    }

    @Test
    void shouldDeleteSquare() {
        Square newSq = new Square();
        newSq.setCoordinateX(50);
        newSq.setCoordinateY(50);
        newSq = squareService.saveSquare(newSq);
        Integer id = newSq.getId();

        this.squareService.deleteSquare(id);
        assertThrows(ResourceNotFoundException.class, () -> this.squareService.findSquare(id));
    }

    @Test
    void shouldExistByCoordinateXAndCoordinateY() {
        assertTrue(squareService.existsByCoordinateXAndCoordinateY(1, 4));
    }

    @Test
    void shouldFindByBoardIdAndCoordinates() {
        Board board = boardService.findBoard(1);
        Square square = squareService.findByBoardIdAndCoordinates(board, 1, 4);
        assertNotNull(square);
        assertEquals(board.getId(), square.getBoard().getId());
    }

    @Test
    void shouldSaveSquare() {
        Square newSquare = new Square();
        newSquare.setCoordinateX(55);
        newSquare.setCoordinateY(55);
        newSquare.setOccupation(false);
        newSquare.setType(type.PATH);

        Square saved = squareService.saveSquare(newSquare);
        assertNotNull(saved.getId());
    }


   @Test
    void shouldGetGoalRevealsWhenTunnelConnectsToGoal() {
        Board board = boardService.findBoard(1);
    
    
        Tunnel existingTunnel = (Tunnel) cardService.findCard(34); 

        Square currentSquare = squareService.findByBoardIdAndCoordinates(board, 1, 4);
        assertNotNull(currentSquare, "El cuadrado (1,4) debería existir en el board 1");
        currentSquare.setCard(existingTunnel);
    
        Square target = squareService.findByBoardIdAndCoordinates(board, 2, 4);
        if(target == null) {
            target = new Square();
            target.setBoard(board);
            target.setCoordinateX(2);
            target.setCoordinateY(4);
        }
        target.setType(type.GOAL);
        target.setGoalType(GoalType.GOLD);
        squareService.saveSquare(target);

        List<Map<String, Object>> reveals = squareService.getGoalReveals(currentSquare);
    
    
        assertNotNull(reveals, "Debería revelar el objetivo en (2,4) ya que el túnel 34 conecta en todas direcciones");
        assertFalse(reveals.isEmpty());
        assertEquals("gold", reveals.get(0).get("goalType"));
}
    @Test
    void shouldReturnNullWhenTunnelHasBlockedCenter() {
        Tunnel blockedTunnel = new Tunnel();
        blockedTunnel.setCentro(true); // Bloqueado
        blockedTunnel.setDerecha(true);
        cardService.saveCard(blockedTunnel);

        Square square = squareService.findSquare(101);
        square.setCard(blockedTunnel);
        
        List<Map<String, Object>> reveals = squareService.getGoalReveals(square);
        assertNull(reveals, "Si el centro está bloqueado no debe revelar nada");
    }

    @Test
    void shouldHandleSquarePatchedWithCardPlaced() {
        Square square = squareService.findSquare(101);
        Tunnel tunnel = new Tunnel();
        cardService.saveCard(tunnel);
        
        square.setCard(tunnel);
        squareService.handleSquarePatched(square);
        
        assertNotNull(square.getCard());
    }

    @Test
    void shouldIncludeGoalRevealsInPatchedMessage() {
        Board board = boardService.findBoard(1);
        Square square = squareService.findByBoardIdAndCoordinates(board, 1, 4);
    
        Tunnel existingTunnel = (Tunnel) cardService.findCard(34);
    
        square.setCard(existingTunnel);

        try {
            squareService.handleSquarePatched(square);
        } catch (Exception e) {
            org.junit.jupiter.api.Assertions.fail("handleSquarePatched lanzó excepción: " + e.getMessage());
        }
    }
    @Test
    void shouldTestSquareGettersAndSetters() {
        Square square = new Square();
        square.setCoordinateX(3);
        square.setCoordinateY(7);
        square.setOccupation(true);
        square.setType(type.GOAL);
        square.setGoalType(GoalType.GOLD);

        assertEquals(3, square.getCoordinateX());
        assertEquals(7, square.getCoordinateY());
        assertTrue(square.isOccupation());
        assertEquals(type.GOAL, square.getType());
        assertEquals(GoalType.GOLD, square.getGoalType());
    }
}