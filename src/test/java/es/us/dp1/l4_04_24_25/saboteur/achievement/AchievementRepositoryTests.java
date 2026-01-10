package es.us.dp1.l4_04_24_25.saboteur.achievement;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.achievements.AchievementRepository;
import es.us.dp1.l4_04_24_25.saboteur.achievements.Metric;
import es.us.dp1.l4_04_24_25.saboteur.user.User;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class AchievementRepositoryTests {

    @Autowired
    AchievementRepository achievementRepository;

    private static final int TEST_ACHIEVEMENT_ID = 200;
    private static final int TEST_NON_EXISTENT_ACHIEVEMENT_ID = 999;
    private static final String TEST_TITTLE_EXISTS = "Beginner Miner"; // Updated from data.sql
    private static final String TEST_TITTLE_NON_EXISTS = "Título Que No Existe";
    private static final int TEST_ADMIN_ID = 1;
    private static final int TEST_PLAYER_ID_WITH_ACHIEVEMENTS = 6; // player1

    // Crea un logro "válido" para los tests
    private Achievement createNewAchievement(String tittle) {
        Achievement achievement = new Achievement();
        achievement.setTittle(tittle);
        achievement.setDescription("Descripción de prueba para " + tittle);
        achievement.setBadgeImage("image.png");
        achievement.setThreshold(10);
        achievement.setMetric(Metric.GAMES_PLAYED);

        User creator = new User();
        creator.setId(TEST_ADMIN_ID);
        achievement.setCreator(creator);

        return achievement;
    }

    @Test
    void shouldFindAchievementById() {
        Optional<Achievement> achievementOptional = achievementRepository.findById(TEST_ACHIEVEMENT_ID);
        assertThat(achievementOptional).isPresent();
        assertThat(achievementOptional.get().getId()).isEqualTo(TEST_ACHIEVEMENT_ID);
    }

    @Test
    void shouldNotFindAchievementByNonExistentId() {
        Optional<Achievement> achievementOptional = achievementRepository.findById(TEST_NON_EXISTENT_ACHIEVEMENT_ID);
        assertThat(achievementOptional).isEmpty();
    }

    @Test
    void shouldFindAllAchievements() {
        Iterable<Achievement> achievements = achievementRepository.findAll();
        assertThat(achievements).hasSizeGreaterThanOrEqualTo(5);
    }

    @Test
    @Transactional
    void shouldInsertAchievement() {
        Achievement newAchievement = createNewAchievement("Nuevo Logro de Repo");
        long initialCount = achievementRepository.count();

        Achievement savedAchievement = achievementRepository.save(newAchievement);

        try {
            achievementRepository.getClass().getMethod("flush").invoke(achievementRepository);
        } catch (Exception ignored) {
        }

        assertNotNull(savedAchievement.getId());
        assertEquals(initialCount + 1, achievementRepository.count());
    }

    @Test
    @Transactional
    void shouldUpdateAchievement() {
        Optional<Achievement> achievementOptional = achievementRepository.findById(TEST_ACHIEVEMENT_ID);
        assertThat(achievementOptional).isPresent();

        Achievement achievement = achievementOptional.get();
        String newDescription = "Nueva descripción de prueba.";
        achievement.setDescription(newDescription);

        Achievement updatedAchievement = achievementRepository.save(achievement);
        try {
            achievementRepository.getClass().getMethod("flush").invoke(achievementRepository);
        } catch (Exception ignored) {
        }

        assertEquals(newDescription, updatedAchievement.getDescription());
        assertThat(achievementRepository.findById(TEST_ACHIEVEMENT_ID)).isPresent();
        assertThat(achievementRepository.findById(TEST_ACHIEVEMENT_ID).get().getDescription())
                .isEqualTo(newDescription);
    }

    @Test
    @Transactional
    void shouldDeleteAchievement() {
        Optional<Achievement> achievementOptional = achievementRepository.findById(TEST_ACHIEVEMENT_ID);
        assertThat(achievementOptional).isPresent();

        achievementRepository.deleteById(TEST_ACHIEVEMENT_ID);
        try {
            achievementRepository.getClass().getMethod("flush").invoke(achievementRepository);
        } catch (Exception ignored) {
        }

        assertThat(achievementRepository.findById(TEST_ACHIEVEMENT_ID)).isEmpty();
    }

    @Test
    void shouldFindByTittle() {
        Optional<Achievement> achievementOptional = achievementRepository.findByTittle(TEST_TITTLE_EXISTS);
        assertThat(achievementOptional).isPresent();
        assertThat(achievementOptional.get().getTittle()).isEqualTo(TEST_TITTLE_EXISTS);
    }

    @Test
    void shouldNotFindByTittle() {
        Optional<Achievement> achievementOptional = achievementRepository.findByTittle(TEST_TITTLE_NON_EXISTS);
        assertThat(achievementOptional).isEmpty();
    }

    @Test
    void shouldExistByTittle() {
        assertTrue(achievementRepository.existsByTittle(TEST_TITTLE_EXISTS));
    }

    @Test
    void shouldNotExistByTittle() {
        assertFalse(achievementRepository.existsByTittle(TEST_TITTLE_NON_EXISTS));
    }

    @Test
    void shouldFindAchievementsByCreatorId() {
        List<Achievement> achievements = achievementRepository.findAchievementsByCreatorId(TEST_ADMIN_ID);
        assertThat(achievements).isNotEmpty();
        assertThat(achievements).allMatch(a -> a.getCreator().getId().equals(TEST_ADMIN_ID));
    }

    @Test
    void shouldCountAchievementsByPlayerId() {
        Integer count = achievementRepository.countAchievementsByPlayerId(TEST_PLAYER_ID_WITH_ACHIEVEMENTS);
        assertThat(count).isGreaterThanOrEqualTo(0);
    }
}
