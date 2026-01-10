package es.us.dp1.l4_04_24_25.saboteur.round;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class RoundPOJOTests {

    @Test
    void testRoundGettersSetters() {
        Round r = new Round();
        r.setId(10);
        assertEquals(10, r.getId());

        // Add more specific logic tests if needed based on Round complexity
        // Assuming Round is mostly POJO here based on file size
    }
}
