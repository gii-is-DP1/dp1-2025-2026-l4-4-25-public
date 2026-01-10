package es.us.dp1.l4_04_24_25.saboteur.square;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.card.Card;

class SquarePOJOTests {

    @Test
    void testSquareGettersSetters() {
        Square s = new Square();

        s.setCoordinateX(5);
        assertEquals(5, s.getCoordinateX());

        s.setCoordinateY(3);
        assertEquals(3, s.getCoordinateY());

        s.setOccupation(true);
        assertTrue(s.isOccupation());

        s.setType(type.PATH);
        assertEquals(type.PATH, s.getType());

        s.setGoalType(GoalType.GOLD);
        assertEquals(GoalType.GOLD, s.getGoalType());

        Board b = new Board();
        s.setBoard(b);
        assertEquals(b, s.getBoard());

        Card c = new Card();
        s.setCard(c);
        assertEquals(c, s.getCard());

        s.setId(10);
        assertEquals(10, s.getId());
    }

    @Test
    void testGoalType() {
        assertEquals("GOLD", GoalType.GOLD.name());
        assertEquals("CARBON_1", GoalType.CARBON_1.name());
        assertEquals("CARBON_2", GoalType.CARBON_2.name());
    }
}
