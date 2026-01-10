package es.us.dp1.l4_04_24_25.saboteur.game;

import static org.junit.jupiter.api.Assertions.*;
import static org.junit.Assert.assertNotNull;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.time.Duration;


import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
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
    private static final String TEST_CREATOR_USERNAME = "Carlosbox2k";

    
    @Test
    @Transactional
    void shouldFindAllGames() {
        List<Game> games = (List<Game>) this.gameService.findAll();
        assertFalse(games.isEmpty());
        assertTrue(games.size() >= 2); 
    }

    
    @Test
    void shouldFindGameById() {
        Game game = this.gameService.findGame(TEST_GAME_ID);
        assertEquals(TEST_GAME_ID, game.getId());
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
        newGame.setPrivate(false);
        newGame.setMaxPlayers(5);
        newGame.setGameStatus(gameStatus.CREATED);

        Game savedGame = this.gameService.saveGame(newGame);

        assertNotNull(savedGame.getId());
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
        Integer activePlayerId = 4; 
        Iterable<Game> games = this.gameService.findAllByActivePlayerId(activePlayerId);
        assertNotNull(games);
    }

    
    @Test
    void shouldCheckCanAddPlayerLogic() {
        
        Game game = new Game();
        game.setMaxPlayers(2);
        game.setActivePlayers(new ArrayList<>());

        assertTrue(game.canAddPlayer());

        game.getActivePlayers().add(new ActivePlayer());
        assertTrue(game.canAddPlayer()); 

        game.getActivePlayers().add(new ActivePlayer());
        assertFalse(game.canAddPlayer()); 
    }

    @Test
    void shouldAddRoundsCorrectly() {
        
        Game game = new Game();
        game.setRounds(new ArrayList<>()); 

        Round r1 = new Round();
        game.agregarRonda(r1);

        assertEquals(1, game.getRounds().size());
        assertEquals(game, r1.getGame()); 
    }

    @Test
    void shouldThrowExceptionWhenAddingTooManyRounds() {
        
        Game game = new Game();
        game.setRounds(new ArrayList<>());

        game.agregarRonda(new Round());
        game.agregarRonda(new Round());
        game.agregarRonda(new Round());
        
        
        Round r4 = new Round();
        
        Exception exception = assertThrows(IllegalStateException.class, () -> {
            game.agregarRonda(r4);
        });

        assertEquals("Una partida no puede tener más de 3 rondas", exception.getMessage());
    }

    @Test
    @Transactional
    void shouldHandleDurationConverter() {
        
        Game newGame = new Game();
        newGame.setPrivate(false);
        newGame.setMaxPlayers(4);
        newGame.setGameStatus(gameStatus.CREATED);
       
        Duration duration = Duration.ofMinutes(5); 
        newGame.setTime(duration);

        Game savedGame = gameService.saveGame(newGame);
        
        Game retrievedGame = gameService.findGame(savedGame.getId());
        
        assertEquals(300, retrievedGame.getTime().getSeconds());
        assertEquals(duration, retrievedGame.getTime());
    }
    
    @Test
    void shouldHandleDurationConverterNulls() {
       
        DurationSecondsConverter converter = new DurationSecondsConverter();
     
        assertNull(converter.convertToDatabaseColumn(null));
     
        assertEquals(60L, converter.convertToDatabaseColumn(Duration.ofMinutes(1)));
     
        assertNull(converter.convertToEntityAttribute(null));
      
        assertEquals(Duration.ofSeconds(60), converter.convertToEntityAttribute(60L));
    }

    
    @Test
    void shouldFailToUpdateNonExistentGame() {
        Game game = new Game();
        game.setMaxPlayers(5);
        assertThrows(ResourceNotFoundException.class, () -> gameService.updateGame(game, 99999));
    }

    @Test
    void shouldFailToDeleteNonExistentGame() {
        
        assertThrows(ResourceNotFoundException.class, () -> gameService.deleteGame(99999));
    }

    @Test
    @Transactional
    void shouldPreserveIdOnUpdate() {
        
        Game original = gameService.findGame(TEST_GAME_ID);
        
        Game updateInfo = new Game();
        updateInfo.setId(9999); 
        updateInfo.setMaxPlayers(10);

        Game updated = gameService.updateGame(updateInfo, TEST_GAME_ID);

        assertEquals(TEST_GAME_ID, updated.getId());
        assertEquals(10, updated.getMaxPlayers());
    }

    @Test
    void shouldCoverGameStatusEnumValues() {
        
        for (gameStatus status : gameStatus.values()) {
            assertNotNull(status);
        }
        assertEquals(gameStatus.CREATED, gameStatus.valueOf("CREATED"));
        assertEquals(gameStatus.ONGOING, gameStatus.valueOf("ONGOING"));
        assertEquals(gameStatus.FINISHED, gameStatus.valueOf("FINISHED"));
    }
}