package es.us.dp1.l4_04_24_25.saboteur.achievements;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;

@Service
public class AchievementService {

    private final AchievementRepository achievementRepository;

    @Autowired
    public AchievementService(AchievementRepository achievementRepository) {
        this.achievementRepository = achievementRepository;
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

}