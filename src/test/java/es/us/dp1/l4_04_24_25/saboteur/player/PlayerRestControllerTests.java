package es.us.dp1.l4_04_24_25.saboteur.player;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.dao.DataAccessException;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.user.Authorities;
import es.us.dp1.l4_04_24_25.saboteur.user.UserDTO;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;

@WebMvcTest(controllers = PlayerRestController.class)
@ComponentScan(basePackageClasses = {
    es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions.class,
    es.us.dp1.l4_04_24_25.saboteur.player.PlayerRestController.class 
})
class PlayerRestControllerTests {

    private static final int TEST_PLAYER_ID = 4;
    private static final String BASE_URL = "/api/v1/players";
    private static final String TEST_USERNAME = "Carlosbox2k";
    private static final String TEST_EMAIL = "carlos@saboteur.es";

    @MockBean
    private PlayerService playerService;

    @MockBean
    private UserService userService;

    @MockBean
    private PasswordEncoder encoder;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Player testPlayer;
    private PlayerDTO testPlayerDTO;

    @BeforeEach
    void setup() {
        Authorities auth = new Authorities();
        auth.setAuthority("PLAYER");
        auth.setId(2);

        testPlayer = new Player();
        testPlayer.setId(TEST_PLAYER_ID);
        testPlayer.setUsername(TEST_USERNAME);
        testPlayer.setName("Carlos");
        testPlayer.setEmail(TEST_EMAIL);
        testPlayer.setPassword("password");
        testPlayer.setBirthDate("2005-02-04");
        testPlayer.setAuthority(auth);

        testPlayerDTO = new PlayerDTO(
            TEST_PLAYER_ID, TEST_USERNAME, "Carlos", "2005-02-04", LocalDateTime.now(),
            TEST_EMAIL, TEST_EMAIL, "PLAYER",
            10, 0, 0, 0, 0, 0, 0, false,
            Collections.emptyList(), Collections.emptyList(), null
        );
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindAllPlayers() throws Exception {
        when(playerService.findAll()).thenReturn(List.of(testPlayerDTO));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value(TEST_USERNAME));

        verify(playerService).findAll();
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindPlayerById() throws Exception {
        when(playerService.findPlayerDTO(TEST_PLAYER_ID)).thenReturn(testPlayerDTO);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_PLAYER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(TEST_USERNAME));

        verify(playerService).findPlayerDTO(TEST_PLAYER_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenPlayerDoesNotExist() throws Exception {
        when(playerService.findPlayerDTO(TEST_PLAYER_ID))
                .thenThrow(ResourceNotFoundException.class);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_PLAYER_ID))
                .andExpect(status().isNotFound());

        verify(playerService).findPlayerDTO(TEST_PLAYER_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindPlayerByUsername() throws Exception {
        when(playerService.findByUsernameDTO(TEST_USERNAME)).thenReturn(testPlayerDTO);

        mockMvc.perform(get(BASE_URL + "/byUsername")
                .param("username", TEST_USERNAME))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(TEST_USERNAME));

        verify(playerService).findByUsernameDTO(TEST_USERNAME);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldCreatePlayer() throws Exception {
        when(userService.existsUser(TEST_USERNAME)).thenReturn(false);
        when(userService.findAll()).thenReturn(new ArrayList<>());
        when(playerService.findAll()).thenReturn(new ArrayList<>());
        when(playerService.findByUsername(anyString()))
                .thenThrow(new ResourceNotFoundException("Player", "username", "nf"));
        when(encoder.encode(any(CharSequence.class))).thenReturn("encodedPassword");
        when(playerService.savePlayer(any(Player.class))).thenReturn(testPlayer);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPlayer)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username").value(TEST_USERNAME));

        verify(playerService).savePlayer(any(Player.class));
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnConflictWhenCreatingPlayerWithExistingUsername() throws Exception {
        when(userService.existsUser(TEST_USERNAME)).thenReturn(true);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPlayer)))
                .andExpect(status().isInternalServerError());

        verify(playerService, never()).savePlayer(any(Player.class));
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnConflictWhenCreatingPlayerWithExistingEmail() throws Exception {
        when(userService.existsUser(TEST_USERNAME)).thenReturn(false);

        UserDTO existingUser = new UserDTO();
        existingUser.setEmail(TEST_EMAIL);
        when(userService.findAll()).thenReturn(List.of(existingUser));

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPlayer)))
                .andExpect(status().isInternalServerError());

        verify(playerService, never()).savePlayer(any(Player.class));
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldHandleDuplicatedPlayerException() throws Exception {
        when(userService.existsUser(TEST_USERNAME)).thenReturn(false);
        when(userService.findAll()).thenReturn(new ArrayList<>());
        when(playerService.findAll()).thenReturn(new ArrayList<>());
        when(playerService.findByUsername(TEST_USERNAME)).thenReturn(testPlayer);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPlayer)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldUpdatePlayer() throws Exception {
        when(playerService.findPlayer(TEST_PLAYER_ID)).thenReturn(testPlayer);
        when(playerService.updatePlayer(any(Player.class), anyInt())).thenReturn(testPlayerDTO);

        mockMvc.perform(put(BASE_URL + "/{playerId}", TEST_PLAYER_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPlayer)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(TEST_USERNAME));

        verify(playerService).updatePlayer(any(Player.class), anyInt());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldDeletePlayer() throws Exception {
        when(playerService.findPlayer(TEST_PLAYER_ID)).thenReturn(testPlayer);

        mockMvc.perform(delete(BASE_URL + "/{playerId}", TEST_PLAYER_ID)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Player deleted!"));

        verify(playerService).deletePlayer(TEST_PLAYER_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenDeletingNonExistingPlayer() throws Exception {
        when(playerService.findPlayer(TEST_PLAYER_ID))
                .thenThrow(new ResourceNotFoundException("Player", "id", TEST_PLAYER_ID));

        mockMvc.perform(delete(BASE_URL + "/{playerId}", TEST_PLAYER_ID)
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(playerService, never()).deletePlayer(anyInt());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldHandleDataAccessException() throws Exception {
        when(userService.existsUser(TEST_USERNAME)).thenReturn(false);
        when(userService.findAll()).thenReturn(new ArrayList<>());
        when(playerService.findAll()).thenReturn(new ArrayList<>());
        when(playerService.findByUsername(anyString()))
                .thenThrow(new ResourceNotFoundException("Player", "username", "nf"));
        when(encoder.encode(any(CharSequence.class))).thenReturn("encodedPassword");
        when(playerService.savePlayer(any(Player.class)))
                .thenThrow(new DataAccessException("DB error") {});

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testPlayer)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindAllByGameId() throws Exception {
        int gameId = 1;
        when(playerService.findAllByGameId(gameId)).thenReturn(List.of(testPlayerDTO));

        mockMvc.perform(get(BASE_URL + "/byGameId")
                .param("gameId", String.valueOf(gameId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value(TEST_USERNAME));

        verify(playerService).findAllByGameId(gameId);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByGameIdAndUsername() throws Exception {
        int gameId = 1;
        when(playerService.findByGameIdAndUsername(gameId, TEST_USERNAME)).thenReturn(testPlayerDTO);

        mockMvc.perform(get(BASE_URL + "/byGameIdAndUsername")
                .param("gameId", String.valueOf(gameId))
                .param("username", TEST_USERNAME))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(TEST_USERNAME));

        verify(playerService).findByGameIdAndUsername(gameId, TEST_USERNAME);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindFriends() throws Exception {
        Player friend = new Player();
        friend.setUsername("Amigo");
        testPlayer.getFriends().add(friend);

        when(playerService.findPlayer(TEST_PLAYER_ID)).thenReturn(testPlayer);

        mockMvc.perform(get(BASE_URL + "/{id}/friends", TEST_PLAYER_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].username").value("Amigo"));
        
        
        verify(playerService, org.mockito.Mockito.times(2)).findPlayer(TEST_PLAYER_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldAddFriend() throws Exception {
        int friendId = 5;
        when(playerService.findPlayer(TEST_PLAYER_ID)).thenReturn(testPlayer);
        when(playerService.findPlayer(friendId)).thenReturn(new Player());
        
        when(playerService.addFriend(TEST_PLAYER_ID, friendId)).thenReturn(testPlayer);

        mockMvc.perform(patch(BASE_URL + "/{id}/addFriends/{friendId}", TEST_PLAYER_ID, friendId)
                .with(csrf()))
                .andExpect(status().isOk());

        verify(playerService).addFriend(TEST_PLAYER_ID, friendId);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldRemoveFriend() throws Exception {
        int friendId = 5;
        when(playerService.findPlayer(TEST_PLAYER_ID)).thenReturn(testPlayer);
        when(playerService.findPlayer(friendId)).thenReturn(new Player());
        
        when(playerService.removeFriend(TEST_PLAYER_ID, friendId)).thenReturn(testPlayer);

        mockMvc.perform(patch(BASE_URL + "/{id}/removeFriends/{friendId}", TEST_PLAYER_ID, friendId)
                .with(csrf()))
                .andExpect(status().isOk());

        verify(playerService).removeFriend(TEST_PLAYER_ID, friendId);
    }
}