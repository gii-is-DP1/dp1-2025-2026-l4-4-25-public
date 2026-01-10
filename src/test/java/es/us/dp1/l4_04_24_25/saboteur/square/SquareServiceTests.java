package es.us.dp1.l4_04_24_25.saboteur.square;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;

@Epic("Board's squares")
@Feature("Squares Service Tests")
//@Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
class SquareServiceTests {

    @Autowired
    private SquareService squareService;

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
        List<Square> squares = (List<Square>)this.squareService.findAll();
        assertEquals(2, squares.size());
    }

    @ParameterizedTest
    @ValueSource(booleans={true,false})
    void shouldFindSquaresByOccupation(boolean occupation){
        List<Square> squares = this.squareService.findByOccupation(occupation);
        assertTrue(squares.size()==1);
    }

    @Test
    void shouldFindSquaresByType(){
        List<Square> squares = this.squareService.findByType(Enum.valueOf(type.class, "PATH"));
        assertTrue(squares.size()==1);
    }

    @Test
    void shouldNotFindSquaresByType(){
        List<Square> squares = this.squareService.findByType(Enum.valueOf(type.class, "START"));
        assertTrue(squares.isEmpty());
    }
    
    @Test
    void shouldFindSquareByCoordenates(){
        Integer x = 1;
        Integer y = 4;
        Square square = this.squareService.findByCoordinates(x, y);
        assertNotNull(square);
    }

    @Test
    void shouldNotFindSquareByCoordenates(){
        Integer x = 19;
        Integer y = 12;
        assertNull(this.squareService.findByCoordinates(x, y));
    }

    @Test 
    void shouldPatchSquare(){
        Square square = this.squareService.findSquare(102);
        assertEquals(1, square.getBoard().getId());
        Square patchedSquare = this.squareService.patchSquare(102, Map.of("board",2));
        assertEquals(2, patchedSquare.getBoard().getId());
    }

    @Test
    void shouldUpdateSquare(){
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
}