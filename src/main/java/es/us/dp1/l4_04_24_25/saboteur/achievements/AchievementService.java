package es.us.dp1.l4_04_24_25.saboteur.achievements;

import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;
import jakarta.validation.Valid;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;
    private final UserService userService;

    @Autowired
    public AchievementService(AchievementRepository achievementRepository, UserService userService) {
        this.achievementRepository = achievementRepository;
        this.userService = userService;
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
        achievementRepository.delete(toDelete);
    }

    @Transactional
    public Achievement findByTittle (String tittle){
        return achievementRepository.findByTittle(tittle);
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

}