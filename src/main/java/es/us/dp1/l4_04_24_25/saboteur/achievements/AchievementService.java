package es.us.dp1.l4_04_24_25.saboteur.achievements;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.EventListener;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerRepository;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameFinishedEvent;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;
import jakarta.validation.Valid;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserService userService;
    private final ActivePlayerRepository activePlayerRepository;

    @Autowired
    public AchievementService(AchievementRepository achievementRepository, UserService userService, ActivePlayerRepository activePlayerRepository) {
        this.achievementRepository = achievementRepository;
        this.userService = userService;
        this.activePlayerRepository = activePlayerRepository;
    }

      
    


    @Transactional
    public Achievement saveAchievement(Achievement achievement) throws DataAccessException {
        achievementRepository.save(achievement);
        return achievement;
    }

    public boolean existsByTittle (String tittle){
        return achievementRepository.existsByTittle(tittle);
    }
    
    @Transactional(readOnly = true)
    public Achievement findAchievement(Integer id) {
        return achievementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement", "id", id));
    }

    @Transactional(readOnly = true)
    public Iterable<Achievement> findAll() {
        return achievementRepository.findAll();
    }

    @Transactional
    public Achievement updateAchievement(@Valid Achievement achievement, Integer idToUpdate) {
        Achievement toUpdate = findAchievement(idToUpdate);
        BeanUtils.copyProperties(achievement, toUpdate, "id");
        achievementRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deleteAchievement(Integer id) {
        Achievement toDelete = findAchievement(id);
        
        // Eliminar las relaciones con los jugadores que tienen este logro
        for (Player player : toDelete.getPlayers()) {
            player.getAccquiredAchievements().remove(toDelete);
        }
        toDelete.getPlayers().clear();
        
        achievementRepository.delete(toDelete);
    }


    @Transactional(readOnly = true)
    public Achievement findByTittle (String tittle){
        return achievementRepository.findByTittle(tittle)
                .orElseThrow(() -> new ResourceNotFoundException("Achievement", "tittle", tittle));
    }

    @Transactional(readOnly = true)
    public Achievement patch(Integer id, Map<String, Object> updates) {
        Achievement achievement = findAchievement(id);
        if (updates.containsKey("creator")){
            Integer userId = (Integer) updates.get("creator");
            User user = userService.findUser(userId); 
            achievement.setCreator(user);
        }
        return achievementRepository.save(achievement);
    }

    
    @EventListener
    public void onGameFinished(GameFinishedEvent event) {
        Game finishedGame = event.getGame();
        
        for (ActivePlayer ActivePlayer : finishedGame.getActivePlayers()) {

           
            checkAndUnlockAchievements(ActivePlayer);
            
        }
    }

    @Transactional
    public void checkAndUnlockAchievements(ActivePlayer activePlayer) {
        List<Achievement> allAchievements = new ArrayList<>();
        achievementRepository.findAll().forEach(allAchievements::add);

        for (Achievement achievement : allAchievements){
            boolean AlreadyUnlocked = activePlayer.getAccquiredAchievements().contains(achievement);
            if(!AlreadyUnlocked){
                boolean unlocked = isAchievementUnlocked(achievement, activePlayer);
                if(unlocked){
                    activePlayer.getAccquiredAchievements().add(achievement);
                    
                }
            }
        }
        activePlayerRepository.save(activePlayer);
    }

    public boolean isAchievementUnlocked(Achievement achievement, ActivePlayer player) {
        Metric metric = achievement.getMetric();
        Integer threshold = achievement.getThreshold();

        switch (metric) {
            case GAMES_PLAYED:
                return player.getPlayedGames() >= threshold;
            case VICTORIES:
                return player.getWonGames() >= threshold;
            case BUILDED_PATHS:
                return player.getBuiltPaths() >= threshold;
            case DESTROYED_PATHS:
                return player.getDestroyedPaths() >= threshold;
            case GOLD_NUGGETS:
                return player.getAcquiredGoldNuggets() >= threshold;
            case TOOLS_DAMAGED:
                return player.getPeopleDamaged() >= threshold;
            case TOOLS_REPAIRED:
                return player.getPeopleRepaired() >= threshold;
            default:
                return false;
        }
    }
        
}