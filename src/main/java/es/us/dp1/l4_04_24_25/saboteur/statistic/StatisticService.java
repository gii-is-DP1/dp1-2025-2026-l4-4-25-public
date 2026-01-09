package es.us.dp1.l4_04_24_25.saboteur.statistic;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerService;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import lombok.NoArgsConstructor;

@Service
@NoArgsConstructor
public class StatisticService {

    private PlayerService playerService;
    private ActivePlayerService activePlayerService;
    private GameService gameService;

    @Autowired
    public StatisticService(PlayerService playerService, ActivePlayerService activePlayerService,
            GameService gameService) {
        this.playerService = playerService;
        this.activePlayerService = activePlayerService;
        this.gameService = gameService;
    }

    public Integer getTotalMatches(User currentUser) {
        return ((List<Game>) gameService.findAllByActivePlayerId(currentUser.getId())).size();
    }

    public Double getAverageGameDuration(User currentUser) {
        List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(currentUser.getId());
        if (games.isEmpty()) {
            return 0.0;
        }
        Double totalDuration = 0.0;
        for (Game game : games) {
            totalDuration += game.getTime().toMinutes();
        }
        return totalDuration / games.size();
    }
    

    public Integer getMaxGameDuration(User currentUser) {
        List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(currentUser.getId());
        Integer maxDuration = 0;
        for (Game game : games) {
            Integer gameDuration = (int) game.getTime().toMinutes();
            if (gameDuration > maxDuration) {
                maxDuration = gameDuration;
            }
        }
        return maxDuration;
    }


    public Integer getMinGameDuration(User currentUser) {
        List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(currentUser.getId());
        if (games.isEmpty()) {
            return 0;
        }
        Integer minDuration = Integer.MAX_VALUE;
        for (Game game : games) {
            Integer gameDuration = (int) game.getTime().toMinutes();
            if (gameDuration < minDuration) {
                minDuration = gameDuration;
            }
        }
        return minDuration;
    }

    public Double getGlobalAverageGameDuration(){
        List<Game> games = (List<Game>) gameService.findAll();
        if (games.isEmpty()) {
            return 0.0;
        }
        Double totalDuration = 0.0;
        for (Game game : games) {
            totalDuration += game.getTime().toMinutes();
        }
        return totalDuration / games.size();
    }

    public Integer getGlobalMaxGameDuration(){
        List<Game> games = (List<Game>) gameService.findAll();
        Integer maxDuration = 0;
        for (Game game : games) {
            Integer gameDuration = (int) game.getTime().toMinutes();
            if (gameDuration > maxDuration) {
                maxDuration = gameDuration;
            }
        }
        return maxDuration;
    }

    public Integer getGlobalMinGameDuration(){
        List<Game> games = (List<Game>) gameService.findAll();
        if (games.isEmpty()) {
            return 0;
        }
        Integer minDuration = Integer.MAX_VALUE;
        for (Game game : games) {
            Integer gameDuration = (int) game.getTime().toMinutes();
            if (gameDuration < minDuration) {
                minDuration = gameDuration;
            }
        }
        return minDuration;
    }

    public Double getAveragePlayersPerGame(User currentUser) {
        List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(currentUser.getId());
        if (games.isEmpty()) {
            return 0.0;
        }
        Double totalPlayers = 0.0;
        for (Game game : games) {
            totalPlayers += game.getActivePlayers().size();
        }
        return totalPlayers / games.size();
    }

    public Integer getMaxPlayersPerGame(User currentUser) {
        List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(currentUser.getId());
        Integer maxPlayers = 0;
        for (Game game : games) {
            Integer numPlayers = game.getActivePlayers().size();
            if (numPlayers > maxPlayers) {
                maxPlayers = numPlayers;
            }
        }
        return maxPlayers;
    }

    public Integer getMinPlayersPerGame(User currentUser) {
        List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(currentUser.getId());
        if (games.isEmpty()) {
            return 0;
        }
        Integer minPlayers = Integer.MAX_VALUE;
        for (Game game : games) {
            Integer numPlayers = game.getActivePlayers().size();
            if (numPlayers < minPlayers) {
                minPlayers = numPlayers;
            }
        }
        return minPlayers;
    }

    public Integer getMaxGlobalPlayersPerGame() {
        List<Game> games = (List<Game>) gameService.findAll();
        Integer maxPlayers = 0;
        for (Game game : games) {
            Integer numPlayers = game.getActivePlayers().size();
            if (numPlayers > maxPlayers) {
                maxPlayers = numPlayers;
            }
        }
        return maxPlayers;
    }

    public Integer getMinGlobalPlayersPerGame() {
        List<Game> games = (List<Game>) gameService.findAll();
        if (games.isEmpty()) {
            return 0;
        }
        Integer minPlayers = Integer.MAX_VALUE;
        for (Game game : games) {
            Integer numPlayers = game.getActivePlayers().size();
            if (numPlayers < minPlayers) {
                minPlayers = numPlayers;
            }
        }
        return minPlayers;
    }

    public Double getAverageGlobalPlayersPerGame() {
        List<Game> games = (List<Game>) gameService.findAll();
        if (games.isEmpty()) {
            return 0.0;
        }
        Double totalPlayers = 0.0;
        for (Game game : games) {
            totalPlayers += game.getActivePlayers().size();
        }
        return totalPlayers / games.size();
    }

    public Double getAverageGoldNuggets(User currentUser) {
        Player player = playerService.findPlayer(currentUser.getId());
        return player.getAcquiredGoldNuggets()/player.getPlayedGames().doubleValue();
    }

    public Double getWinPercentage(User currentUser) {
        Player player = playerService.findPlayer(currentUser.getId());
        if (player.getPlayedGames() == 0) {
            return 0.0;
        }
        return (player.getWonGames() / player.getPlayedGames().doubleValue()) * 100;
    }

    public Double getAverageTurnsPerGame(User currentUser) {
        List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(currentUser.getId());
        if (games.isEmpty()) {
            return 0.0;
        }
        Double sum = 0.0;
        Integer count = 0;
       for (Game game : games) {
           List<Round> rounds = game.getRounds();
              for (Round round : rounds) {
                sum+= round.getTurn();
                count++;
              }
       }
         return sum / count;
    }

    public long getTotalWins(User currentUser) {
        Player player = playerService.findPlayer(currentUser.getId());
        return player.getWonGames();
    }

    public int getCurrentWinStreak(User currentUser) {
        Player player = playerService.findPlayer(currentUser.getId());
        List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(currentUser.getId());
        games.sort((g1,g2) -> g2.getId().compareTo(g1.getId()));
        return calculateWinStreak(games, player);

        
    }

    private int calculateWinStreak(List<Game> games, Player player) {
        int streak=0;
        for (Game game: games){
            if (game.getWinner().getUsername().equals(player.getUsername())){
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    public Game getLastWonGame(User currentUser) {
        Player player = playerService.findPlayer(currentUser.getId());
        List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(currentUser.getId());
        games.sort((g1,g2) -> g2.getId().compareTo(g1.getId()));
        for (Game game: games){
            if (game.getWinner().getUsername().equals(player.getUsername())){
                return game;
            }
        }
        return null;
    }

    public Integer getGoldNuggetsLastGame (User currentUser) {
        return activePlayerService.findActivePlayer(currentUser.getId()).getAcquiredGoldNuggets();
    }





    
    
}
