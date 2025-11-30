package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.WebSecurityConfigurer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerService;
import es.us.dp1.l4_04_24_25.saboteur.user.Authorities;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("ActivePlayer Module")
@Feature("ActivePlayer Controller Tests")
@Owner("DP1-tutors")
@WebMvcTest(controllers = ActivePlayerRestController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class),
    excludeAutoConfiguration = SecurityConfiguration.class)
class ActivePlayerRestControllerTests {

    private static final int TEST_AP_ID = 1;
    private static final String BASE_URL = "/api/v1/activePlayers";
    private static final String TEST_USERNAME = "ActivePlayerUser";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ActivePlayerService activePlayerService;

    @MockBean
    private PlayerService playerService;

    @MockBean
    private UserService userService;

    @MockBean
    private PasswordEncoder encoder;

    private ActivePlayer activePlayer;

    @BeforeEach
    void setup() {
        Authorities auth = new Authorities();
        auth.setAuthority("PLAYER");
        
        activePlayer = new ActivePlayer();
        activePlayer.setId(TEST_AP_ID);
        activePlayer.setUsername(TEST_USERNAME);
        activePlayer.setPassword("password");
        activePlayer.setName("Test Name");
        activePlayer.setEmail("test@test.com");
        activePlayer.setBirthDate("2000-01-01");
        activePlayer.setImage("img.png");
        activePlayer.setAuthority(auth);
      
        activePlayer.setCreatedGames(new ArrayList<>());
        activePlayer.setWonGame(new ArrayList<>());
        activePlayer.setMessages(new ArrayList<>());
        activePlayer.setFriends(new ArrayList<>());
        activePlayer.setAccquiredAchievements(new ArrayList<>());
       
        activePlayer.setRol(true); 
        activePlayer.setPickaxeState(true);
        activePlayer.setCandleState(true);
        activePlayer.setCartState(true);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindAll() throws Exception {
        when(activePlayerService.findAll()).thenReturn(List.of(activePlayer));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].username", is(TEST_USERNAME)));
        
        verify(activePlayerService).findAll();
    }

    @Test
    @WithMockUser("admin")
    void shouldFindById() throws Exception {
        when(activePlayerService.findActivePlayer(TEST_AP_ID)).thenReturn(activePlayer);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_AP_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(TEST_AP_ID)));
        
        verify(activePlayerService).findActivePlayer(TEST_AP_ID);
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByRol() throws Exception {
        when(activePlayerService.findByRol(true)).thenReturn(List.of(activePlayer));

        mockMvc.perform(get(BASE_URL + "/byRol").param("rol", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByUsername() throws Exception {
        when(activePlayerService.findByUsername(TEST_USERNAME)).thenReturn(activePlayer);

        mockMvc.perform(get(BASE_URL + "/byUsername").param("username", TEST_USERNAME))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is(TEST_USERNAME)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByPickaxeState() throws Exception {
        when(activePlayerService.findByPickaxeState(true)).thenReturn(List.of(activePlayer));

        mockMvc.perform(get(BASE_URL + "/byPickaxeState").param("pickaxeState", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByCandleState() throws Exception {
        when(activePlayerService.findByCandleState(true)).thenReturn(List.of(activePlayer));

        mockMvc.perform(get(BASE_URL + "/byCandleState").param("candleState", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    @WithMockUser("admin")
    void shouldFindByCartState() throws Exception {
        when(activePlayerService.findByCartState(true)).thenReturn(List.of(activePlayer));

        mockMvc.perform(get(BASE_URL + "/byCartState").param("cartState", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));
    }


    @Test
    @WithMockUser("admin")
    void shouldCreateActivePlayer() throws Exception {
        
        when(activePlayerService.existsActivePlayer(TEST_USERNAME)).thenReturn(false);
        when(activePlayerService.findAll()).thenReturn(new ArrayList<>());
        when(userService.existsUser(TEST_USERNAME)).thenReturn(false);
        when(userService.findAll()).thenReturn(new ArrayList<>());
       
        when(playerService.findByUsername(TEST_USERNAME))
            .thenThrow(new ResourceNotFoundException("Player", "username", TEST_USERNAME));
        
        when(playerService.findAll()).thenReturn(new ArrayList<>());
        
        when(encoder.encode(any())).thenReturn("encodedPass");
        when(activePlayerService.saveActivePlayer(any(ActivePlayer.class))).thenReturn(activePlayer);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(activePlayer)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.username", is(TEST_USERNAME)));
        
        verify(activePlayerService).saveActivePlayer(any(ActivePlayer.class));
    }

    @Test
    @WithMockUser("admin")
    void shouldFailCreateDuplicateActivePlayer() throws Exception {
        when(activePlayerService.existsActivePlayer(TEST_USERNAME)).thenReturn(true);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(activePlayer)))
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedActivePlayerException));
    }

    @Test
    @WithMockUser("admin")
    void shouldFailCreateDuplicateUserEmail() throws Exception {
        
        when(activePlayerService.existsActivePlayer(TEST_USERNAME)).thenReturn(false);
        
        ActivePlayer existing = new ActivePlayer(); existing.setEmail("test@test.com");
        when(activePlayerService.findAll()).thenReturn(List.of(existing));

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(activePlayer)))
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedUserException));
    }

    @Test
    @WithMockUser("admin")
    void shouldFailCreateDuplicatePlayerUsername() throws Exception {
        when(activePlayerService.existsActivePlayer(TEST_USERNAME)).thenReturn(false);
        when(activePlayerService.findAll()).thenReturn(new ArrayList<>());
        when(userService.existsUser(TEST_USERNAME)).thenReturn(false);
        when(userService.findAll()).thenReturn(new ArrayList<>());
      
        when(playerService.findByUsername(TEST_USERNAME)).thenReturn(new Player());

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(activePlayer)))
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedPlayerException));
    }


    @Test
    @WithMockUser("admin")
    void shouldUpdateActivePlayer() throws Exception {
        when(activePlayerService.findActivePlayer(TEST_AP_ID)).thenReturn(activePlayer);
        when(activePlayerService.updateActivePlayer(any(ActivePlayer.class), eq(TEST_AP_ID))).thenReturn(activePlayer);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_AP_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(activePlayer)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser("admin")
    void shouldDeleteActivePlayer() throws Exception {
        when(activePlayerService.findActivePlayer(TEST_AP_ID)).thenReturn(activePlayer);
        doNothing().when(activePlayerService).deleteActivePlayer(TEST_AP_ID);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_AP_ID)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
        
        verify(activePlayerService).deleteActivePlayer(TEST_AP_ID);
    }

    @Test
    @WithMockUser("admin")
    void shouldFailDeleteNonExistingActivePlayer() throws Exception {
        when(activePlayerService.findActivePlayer(TEST_AP_ID))
            .thenThrow(new ResourceNotFoundException("ActivePlayer", "id", TEST_AP_ID));

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_AP_ID)
                .with(csrf()))
                .andExpect(status().isNotFound());
        
        verify(activePlayerService, never()).deleteActivePlayer(TEST_AP_ID);
    }
}