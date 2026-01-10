package es.us.dp1.l4_04_24_25.saboteur.achievement;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.achievements.AchievementService;
import es.us.dp1.l4_04_24_25.saboteur.achievements.Metric;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
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

    private static final String TEST_TITTLE_EXISTS = "Beginner Miner"; // Updated from data.sql
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
        newAchievement.setTittle(TEST_TITTLE_NEW);
        newAchievement.setDescription("Descripción de prueba.");
        newAchievement.setBadgeImage("prueba");
        newAchievement.setThreshold(10);
        newAchievement.setMetric(Metric.GAMES_PLAYED);
        newAchievement.setCreator(creator);

        Achievement savedAchievement = this.achievementService.saveAchievement(newAchievement);

        assertNotNull(savedAchievement.getId());
        assertEquals(TEST_TITTLE_NEW, savedAchievement.getTittle());

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

        assertThrows(ResourceNotFoundException.class,
                () -> this.achievementService.findAchievement(TEST_ACHIEVEMENT_ID));
    }

    @Test
    void shouldExistAchievementByTittle() {

        assertTrue(this.achievementService.existsByTittle(TEST_TITTLE_EXISTS));
    }

    @Test
    void shouldNotExisstAchievementByTittle() {

        assertFalse(this.achievementService.existsByTittle(TEST_TITTLE_NEW));
    }

    @Test
    @Transactional
    void shouldFindByTittle() {
        Achievement achievement = this.achievementService.findByTittle(TEST_TITTLE_EXISTS);
        assertEquals(200, achievement.getId());
    }

    @Test
    void shouldThrowExceptionWhenFindByTittle() {
        assertThrows(ResourceNotFoundException.class, () -> this.achievementService.findByTittle("Titulo No Existe"));
    }

    @Test
    @Transactional
    void shouldUnlockAchievementByGamesPlayed() {

        ActivePlayer player = new ActivePlayer();
        player.setPlayedGames(10);
        player.setAccquiredAchievements(new ArrayList<>());

        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.GAMES_PLAYED);
        achievement.setThreshold(10);

        boolean unlocked = achievementService.isAchievementUnlocked(achievement, player);
        assertTrue(unlocked);
    }

    @Test
    @Transactional
    void shouldNotUnlockAchievementByGamesPlayedIfThresholdNotMet() {
        ActivePlayer player = new ActivePlayer();
        player.setPlayedGames(5);

        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.GAMES_PLAYED);
        achievement.setThreshold(10);

        boolean unlocked = achievementService.isAchievementUnlocked(achievement, player);
        assertFalse(unlocked);
    }

    @Test
    void shouldUnlockAchievementByVictories() {
        ActivePlayer player = new ActivePlayer();
        player.setWonGames(5);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.VICTORIES);
        achievement.setThreshold(5);
        assertTrue(achievementService.isAchievementUnlocked(achievement, player));
    }

    @Test
    void shouldUnlockAchievementByGoldNuggets() {
        ActivePlayer player = new ActivePlayer();
        player.setAcquiredGoldNuggets(100);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.GOLD_NUGGETS);
        achievement.setThreshold(50);
        assertTrue(achievementService.isAchievementUnlocked(achievement, player));
    }

    @Test
    void shouldUnlockAchievementByToolsDamaged() {
        ActivePlayer player = new ActivePlayer();
        player.setPeopleDamaged(3);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.TOOLS_DAMAGED);
        achievement.setThreshold(1);
        assertTrue(achievementService.isAchievementUnlocked(achievement, player));
    }

    @Test
    void shouldUnlockAchievementByToolsRepaired() {
        ActivePlayer player = new ActivePlayer();
        player.setPeopleRepaired(10);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.TOOLS_REPAIRED);
        achievement.setThreshold(10);
        assertTrue(achievementService.isAchievementUnlocked(achievement, player));
    }

    @Test
    void shouldUnlockAchievementByBuiltPaths() {
        ActivePlayer player = new ActivePlayer();
        player.setBuiltPaths(20);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.BUILT_PATHS);
        achievement.setThreshold(10);
        assertTrue(achievementService.isAchievementUnlocked(achievement, player));
    }

    @Test
    void shouldUnlockAchievementByDestroyedPaths() {
        ActivePlayer player = new ActivePlayer();
        player.setDestroyedPaths(5);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.DESTROYED_PATHS);
        achievement.setThreshold(2);
        assertTrue(achievementService.isAchievementUnlocked(achievement, player));
    }

    @Test
    @Transactional
    void shouldPatchAchievementCreator() {

        Achievement achievement = achievementService.findAchievement(TEST_ACHIEVEMENT_ID);

        Integer newCreatorId = 6; // player1

        Map<String, Object> updates = new HashMap<>();
        updates.put("creator", newCreatorId);

        Achievement patched = achievementService.patch(TEST_ACHIEVEMENT_ID, updates);

        assertNotNull(patched.getCreator());
        assertEquals(newCreatorId, patched.getCreator().getId());
    }

    @Test
    @Transactional
    void shouldNotPatchAchievementIfNoCreatorKey() {
        Achievement original = achievementService.findAchievement(TEST_ACHIEVEMENT_ID);
        Integer originalCreatorId = original.getCreator().getId();

        Map<String, Object> updates = new HashMap<>();
        updates.put("description", "New Desc");

        Achievement patched = achievementService.patch(TEST_ACHIEVEMENT_ID, updates);

        assertEquals(originalCreatorId, patched.getCreator().getId());
    }

    @Test
    void shouldNotUnlockAchievementByVictoriesIfThresholdNotMet() {
        ActivePlayer player = new ActivePlayer();
        player.setWonGames(1);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.VICTORIES);
        achievement.setThreshold(5);
        assertFalse(achievementService.isAchievementUnlocked(achievement, player));
    }

    @Test
    void shouldNotUnlockAchievementByGoldNuggetsIfThresholdNotMet() {
        ActivePlayer player = new ActivePlayer();
        player.setAcquiredGoldNuggets(10);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.GOLD_NUGGETS);
        achievement.setThreshold(50);
        assertFalse(achievementService.isAchievementUnlocked(achievement, player));
    }

    @Test
    void shouldNotUnlockAchievementByToolsDamagedIfThresholdNotMet() {
        ActivePlayer player = new ActivePlayer();
        player.setPeopleDamaged(0);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.TOOLS_DAMAGED);
        achievement.setThreshold(1);
        assertFalse(achievementService.isAchievementUnlocked(achievement, player));
    }

    @Test
    void shouldNotUnlockAchievementByToolsRepairedIfThresholdNotMet() {
        ActivePlayer player = new ActivePlayer();
        player.setPeopleRepaired(2);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.TOOLS_REPAIRED);
        achievement.setThreshold(10);
        assertFalse(achievementService.isAchievementUnlocked(achievement, player));
    }

    @Test
    void shouldNotUnlockAchievementByBuiltPathsIfThresholdNotMet() {
        ActivePlayer player = new ActivePlayer();
        player.setBuiltPaths(5);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.BUILT_PATHS);
        achievement.setThreshold(10);
        assertFalse(achievementService.isAchievementUnlocked(achievement, player));
    }

    @Test
    void shouldNotUnlockAchievementByDestroyedPathsIfThresholdNotMet() {
        ActivePlayer player = new ActivePlayer();
        player.setDestroyedPaths(0);
        Achievement achievement = new Achievement();
        achievement.setMetric(Metric.DESTROYED_PATHS);
        achievement.setThreshold(2);
        assertFalse(achievementService.isAchievementUnlocked(achievement, player));
    }
}