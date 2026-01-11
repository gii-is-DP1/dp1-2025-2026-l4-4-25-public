package es.us.dp1.l4_04_24_25.saboteur.game;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;

import org.junit.jupiter.api.Test;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.chat.Chat;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;

class GamePOJOTests {

    @Test
    void testGameGettersSetters() {
        Game game = new Game();

        game.setTime(Duration.ofMinutes(1));
        assertEquals(Duration.ofMinutes(1), game.getTime());

        game.setGameStatus(gameStatus.ONGOING);
        assertEquals(gameStatus.ONGOING, game.getGameStatus());

        game.setPrivate(false);
        assertFalse(game.isPrivate());

        game.setMaxPlayers(5);
        assertEquals(5, game.getMaxPlayers());

        LocalDateTime now = LocalDateTime.now();
        game.setCreatedAt(now);
        assertEquals(now, game.getCreatedAt());

        game.setStartTime(now);
        assertEquals(now, game.getStartTime());

        Chat chat = new Chat();
        game.setChat(chat);
        assertEquals(chat, game.getChat());

        ActivePlayer creator = new ActivePlayer();
        game.setCreator(creator);
        assertEquals(creator, game.getCreator());

        ActivePlayer winner = new ActivePlayer();
        game.setWinner(winner);
        assertEquals(winner, game.getWinner());

        game.setWatchers(new ArrayList<>());
        assertTrue(game.getWatchers().isEmpty());

        game.setActivePlayers(new ArrayList<>());
        assertTrue(game.getActivePlayers().isEmpty());
    }

    @Test
    void testGameLogic() {
        Game game = new Game();
        game.setMaxPlayers(3);
        game.setActivePlayers(new ArrayList<>());

        assertTrue(game.canAddPlayer());

        game.getActivePlayers().add(new ActivePlayer());
        game.getActivePlayers().add(new ActivePlayer());
        game.getActivePlayers().add(new ActivePlayer());

        assertFalse(game.canAddPlayer());

        game.setRounds(new ArrayList<>());
        Round r1 = new Round();
        game.agregarRonda(r1);
        assertEquals(1, game.getRounds().size());
        assertEquals(game, r1.getGame());

        game.agregarRonda(new Round());
        game.agregarRonda(new Round());
        assertEquals(3, game.getRounds().size());

        assertThrows(IllegalStateException.class, () -> game.agregarRonda(new Round()));
    }
}
