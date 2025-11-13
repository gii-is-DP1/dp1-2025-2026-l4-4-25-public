package es.us.dp1.l4_04_24_25.saboteur.player;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.AdditionalAnswers.returnsFirstArg;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.beans.BeanUtils;
import org.springframework.dao.DataAccessException;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.achievements.AchievementService;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckService;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageService;
import es.us.dp1.l4_04_24_25.saboteur.user.Authorities;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;
import jakarta.persistence.EntityManager; // es necesario para el mock de delete

@ExtendWith(MockitoExtension.class)
class PlayerServiceTests {

    @InjectMocks
    private PlayerService playerService; // el SUT

    @Mock
    private PlayerRepository playerRepository;
    
    // los mocks de los colaboradores que inyectamos en PlayerService
    @Mock
    private UserService userService;
    
    @Mock
    private GameService gameService;
    
    @Mock
    private AchievementService achievementService;
    
    @Mock
    private DeckService deckService;
    
    @Mock
    private MessageService messageService;
    
    
    @Mock
    private EntityManager entityManager; 
    

   
    private Player testPlayer;
    private Authorities mockAuthority;
    private Game mockGame;
    private Achievement mockAchievement;

    private static final int TEST_PLAYER_ID = 4;
    private static final String TEST_USERNAME = "Carlosbox2k";
    private static final int TEST_GAME_ID = 1;


    @BeforeEach
    void setup() {
        
        mockAuthority = new Authorities();
        mockAuthority.setAuthority("PLAYER");
        
        mockGame = new Game();
        mockGame.setId(TEST_GAME_ID);
        
        mockAchievement = new Achievement();
        mockAchievement.setId(200);

        testPlayer = new Player();
        testPlayer.setId(TEST_PLAYER_ID);
        testPlayer.setUsername(TEST_USERNAME);
        testPlayer.setName("Carlos");
        testPlayer.setEmail("carlos@saboteur.es");
        testPlayer.setAuthority(mockAuthority);
        testPlayer.setPlayedGames(10);
        testPlayer.setGame(mockGame);
        testPlayer.getFriends().add(testPlayer); // Simula un amigo (consigo mismo para el test de lista)
        testPlayer.getAccquiredAchievements().add(mockAchievement); // Simula un logro
    }

    @Test
    void shouldFindPlayerById() {
        
        when(playerRepository.findById(TEST_PLAYER_ID)).thenReturn(Optional.of(testPlayer));

        Player foundPlayer = playerService.findPlayer(TEST_PLAYER_ID);
        
        assertNotNull(foundPlayer);
        assertEquals(TEST_PLAYER_ID, foundPlayer.getId());
    }
    
    @Test
    void shouldFindPlayerDTOById() {
        
        when(playerRepository.findById(TEST_PLAYER_ID)).thenReturn(Optional.of(testPlayer));

        PlayerDTO foundDTO = playerService.findPlayerDTO(TEST_PLAYER_ID);
        
        assertNotNull(foundDTO);
        assertEquals(TEST_USERNAME, foundDTO.getUsername());
        assertEquals(10, foundDTO.getPlayedGames());
        assertTrue(foundDTO.getAccquiredAchievements().size() > 0);
    }
    
    @Test
    void shouldThrowExceptionWhenFindingNonExistingPlayer() {
    
        when(playerRepository.findById(99999)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> playerService.findPlayer(99999));
    }

    @Test
    void shouldInsertNewPlayer() {
    
        when(playerRepository.save(any(Player.class))).thenReturn(testPlayer); 
        
        Player newPlayer = new Player();
        newPlayer.setUsername("NewPlayer");
        newPlayer.setAuthority(mockAuthority);

        Player savedPlayer = playerService.savePlayer(newPlayer);

        verify(playerRepository).save(any(Player.class));
        assertEquals("NewPlayer", savedPlayer.getUsername());
    }

    @Test
    void shouldUpdatePlayerStats() {
        
        final int NEW_PLAYED_GAMES = 100;
        final int NEW_WON_GAMES = 50;

        Player playerUpdateData = new Player();
        BeanUtils.copyProperties(testPlayer, playerUpdateData, "id"); 
        playerUpdateData.setPlayedGames(NEW_PLAYED_GAMES);
        playerUpdateData.setWonGames(NEW_WON_GAMES);
        
        when(playerRepository.findById(TEST_PLAYER_ID)).thenReturn(Optional.of(testPlayer));
        
        when(playerRepository.save(any(Player.class))).thenReturn(testPlayer); 

        PlayerDTO updatedDTO = playerService.updatePlayer(playerUpdateData, TEST_PLAYER_ID);
        
        assertEquals(NEW_PLAYED_GAMES, updatedDTO.getPlayedGames());
        assertEquals(NEW_WON_GAMES, updatedDTO.getWonGames());
        
        assertNotNull(updatedDTO.getAuthority());
        assertNotNull(updatedDTO.getGame());
    }
    
    @Test
    void shouldFindByUsername() {

        when(playerRepository.findByUsername(TEST_USERNAME)).thenReturn(Optional.of(testPlayer));
       
        Player foundPlayer = playerService.findByUsername(TEST_USERNAME);
       
        assertEquals(TEST_PLAYER_ID, foundPlayer.getId());
    }
    
    @Test
    void shouldThrowExceptionWhenUsernameNotFound() {
        
        when(playerRepository.findByUsername(anyString())).thenReturn(Optional.empty());
     
        assertThrows(ResourceNotFoundException.class, () -> playerService.findByUsername("nonexistent"));
    }
    
    @Test
    void shouldFindByGameIdAndUsername() {
       
        when(playerRepository.findByGameIdAndUsername(TEST_GAME_ID, TEST_USERNAME)).thenReturn(Optional.of(testPlayer));
       
        PlayerDTO foundDTO = playerService.findByGameIdAndUsername(TEST_GAME_ID, TEST_USERNAME);
       
        assertEquals(TEST_GAME_ID, foundDTO.getGame().getId());
        assertEquals(TEST_USERNAME, foundDTO.getUsername());
    }
    
    @Test
    void shouldFindAllByGameId() {
        
        when(playerRepository.findAllByGameId(TEST_GAME_ID)).thenReturn(Collections.singletonList(testPlayer));
       
        List<PlayerDTO> players = playerService.findAllByGameId(TEST_GAME_ID);
      
        assertEquals(1, players.size());
        assertEquals(TEST_GAME_ID, players.get(0).getGame().getId());
    }

    @Test
    void shouldPatchPlayerAchievement() {
       
        int NEW_ACHIEVEMENT_ID = 300;
        Achievement newAchievement = new Achievement();
        newAchievement.setId(NEW_ACHIEVEMENT_ID);

        when(playerRepository.findById(TEST_PLAYER_ID)).thenReturn(Optional.of(testPlayer));
        
        when(achievementService.findAchievement(NEW_ACHIEVEMENT_ID)).thenReturn(newAchievement);
       
        when(playerRepository.save(any(Player.class))).thenReturn(testPlayer); 

        Player patchedPlayer = playerService.patchPlayerAchievement(TEST_PLAYER_ID, 
                                        Collections.singletonMap("accquiredAchievements", (Object)NEW_ACHIEVEMENT_ID));
   
        assertEquals(2, patchedPlayer.getAccquiredAchievements().size()); 
        assertTrue(patchedPlayer.getAccquiredAchievements().stream()
                    .anyMatch(a -> a.getId().equals(NEW_ACHIEVEMENT_ID)));
        verify(playerRepository).save(testPlayer);
    }
}