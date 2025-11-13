package es.us.dp1.l4_04_24_25.saboteur.game;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.Assert.assertNotNull;

import java.util.Collection;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Game Module")
@Feature("Game Management")
@Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
class GameServiceTests {

    @Autowired
    private GameService gameService;

    private static final int TEST_GAME_ID = 1; 
    private static final String TEST_LINK_EXISTS = "link"; 
    private static final String TEST_CREATOR_USERNAME = "Carlosbox2k";
    private static final String TEST_LINK_NEW = "new-link-test";

    
    @Test
    @Transactional
    void shouldFindAllGames() {
        List<Game> games = (List<Game>) this.gameService.findAll();
        assertFalse(games.isEmpty());
        assertTrue(games.size() == 2); // hay 2 en el data.sql
    }

    
    @Test
    void shouldFindGameById() {
        Game game = this.gameService.findGame(TEST_GAME_ID);
        assertEquals(TEST_GAME_ID, game.getId());
        assertEquals("link", game.getLink());
        assertEquals(3, game.getMaxPlayers());
    }

    @Test
    void shouldThrowExceptionWhenFindingNonExistingGame() {
        assertThrows(ResourceNotFoundException.class, () -> this.gameService.findGame(99999));
    }

    @Test
    @Transactional
    void shouldInsertNewGame() {
        int initialCount = ((Collection<Game>) this.gameService.findAll()).size();

        Game newGame = new Game();
        newGame.setLink(TEST_LINK_NEW);
        newGame.setPrivate(false);
        newGame.setMaxPlayers(5);
        newGame.setGameStatus(gameStatus.CREATED);

        Game savedGame = this.gameService.saveGame(newGame);

        assertNotNull(savedGame.getId());
        assertEquals(TEST_LINK_NEW, savedGame.getLink());
        assertFalse(savedGame.isPrivate());
        assertEquals(gameStatus.CREATED, savedGame.getGameStatus());

        int finalCount = ((Collection<Game>) this.gameService.findAll()).size();
        assertEquals(initialCount + 1, finalCount);
    }

    
    @Test
    @Transactional
    void shouldUpdateGame() {
        Game existing = this.gameService.findGame(TEST_GAME_ID);
        existing.setMaxPlayers(6);

        Game updated = this.gameService.updateGame(existing, TEST_GAME_ID);

        assertEquals(6, updated.getMaxPlayers());
    }

   
    @Test
    @Transactional
    void shouldDeleteGame() {
        Game existing = this.gameService.findGame(TEST_GAME_ID);
        assertNotNull(existing);

        this.gameService.deleteGame(TEST_GAME_ID);

        assertThrows(ResourceNotFoundException.class, () -> this.gameService.findGame(TEST_GAME_ID));
    }

    @Test
    void shouldFindGameByLink() {
        Game game = this.gameService.findByLink(TEST_LINK_EXISTS);
        assertEquals(TEST_LINK_EXISTS, game.getLink());
        assertEquals(TEST_CREATOR_USERNAME, game.getCreator().getUsername());
    }

    @Test
    void shouldThrowExceptionWhenFindByLink() {
        assertThrows(ResourceNotFoundException.class, () -> this.gameService.findByLink("link-inexistente"));
    }

    
    @Test
    void shouldFindGameByCreator() {
        List<Game> games = (List<Game>) this.gameService.findByCreator(TEST_CREATOR_USERNAME);
        assertFalse(games.isEmpty());
        assertTrue(games.stream().allMatch(g -> g.getCreator().getUsername().equals(TEST_CREATOR_USERNAME)));
    }

    @Test
    void shouldThrowExceptionWhenFindByCreator() {
        assertThrows(ResourceNotFoundException.class, () -> this.gameService.findByCreator("noexiste"));
    }

    
    @Test
    void shouldExistGameByLink() {
        assertTrue(this.gameService.existsByLink(TEST_LINK_EXISTS));
    }

    @Test
    void shouldNotExistGameByLink() {
        assertFalse(this.gameService.existsByLink("unreal-link"));
    }

   
    @Test
    @Transactional
    void shouldFindPublicGames() {
        List<Game> publicGames = (List<Game>) this.gameService.findAllPublicGames();
        assertTrue(publicGames.stream().allMatch(g -> !g.isPrivate()));
        assertTrue(publicGames.size() >= 2);
    }

    @Test
    @Transactional
    void shouldFindPrivateGames() {
        List<Game> privateGames = (List<Game>) this.gameService.findAllPrivateGames();
        assertTrue(privateGames.stream().allMatch(Game::isPrivate) || privateGames.isEmpty());
    }

   
    @Test
    @Transactional
    void shouldFindGamesByActivePlayerId() {
        Integer activePlayerId = 4; // existe en data.sql es el Carlosbox2k
        List<Game> games = (List<Game>) this.gameService.findAllByActivePlayerId(activePlayerId);
        assertNotNull(games);
    }
}