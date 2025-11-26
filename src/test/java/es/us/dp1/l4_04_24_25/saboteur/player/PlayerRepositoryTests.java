package es.us.dp1.l4_04_24_25.saboteur.player;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.user.Authorities;
import es.us.dp1.l4_04_24_25.saboteur.user.AuthoritiesRepository;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class PlayerRepositoryTests {

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private AuthoritiesRepository authoritiesRepository;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    private static final int TEST_PLAYER_ID = 4; // es el Carlosbox2k
    private static final int TEST_NON_EXISTENT_PLAYER_ID = 9999;
    private static final String TEST_USERNAME_EXISTS = "Carlosbox2k";
    private static final String TEST_USERNAME_NON_EXISTS = "NoExisteUser";

    
    private Player createNewPlayer(String username) {
        Player player = new Player();
        player.setUsername(username);
        player.setName("Test Player");
        player.setEmail(username + "@test.com");
        player.setBirthDate("2000-01-01");
        player.setPassword("password123");
        player.setImage("https://example.com/img/default.png");

        
        Authorities playerAuthority = authoritiesRepository.findByName("PLAYER")
                .orElseGet(() -> {
                    Authorities newAuth = new Authorities();
                    newAuth.setAuthority("PLAYER");
                    return authoritiesRepository.save(newAuth);
                });
        player.setAuthority(playerAuthority);

        player.setPlayedGames(0);
        player.setWonGames(0);
        player.setDestroyedPaths(0);
        player.setBuiltPaths(0);
        player.setAcquiredGoldNuggets(0);
        player.setPeopleDamaged(0);
        player.setPeopleRepaired(0);
        player.setWatcher(false);

        return player;
    }

    @Test
    void shouldFindPlayerById() {
        Optional<Player> playerOpt = playerRepository.findById(TEST_PLAYER_ID);
        assertThat(playerOpt).isPresent();
        assertThat(playerOpt.get().getUsername()).isEqualTo(TEST_USERNAME_EXISTS);
    }

    @Test
    void shouldNotFindNonExistentPlayerById() {
        Optional<Player> playerOpt = playerRepository.findById(TEST_NON_EXISTENT_PLAYER_ID);
        assertThat(playerOpt).isEmpty();
    }

    @Test
    void shouldFindAllPlayers() {
        Iterable<Player> players = playerRepository.findAll();
        assertThat(players).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    void shouldFindByUsername() {
        Optional<Player> playerOpt = playerRepository.findByUsername(TEST_USERNAME_EXISTS);
        assertThat(playerOpt).isPresent();
        assertThat(playerOpt.get().getId()).isEqualTo(TEST_PLAYER_ID);
    }

    @Test
    void shouldNotFindByUsernameWhenNotExists() {
        Optional<Player> playerOpt = playerRepository.findByUsername(TEST_USERNAME_NON_EXISTS);
        assertThat(playerOpt).isEmpty();
    }

    @Test
    @Transactional
    void shouldInsertNewPlayer() {
        long initialCount = playerRepository.count();
        Player newPlayer = createNewPlayer("NuevoPlayerPrueba");

        Player savedPlayer = playerRepository.saveAndFlush(newPlayer);

        assertNotNull(savedPlayer.getId());
        assertEquals(initialCount + 1, playerRepository.count());
        assertEquals("NuevoPlayerPrueba", savedPlayer.getUsername());
        assertEquals("PLAYER", savedPlayer.getAuthority().getAuthority());
    }

    @Test
    @Transactional
    void shouldUpdatePlayer() {
        Optional<Player> playerOpt = playerRepository.findById(TEST_PLAYER_ID);
        assertThat(playerOpt).isPresent();

        Player player = playerOpt.get();
        int oldGold = player.getAcquiredGoldNuggets() != null ? player.getAcquiredGoldNuggets() : 0;
        int newGold = oldGold + 10;
        player.setAcquiredGoldNuggets(newGold);

        Player updatedPlayer = playerRepository.saveAndFlush(player);

        assertEquals(newGold, updatedPlayer.getAcquiredGoldNuggets());
    }

    @Test
    @Transactional
    void shouldDeletePlayer() {
        Player player = createNewPlayer("PlayerToDelete");
        Player savedPlayer = playerRepository.saveAndFlush(player);
        Integer id = savedPlayer.getId();

        playerRepository.deleteById(id);
        playerRepository.flush();

        assertThat(playerRepository.findById(id)).isEmpty();
    }

    @Test
    void shouldFindExistingUsernameUsingFindByUsername() {
        boolean exists = playerRepository.findByUsername(TEST_USERNAME_EXISTS).isPresent();
        assertTrue(exists);
    }

    @Test
    void shouldNotFindNonExistingUsernameUsingFindByUsername() {
        boolean exists = playerRepository.findByUsername(TEST_USERNAME_NON_EXISTS).isPresent();
        assertFalse(exists);
    }


    @Test
    @Transactional
    void shouldFindAllByGameId() {
        
        entityManager.createNativeQuery("UPDATE player SET game_id = 1 WHERE id = " + TEST_PLAYER_ID)
                     .executeUpdate();
        
        Iterable<Player> players = playerRepository.findAllByGameId(1);
        
        assertThat(players).isNotEmpty();
        assertThat(players.iterator().next().getUsername()).isEqualTo(TEST_USERNAME_EXISTS);
    }

    @Test
    @Transactional
    void shouldFindByGameIdAndUsername() {
        
        entityManager.createNativeQuery("UPDATE player SET game_id = 1 WHERE id = " + TEST_PLAYER_ID)
                     .executeUpdate();

        Optional<Player> player = playerRepository.findByGameIdAndUsername(1, TEST_USERNAME_EXISTS);
        
        assertThat(player).isPresent();
        assertThat(player.get().getUsername()).isEqualTo(TEST_USERNAME_EXISTS);
    }

    @Test
    void shouldNotFindByGameIdAndUsernameIfWrongGame() {
        Optional<Player> player = playerRepository.findByGameIdAndUsername(999, "Carlosbox2k");
        assertThat(player).isEmpty();
    }
}
