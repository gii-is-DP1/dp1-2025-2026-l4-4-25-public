package es.us.dp1.l4_04_24_25.saboteur.statistic;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;


@RestController
@RequestMapping("/api/v1/statistics")
@SecurityRequirement(name = "bearerAuth")
public class StatisticRestController {

    @Autowired
    private StatisticService statisticService;

    @Autowired
    private UserService userService;

    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null)
			throw new ResourceNotFoundException("Nobody authenticated!");
		else
			return userService.findByUsername(auth.getName());
					
    }

    @GetMapping("/total-matches")
    public Integer getTotalMatches() {
        User currentUser = getCurrentUser();
        return statisticService.getTotalMatches(currentUser);
    }


    @GetMapping("/average-game-duration")
    public Double getAverageGameDuration() {
        User currentUser = getCurrentUser();
        return statisticService.getAverageGameDuration(currentUser);
    }

    @GetMapping("/max-game-duration")
    public Integer getMaxGameDuration() {
        User currentUser = getCurrentUser();
        return statisticService.getMaxGameDuration(currentUser);
    }

    @GetMapping("/min-game-duration")
    public Integer getMinGameDuration() {
        User currentUser = getCurrentUser();
        return statisticService.getMinGameDuration(currentUser);
    }

    @GetMapping("/global-game-duration-average")
    public Double getGlobalGameDurationAverage() {
        return statisticService.getGlobalAverageGameDuration();
    }

    @GetMapping("/global-game-max-duration")
    public Integer getGlobalGameMaxDuration() {
        return statisticService.getGlobalMaxGameDuration();
    }

    @GetMapping("/global-game-min-duration")
    public Integer getGlobalGameMinDuration() {
        return statisticService.getGlobalMinGameDuration();
    }

    @GetMapping("/average-players-per-game")
    public Double getAveragePlayersPerGame() {
        User currentUser = getCurrentUser();
        return statisticService.getAveragePlayersPerGame(currentUser);
    }

    @GetMapping("/game-players-max")
    public Integer getGamePlayersMax() {
        User currentUser = getCurrentUser();
        return statisticService.getMaxPlayersPerGame(currentUser);
    }

    @GetMapping("/game-players-min")
    public Integer getGamePlayersMin() {
        User currentUser = getCurrentUser();
        return statisticService.getMinPlayersPerGame(currentUser);
    }

    @GetMapping("/global-game-players-max")
    public Integer getGlobalGamePlayersMax() {
        return statisticService.getMaxGlobalPlayersPerGame();
    }

    @GetMapping("/global-game-players-min")
    public Integer getGlobalGamePlayersMin() {
        return statisticService.getMinGlobalPlayersPerGame();
    }

    @GetMapping("/global-game-players-average")
    public Double getGlobalGamePlayersAverage() {
        return statisticService.getAverageGlobalPlayersPerGame();
    }

    @GetMapping("/average-gold-nuggets")
    public Double getAverageGoldNuggets() {
        User currentUser = getCurrentUser();
        return statisticService.getAverageGoldNuggets(currentUser);
    }

    @GetMapping("/win-percentage")
    public Double getWinPercentage() {
        User currentUser = getCurrentUser();
        return statisticService.getWinPercentage(currentUser);
    }

    @GetMapping("/average-turns-per-game")
    public Double getAverageTurnsPerGame() {
        User currentUser = getCurrentUser();
        return statisticService.getAverageTurnsPerGame(currentUser);
    }


}
