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
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;
import static org.mockito.AdditionalAnswers.returnsFirstArg;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
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
import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckService;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.message.Message;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageService;
import es.us.dp1.l4_04_24_25.saboteur.user.Authorities;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;

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

        org.springframework.test.util.ReflectionTestUtils.setField(playerService, "entityManager", entityManager);
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


    @Test
    void shouldFindAll() {
        
        when(playerRepository.findAll()).thenReturn(List.of(testPlayer));

        List<PlayerDTO> results = playerService.findAll();

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(TEST_USERNAME, results.get(0).getUsername());
    }

    @Test
    void shouldFindByUsernameDTO() {
        
        when(playerRepository.findByUsername(TEST_USERNAME)).thenReturn(Optional.of(testPlayer));

        PlayerDTO result = playerService.findByUsernameDTO(TEST_USERNAME);

        assertNotNull(result);
        assertEquals(TEST_USERNAME, result.getUsername());
    }

    @Test
    void shouldPatchPlayerGame() {
        
        Map<String, Object> updates = new HashMap<>();
        updates.put("game", TEST_GAME_ID);

        when(playerRepository.findById(TEST_PLAYER_ID)).thenReturn(Optional.of(testPlayer));
        when(gameService.findGame(TEST_GAME_ID)).thenReturn(mockGame);
        when(playerRepository.save(any(Player.class))).thenAnswer(returnsFirstArg());

        Player patched = playerService.patchPlayer(TEST_PLAYER_ID, updates);

        assertNotNull(patched.getGame());
        assertEquals(TEST_GAME_ID, patched.getGame().getId());
        verify(gameService).findGame(TEST_GAME_ID);
    }

    @Test
    void shouldPatchPlayerNoGameUpdate() {
        
        Map<String, Object> updates = new HashMap<>();
        updates.put("otherField", "value");

        when(playerRepository.findById(TEST_PLAYER_ID)).thenReturn(Optional.of(testPlayer));
        when(playerRepository.save(any(Player.class))).thenAnswer(returnsFirstArg());

        Player patched = playerService.patchPlayer(TEST_PLAYER_ID, updates);

        verify(gameService, never()).findGame(anyInt());
        verify(playerRepository).save(testPlayer);
    }

    @Test
    void shouldAddFriend() {
        int FRIEND_ID = 5;
        Player friend = new Player();
        friend.setId(FRIEND_ID);
        friend.setUsername("Friend");

        when(playerRepository.findById(TEST_PLAYER_ID)).thenReturn(Optional.of(testPlayer));
        when(playerRepository.findById(FRIEND_ID)).thenReturn(Optional.of(friend));
        when(playerRepository.save(any(Player.class))).thenAnswer(returnsFirstArg());

        Player result = playerService.addFriend(TEST_PLAYER_ID, FRIEND_ID);

        assertTrue(result.getFriends().contains(friend));
        assertTrue(friend.getFriends().contains(testPlayer));
    }

    @Test
    void shouldRemoveFriendSuccess() {
        
        int FRIEND_ID = 5;
        Player friend = new Player();
        friend.setId(FRIEND_ID);
      
        testPlayer.getFriends().add(friend);
        friend.getFriends().add(testPlayer);

        when(playerRepository.findById(TEST_PLAYER_ID)).thenReturn(Optional.of(testPlayer));
        when(playerRepository.findById(FRIEND_ID)).thenReturn(Optional.of(friend));
        when(playerRepository.save(any(Player.class))).thenAnswer(returnsFirstArg());

        Player result = playerService.removeFriend(TEST_PLAYER_ID, FRIEND_ID);

        assertFalse(result.getFriends().contains(friend));
        assertFalse(friend.getFriends().contains(testPlayer));
    }

    @Test
    void shouldNotRemoveFriendIfNotBidirectional() {
        
        int FRIEND_ID = 5;
        Player friend = new Player();
        friend.setId(FRIEND_ID);
        
        testPlayer.getFriends().add(friend);
        
        when(playerRepository.findById(TEST_PLAYER_ID)).thenReturn(Optional.of(testPlayer));
        when(playerRepository.findById(FRIEND_ID)).thenReturn(Optional.of(friend));
        when(playerRepository.save(any(Player.class))).thenAnswer(returnsFirstArg());

        Player result = playerService.removeFriend(TEST_PLAYER_ID, FRIEND_ID);

        assertTrue(result.getFriends().contains(friend));
    }


    @Test
    void shouldDeleteActivePlayerAndDetachAllRelationships() {

        ActivePlayer activePlayer = new ActivePlayer();
        activePlayer.setId(TEST_PLAYER_ID);
     
        if (activePlayer.getCreatedGames() == null) activePlayer.setCreatedGames(new ArrayList<>());
        if (activePlayer.getWonGame() == null) activePlayer.setWonGame(new ArrayList<>()); 
        if (activePlayer.getMessages() == null) activePlayer.setMessages(new ArrayList<>());

        Player friend = new Player(); friend.getFriends().add(activePlayer);
        activePlayer.getFriends().add(friend);
        
        activePlayer.getAccquiredAchievements().add(mockAchievement);
        mockAchievement.getPlayers().add(activePlayer);
        
        Game watchingGame = new Game(); watchingGame.getWatchers().add(activePlayer);
        activePlayer.setGame(watchingGame);


        Deck d = new Deck();
        activePlayer.setDeck(d);
        
        Game createdGame = new Game(); createdGame.setCreator(activePlayer);
        activePlayer.getCreatedGames().add(createdGame);
        
        Game wonGame = new Game(); wonGame.setWinner(activePlayer);
        activePlayer.getWonGame().add(wonGame); 
        
        Message msg = new Message(); msg.setActivePlayer(activePlayer);
        activePlayer.getMessages().add(msg);

        Query mockQuery = mock(Query.class);
        when(entityManager.createNativeQuery(anyString())).thenReturn(mockQuery);
        when(mockQuery.setParameter(anyString(), any())).thenReturn(mockQuery);
        
        when(playerRepository.findById(TEST_PLAYER_ID)).thenReturn(Optional.of(activePlayer));
        
        Game activeGame = new Game();
        activeGame.getActivePlayers().add(activePlayer);
        when(gameService.findAllByActivePlayerId(TEST_PLAYER_ID)).thenReturn(List.of(activeGame));

      
        playerService.deletePlayer(TEST_PLAYER_ID);

        verify(deckService).saveDeck(d);
        verify(gameService, times(3)).saveGame(any(Game.class));
        verify(messageService).saveMessage(msg);
        verify(entityManager).flush();
        verify(entityManager, times(2)).createNativeQuery(anyString());
    }
    @Test
    void shouldDeleteRegularPlayer() {
        
        Player regularPlayer = new Player();
        regularPlayer.setId(99);

        Query mockQuery = mock(Query.class);
        when(entityManager.createNativeQuery(anyString())).thenReturn(mockQuery);
        when(mockQuery.setParameter(anyString(), any())).thenReturn(mockQuery);
        
        when(playerRepository.findById(99)).thenReturn(Optional.of(regularPlayer));

        playerService.deletePlayer(99);

        verify(deckService, never()).saveDeck(any());
        verify(gameService, never()).saveGame(any());
    
        verify(entityManager, times(1)).createNativeQuery(anyString());
    }
}