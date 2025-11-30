package es.us.dp1.l4_04_24_25.saboteur.game;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class GameFinishedEventTests {

    @Test
    void shouldHoldGameData() {
        Game game = new Game();
        game.setId(10);
        Object source = new Object();

        GameFinishedEvent event = new GameFinishedEvent(source, game);

        assertEquals(game, event.getGame());
        assertEquals(source, event.getSource());
    }
}