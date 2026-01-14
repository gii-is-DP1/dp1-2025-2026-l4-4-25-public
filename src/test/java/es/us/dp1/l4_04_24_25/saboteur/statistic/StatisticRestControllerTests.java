package es.us.dp1.l4_04_24_25.saboteur.statistic;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.security.config.annotation.web.WebSecurityConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;

@WebMvcTest(controllers = StatisticRestController.class, 
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class), 
    excludeAutoConfiguration = SecurityConfiguration.class)
class StatisticRestControllerTests {

    private static final String BASE_URL = "/api/v1/statistics";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StatisticService statisticService;

    @MockBean
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setup() {
        testUser = new User();
        testUser.setId(1);
        testUser.setUsername("testuser");
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetTotalMatches() throws Exception {
        when(userService.findByUsername("testuser")).thenReturn(testUser);
        when(statisticService.getTotalMatches(testUser)).thenReturn(10);

        mockMvc.perform(get(BASE_URL + "/total-matches"))
                .andExpect(status().isOk())
                .andExpect(content().string("10"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetAverageGameDuration() throws Exception {
        when(userService.findByUsername("testuser")).thenReturn(testUser);
        when(statisticService.getAverageGameDuration(testUser)).thenReturn(45.5);

        mockMvc.perform(get(BASE_URL + "/average-game-duration"))
                .andExpect(status().isOk())
                .andExpect(content().string("45.5"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetMaxGameDuration() throws Exception {
        when(userService.findByUsername("testuser")).thenReturn(testUser);
        when(statisticService.getMaxGameDuration(testUser)).thenReturn(120);

        mockMvc.perform(get(BASE_URL + "/max-game-duration"))
                .andExpect(status().isOk())
                .andExpect(content().string("120"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetMinGameDuration() throws Exception {
        when(userService.findByUsername("testuser")).thenReturn(testUser);
        when(statisticService.getMinGameDuration(testUser)).thenReturn(15);

        mockMvc.perform(get(BASE_URL + "/min-game-duration"))
                .andExpect(status().isOk())
                .andExpect(content().string("15"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetGlobalGameDurationAverage() throws Exception {
        when(statisticService.getGlobalAverageGameDuration()).thenReturn(52.3);

        mockMvc.perform(get(BASE_URL + "/global-game-duration-average"))
                .andExpect(status().isOk())
                .andExpect(content().string("52.3"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetGlobalGameMaxDuration() throws Exception {
        when(statisticService.getGlobalMaxGameDuration()).thenReturn(180);

        mockMvc.perform(get(BASE_URL + "/global-game-max-duration"))
                .andExpect(status().isOk())
                .andExpect(content().string("180"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetGlobalGameMinDuration() throws Exception {
        when(statisticService.getGlobalMinGameDuration()).thenReturn(10);

        mockMvc.perform(get(BASE_URL + "/global-game-min-duration"))
                .andExpect(status().isOk())
                .andExpect(content().string("10"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetAveragePlayersPerGame() throws Exception {
        when(userService.findByUsername("testuser")).thenReturn(testUser);
        when(statisticService.getAveragePlayersPerGame(testUser)).thenReturn(5.5);

        mockMvc.perform(get(BASE_URL + "/average-players-per-game"))
                .andExpect(status().isOk())
                .andExpect(content().string("5.5"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetGamePlayersMax() throws Exception {
        when(userService.findByUsername("testuser")).thenReturn(testUser);
        when(statisticService.getMaxPlayersPerGame(testUser)).thenReturn(8);

        mockMvc.perform(get(BASE_URL + "/game-players-max"))
                .andExpect(status().isOk())
                .andExpect(content().string("8"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetGamePlayersMin() throws Exception {
        when(userService.findByUsername("testuser")).thenReturn(testUser);
        when(statisticService.getMinPlayersPerGame(testUser)).thenReturn(3);

        mockMvc.perform(get(BASE_URL + "/game-players-min"))
                .andExpect(status().isOk())
                .andExpect(content().string("3"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetGlobalGamePlayersMax() throws Exception {
        when(statisticService.getMaxGlobalPlayersPerGame()).thenReturn(12);

        mockMvc.perform(get(BASE_URL + "/global-game-players-max"))
                .andExpect(status().isOk())
                .andExpect(content().string("12"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetGlobalGamePlayersMin() throws Exception {
        when(statisticService.getMinGlobalPlayersPerGame()).thenReturn(3);

        mockMvc.perform(get(BASE_URL + "/global-game-players-min"))
                .andExpect(status().isOk())
                .andExpect(content().string("3"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetGlobalGamePlayersAverage() throws Exception {
        when(statisticService.getAverageGlobalPlayersPerGame()).thenReturn(6.2);

        mockMvc.perform(get(BASE_URL + "/global-game-players-average"))
                .andExpect(status().isOk())
                .andExpect(content().string("6.2"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetAverageGoldNuggets() throws Exception {
        when(userService.findByUsername("testuser")).thenReturn(testUser);
        when(statisticService.getAverageGoldNuggets(testUser)).thenReturn(3.5);

        mockMvc.perform(get(BASE_URL + "/average-gold-nuggets"))
                .andExpect(status().isOk())
                .andExpect(content().string("3.5"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetWinPercentage() throws Exception {
        when(userService.findByUsername("testuser")).thenReturn(testUser);
        when(statisticService.getWinPercentage(testUser)).thenReturn(60.0);

        mockMvc.perform(get(BASE_URL + "/win-percentage"))
                .andExpect(status().isOk())
                .andExpect(content().string("60.0"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void shouldGetAverageTurnsPerGame() throws Exception {
        when(userService.findByUsername("testuser")).thenReturn(testUser);
        when(statisticService.getAverageTurnsPerGame(testUser)).thenReturn(25.0);

        mockMvc.perform(get(BASE_URL + "/average-turns-per-game"))
                .andExpect(status().isOk())
                .andExpect(content().string("25.0"));
    }
}
