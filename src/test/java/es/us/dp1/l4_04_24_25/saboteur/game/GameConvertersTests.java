package es.us.dp1.l4_04_24_25.saboteur.game;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.time.Duration;

import org.junit.jupiter.api.Test;

class GameConvertersTests {

    @Test
    void testDurationConverter() {
        DurationSecondsConverter conv = new DurationSecondsConverter();
        assertEquals(60L, conv.convertToDatabaseColumn(Duration.ofMinutes(1)));
        assertNull(conv.convertToDatabaseColumn(null));

        assertEquals(Duration.ofMinutes(1), conv.convertToEntityAttribute(60L));
        assertNull(conv.convertToEntityAttribute(null));
    }
}
