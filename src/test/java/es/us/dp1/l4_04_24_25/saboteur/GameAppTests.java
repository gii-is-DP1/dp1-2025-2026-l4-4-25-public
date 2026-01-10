package es.us.dp1.l4_04_24_25.saboteur;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class GameAppTests {

    @Test
    void testAppInstantiation() {
        GameApplication app = new GameApplication();
        assertNotNull(app);
    }
}
