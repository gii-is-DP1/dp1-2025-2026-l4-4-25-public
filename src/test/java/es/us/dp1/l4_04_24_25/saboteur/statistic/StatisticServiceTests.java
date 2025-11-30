package es.us.dp1.l4_04_24_25.saboteur.statistic;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerService;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.statistic.StatisticService;

@ExtendWith(MockitoExtension.class)
class StatisticServiceTests {

    @InjectMocks
    private StatisticService statisticService;

    @Mock
    private PlayerService playerService;

    @Mock
    private ActivePlayerService activePlayerService;

    @Mock
    private GameService gameService;

    private User currentUser;
    private Player player;
    private ActivePlayer activePlayer;

    @BeforeEach
    void setup() {
        currentUser = new User();
        currentUser.setId(1);
        currentUser.setUsername("testUser");

        player = new Player();
        player.setId(1);
        player.setUsername("testUser");
        
        activePlayer = new ActivePlayer();
        activePlayer.setId(1);
        activePlayer.setUsername("testUser");
    }


    @Test
    void shouldGetTotalMatches() {
        List<Game> games = List.of(new Game(), new Game());
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(games);

        Integer result = statisticService.getTotalMatches(currentUser);
        assertEquals(2, result);
    }

    @Test
    void shouldGetAverageGameDuration() {
        Game g1 = new Game(); g1.setTime(Duration.ofMinutes(10));
        Game g2 = new Game(); g2.setTime(Duration.ofMinutes(20));
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(List.of(g1, g2));

        Double result = statisticService.getAverageGameDuration(currentUser);
        assertEquals(15.0, result);
    }

    @Test
    void shouldReturnZeroAverageDurationWhenNoGames() {
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(Collections.emptyList());
        assertEquals(0.0, statisticService.getAverageGameDuration(currentUser));
    }

    @Test
    void shouldGetMaxGameDuration() {
        Game g1 = new Game(); g1.setTime(Duration.ofMinutes(10));
        Game g2 = new Game(); g2.setTime(Duration.ofMinutes(50));
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(List.of(g1, g2));

        assertEquals(50, statisticService.getMaxGameDuration(currentUser));
    }

    @Test
    void shouldGetMinGameDuration() {
        Game g1 = new Game(); g1.setTime(Duration.ofMinutes(5));
        Game g2 = new Game(); g2.setTime(Duration.ofMinutes(50));
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(List.of(g1, g2));

        assertEquals(5, statisticService.getMinGameDuration(currentUser));
    }

    @Test
    void shouldReturnZeroMinDurationWhenNoGames() {
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(Collections.emptyList());
        assertEquals(0, statisticService.getMinGameDuration(currentUser));
    }


    @Test
    void shouldGetGlobalAverageGameDuration() {
        Game g1 = new Game(); g1.setTime(Duration.ofMinutes(10));
        when(gameService.findAll()).thenReturn(List.of(g1));
        assertEquals(10.0, statisticService.getGlobalAverageGameDuration());
    }

    @Test
    void shouldReturnZeroGlobalAverageWhenNoGames() {
        when(gameService.findAll()).thenReturn(Collections.emptyList());
        assertEquals(0.0, statisticService.getGlobalAverageGameDuration());
    }

    @Test
    void shouldGetGlobalMaxMinGameDuration() {
        Game g1 = new Game(); g1.setTime(Duration.ofMinutes(100));
        Game g2 = new Game(); g2.setTime(Duration.ofMinutes(10));
        when(gameService.findAll()).thenReturn(List.of(g1, g2));

        assertEquals(100, statisticService.getGlobalMaxGameDuration());
        assertEquals(10, statisticService.getGlobalMinGameDuration());
    }
    
    @Test
    void shouldReturnZeroGlobalMinDurationWhenNoGames() {
        when(gameService.findAll()).thenReturn(Collections.emptyList());
        assertEquals(0, statisticService.getGlobalMinGameDuration());
    }

    @Test
    void shouldGetAveragePlayersPerGame() {
        Game g1 = new Game(); g1.setActivePlayers(List.of(new ActivePlayer(), new ActivePlayer())); // 2
        Game g2 = new Game(); g2.setActivePlayers(List.of(new ActivePlayer(), new ActivePlayer(), new ActivePlayer(), new ActivePlayer())); // 4
        
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(List.of(g1, g2));
        
        assertEquals(3.0, statisticService.getAveragePlayersPerGame(currentUser));
    }
    
    @Test
    void shouldReturnZeroAveragePlayersWhenNoGames() {
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(Collections.emptyList());
        assertEquals(0.0, statisticService.getAveragePlayersPerGame(currentUser));
    }

    @Test
    void shouldGetMaxMinPlayersPerGame() {
        Game g1 = new Game(); g1.setActivePlayers(List.of(new ActivePlayer())); // 1
        Game g2 = new Game(); g2.setActivePlayers(List.of(new ActivePlayer(), new ActivePlayer(), new ActivePlayer())); // 3
        
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(List.of(g1, g2));
        
        assertEquals(3, statisticService.getMaxPlayersPerGame(currentUser));
        assertEquals(1, statisticService.getMinPlayersPerGame(currentUser));
    }

    @Test
    void shouldReturnZeroMinPlayersPerGameWhenNoGames() {
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(Collections.emptyList());
        assertEquals(0, statisticService.getMinPlayersPerGame(currentUser));
    }

    
    @Test
    void shouldGetGlobalPlayerStats() {
        Game g1 = new Game(); g1.setActivePlayers(List.of(new ActivePlayer())); // 1
        when(gameService.findAll()).thenReturn(List.of(g1));
        
        assertEquals(1, statisticService.getMaxGlobalPlayersPerGame());
        assertEquals(1, statisticService.getMinGlobalPlayersPerGame());
        assertEquals(1.0, statisticService.getAverageGlobalPlayersPerGame());
    }
    
    @Test
    void shouldReturnZeroGlobalMinPlayersWhenNoGames() {
        when(gameService.findAll()).thenReturn(Collections.emptyList());
        assertEquals(0, statisticService.getMinGlobalPlayersPerGame());
    }
    
    @Test
    void shouldReturnZeroGlobalAveragePlayersWhenNoGames() {
        when(gameService.findAll()).thenReturn(Collections.emptyList());
        assertEquals(0.0, statisticService.getAverageGlobalPlayersPerGame());
    }

    @Test
    void shouldGetAverageGoldNuggets() {
        player.setPlayedGames(5);
        player.setAcquiredGoldNuggets(20);
        when(playerService.findPlayer(currentUser.getId())).thenReturn(player);
       
        assertEquals(4.0, statisticService.getAverageGoldNuggets(currentUser));
    }

    @Test
    void shouldGetWinPercentage() {
        player.setPlayedGames(10);
        player.setWonGames(5);
        when(playerService.findPlayer(currentUser.getId())).thenReturn(player);
     
        assertEquals(50.0, statisticService.getWinPercentage(currentUser));
    }

    @Test
    void shouldReturnZeroWinPercentageIfNoGamesPlayed() {
        player.setPlayedGames(0);
        when(playerService.findPlayer(currentUser.getId())).thenReturn(player);
        
        assertEquals(0.0, statisticService.getWinPercentage(currentUser));
    }
    
    @Test
    void shouldGetTotalWins() {
        player.setWonGames(7);
        when(playerService.findPlayer(currentUser.getId())).thenReturn(player);
        assertEquals(7L, statisticService.getTotalWins(currentUser));
    }
    
    @Test
    void shouldGetGoldNuggetsLastGame() {
        activePlayer.setAcquiredGoldNuggets(8);
        when(activePlayerService.findActivePlayer(currentUser.getId())).thenReturn(activePlayer);
        assertEquals(8, statisticService.getGoldNuggetsLastGame(currentUser));
    }

    @Test
    void shouldGetAverageTurnsPerGame() {
        Game g1 = new Game();
        Round r1 = new Round(); r1.setTurn(2);
        Round r2 = new Round(); r2.setTurn(4);
        g1.setRounds(List.of(r1, r2)); 
        
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(List.of(g1));
        
        
        assertEquals(3.0, statisticService.getAverageTurnsPerGame(currentUser));
    }
    
    @Test
    void shouldReturnZeroAverageTurnsIfNoGames() {
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(Collections.emptyList());
        assertEquals(0.0, statisticService.getAverageTurnsPerGame(currentUser));
    }


    @Test
    void shouldGetCurrentWinStreak() {
        
        List<Game> games = new ArrayList<>();
        
        ActivePlayer me = new ActivePlayer(); me.setUsername("testUser");
        ActivePlayer other = new ActivePlayer(); other.setUsername("other");
      
        Game g3 = new Game(); g3.setId(3); g3.setWinner(me);    
        Game g2 = new Game(); g2.setId(2); g2.setWinner(me);   
        Game g1 = new Game(); g1.setId(1); g1.setWinner(other); 
        
        games.add(g1);
        games.add(g2);
        games.add(g3);
        
        when(playerService.findPlayer(currentUser.getId())).thenReturn(player);
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(games);
        
        assertEquals(2, statisticService.getCurrentWinStreak(currentUser));
    }
    
    @Test
    void shouldGetLastWonGame() {
        List<Game> games = new ArrayList<>();
        
        ActivePlayer me = new ActivePlayer(); me.setUsername("testUser");
        ActivePlayer other = new ActivePlayer(); other.setUsername("other");
        
        Game g3 = new Game(); g3.setId(3); g3.setWinner(other); 
        Game g2 = new Game(); g2.setId(2); g2.setWinner(me);
        
        games.add(g2);
        games.add(g3);
        
        when(playerService.findPlayer(currentUser.getId())).thenReturn(player);
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(games);
        
        Game result = statisticService.getLastWonGame(currentUser);
        
        assertNotNull(result);
        assertEquals(2, result.getId());
    }
    
    @Test
    void shouldReturnNullLastWonGameIfNeverWon() {
        List<Game> games = new ArrayList<>();
        ActivePlayer other = new ActivePlayer(); other.setUsername("other");
        Game g1 = new Game(); g1.setId(1); g1.setWinner(other); 
        games.add(g1);
        
        when(playerService.findPlayer(currentUser.getId())).thenReturn(player);
        when(gameService.findAllByActivePlayerId(currentUser.getId())).thenReturn(games);
        
        assertNull(statisticService.getLastWonGame(currentUser));
    }
}