package es.us.dp1.l4_04_24_25.saboteur.achievement;

import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when; // Necesario si usas Mockito

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.achievements.AchievementService;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService; 
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Achievements Module")
@Feature("Achievements Management")
@Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
class AchievementServiceTests {

    @Autowired
    private AchievementService achievementService;
    
    @Autowired
    private UserService userService; 


    private static final String TEST_TITTLE_EXISTS = "El Maestro Picador";
    private static final String TEST_TITTLE_NEW = "Logro De Prueba Nuevo";
    private static final int TEST_ACHIEVEMENT_ID = 200; 

    

    @Test
    @Transactional
    void shouldFindAllAchievements() {
        
        List<Achievement> achievements = (List<Achievement>) this.achievementService.findAll();
        
        assertTrue(achievements.size() >= 5); 
    }

    @Test
    void shouldFindAchievementById() {
        Achievement achievement = this.achievementService.findAchievement(TEST_ACHIEVEMENT_ID);
        assertEquals(TEST_ACHIEVEMENT_ID, achievement.getId());
    }

    @Test
    void shouldThrowExceptionWhenFindingNonExistingAchievement() {
        assertThrows(ResourceNotFoundException.class, () -> this.achievementService.findAchievement(99999));
    }
    
    @Test
    @Transactional
    void shouldInsertAchievement() {
        int initialCount = ((Collection<Achievement>) this.achievementService.findAll()).size();
        
        User creator = userService.findUser(1); 
        
        Achievement newAchievement = new Achievement();
        newAchievement.setTittle("Logro Test Insert");
        newAchievement.setDescription("Descripción de prueba.");
        newAchievement.setScore(10);
        newAchievement.setCreator(creator); 

        Achievement savedAchievement = this.achievementService.saveAchievement(newAchievement);
        
        assertNotNull(savedAchievement.getId());
        assertEquals("Logro Test Insert", savedAchievement.getTittle());
        
        int finalCount = ((Collection<Achievement>) this.achievementService.findAll()).size();
        assertEquals(initialCount + 1, finalCount);
    }
    
    @Test
    @Transactional
    void shouldUpdateAchievement() {
        String newDescription = "Esta descripción ha sido actualizada.";
        
        Achievement achievement = this.achievementService.findAchievement(TEST_ACHIEVEMENT_ID);
        achievement.setDescription(newDescription);

        Achievement updatedAchievement = this.achievementService.updateAchievement(achievement, TEST_ACHIEVEMENT_ID);
        
        assertEquals(newDescription, updatedAchievement.getDescription());
    }
    
    @Test
    @Transactional
    void shouldDeleteAchievement() {
        
        Achievement achievement = this.achievementService.findAchievement(TEST_ACHIEVEMENT_ID);
        assertNotNull(achievement);

        this.achievementService.deleteAchievement(TEST_ACHIEVEMENT_ID);
        
        assertThrows(ResourceNotFoundException.class, () -> this.achievementService.findAchievement(TEST_ACHIEVEMENT_ID));
    }

    
    @Test
    void shouldExistAchievementByTittle() {
        assertTrue(this.achievementService.existsByTittle(TEST_TITTLE_EXISTS));
    }
    
    @Test
    void shouldNotExisstAchievementByTittle() {
        assertEquals(false, this.achievementService.existsByTittle(TEST_TITTLE_NEW));
    }
    
    @Test
    @Transactional
    void shouldFindByTittle() {
        Achievement achievement = this.achievementService.findByTittle("fran?"); // Título de tu data.sql (ID 201)
        assertEquals(201, achievement.getId());
    }

    @Test
    void shouldThrowExceptionWhenFindByTittle() {
        assertThrows(ResourceNotFoundException.class, () -> this.achievementService.findByTittle("Titulo No Existe"));
    }


    // Ojo cuidaoo Los tests para findAchievementsByPlayerId y countAchievementsByPlayerId requieren que la tabla de unión esté poblada
    /*
    @Test
    void shouldCountAchievementsByPlayerId() {
        // Player ID 4 (Carlosbox2k)
        Integer count = this.achievementService.countAchievementsByPlayerId(4); 
        assertTrue(count >= 0); 
    }
    */
}