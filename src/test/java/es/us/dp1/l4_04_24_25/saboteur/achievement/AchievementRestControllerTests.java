package es.us.dp1.l4_04_24_25.saboteur.achievement;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
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
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.achievements.AchievementRestController;
import es.us.dp1.l4_04_24_25.saboteur.achievements.AchievementService;
import es.us.dp1.l4_04_24_25.saboteur.achievements.Metric;
import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerService;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;


@WebMvcTest(controllers = AchievementRestController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class),
    excludeAutoConfiguration = SecurityConfiguration.class) 
class AchievementRestControllerTests {

    private static final int TEST_ID = 1;
    private static final String TEST_TITTLE = "Constructor Maestro";

    @Autowired
    private MockMvc mockMvc; 

    @Autowired
    private ObjectMapper objectMapper; 

    
    @MockBean
    private AchievementService achievementService;

    @MockBean
    private UserService userService;

    @MockBean
    private PlayerService playerService;

    private Achievement achievement;
    private User creator;

    @BeforeEach
    void setup() {
        
        creator = new User();
        creator.setId(1);
        creator.setUsername("admin1");

        achievement = new Achievement();
        achievement.setId(TEST_ID);
        achievement.setTittle(TEST_TITTLE);
        achievement.setDescription("Build 50 paths");
        achievement.setBadgeImage("badge.png");
        achievement.setThreshold(50);
        achievement.setMetric(Metric.BUILDED_PATHS);
        achievement.setCreator(creator);
        
        achievement.setPlayers(new ArrayList<>());
    }

    @Test
    @WithMockUser(value = "admin") 
    void shouldFindAllAchievements() throws Exception {
        
        when(this.achievementService.findAll()).thenReturn(List.of(achievement));

        mockMvc.perform(get("/api/v1/achievements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1)) 
                .andExpect(jsonPath("$[0].tittle").value(TEST_TITTLE));
        
        verify(achievementService).findAll(); 
    }

    @Test
    @WithMockUser(value = "admin")
    void shouldFindAchievementById() throws Exception {
        
        when(this.achievementService.findAchievement(TEST_ID)).thenReturn(achievement);

        mockMvc.perform(get("/api/v1/achievements/{id}", TEST_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tittle").value(TEST_TITTLE))
                .andExpect(jsonPath("$.metric").value("BUILDED_PATHS"));
    }

    @Test
    @WithMockUser(value = "admin")
    void shouldNotFindAchievementByInvalidId() throws Exception {
        
        when(this.achievementService.findAchievement(999))
            .thenThrow(new ResourceNotFoundException("Achievement", "id", 999));

        
        mockMvc.perform(get("/api/v1/achievements/{id}", 999))
                .andExpect(status().isNotFound()); 
    }

    @Test
    @WithMockUser(value = "admin")
    void shouldCreateAchievement() throws Exception {
        
        when(userService.findByUsername(creator.getUsername())).thenReturn(creator);
        when(achievementService.saveAchievement(any(Achievement.class))).thenReturn(achievement);

        String json = objectMapper.writeValueAsString(achievement);

        mockMvc.perform(post("/api/v1/achievements")
                .with(csrf()) 
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tittle").value(TEST_TITTLE));
    }

    @Test
    @WithMockUser(value = "admin")
    void shouldNotCreateAchievementWithEmptyTittle() throws Exception {
        
        achievement.setTittle(""); 
        String json = objectMapper.writeValueAsString(achievement);

        mockMvc.perform(post("/api/v1/achievements")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isBadRequest()); 
    }

    @Test
    @WithMockUser(value = "admin")
    void shouldUpdateAchievement() throws Exception {
        
        when(achievementService.findAchievement(TEST_ID)).thenReturn(achievement); 
        when(achievementService.saveAchievement(any(Achievement.class))).thenReturn(achievement);

        String json = objectMapper.writeValueAsString(achievement);

        mockMvc.perform(put("/api/v1/achievements/{id}", TEST_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isNoContent()); 
    }

    @Test
    @WithMockUser(value = "admin")
    void shouldDeleteAchievement() throws Exception {
        
        when(achievementService.findAchievement(TEST_ID)).thenReturn(achievement);
        doNothing().when(achievementService).deleteAchievement(TEST_ID);

        mockMvc.perform(delete("/api/v1/achievements/{id}", TEST_ID)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").exists());
    }
    
    @Test
    @WithMockUser(value = "admin")
    void shouldFindByTittle() throws Exception {
        
        when(achievementService.findByTittle(TEST_TITTLE)).thenReturn(achievement);

        mockMvc.perform(get("/api/v1/achievements/byTittle")
                .param("tittle", TEST_TITTLE))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tittle").value(TEST_TITTLE));
    }

    @Test
    @WithMockUser(value = "admin")
    void shouldPatchAchievementPlayers() throws Exception {
        
        Player oldPlayer = new Player(); 
        oldPlayer.setUsername("OldPlayer"); 
        oldPlayer.setId(10);
        oldPlayer.setAccquiredAchievements(new java.util.ArrayList<>(List.of(achievement)));
        achievement.getPlayers().add(oldPlayer);

        String newPlayerName = "NewPlayer";
        Player newPlayer = new Player(); 
        newPlayer.setUsername(newPlayerName); 
        newPlayer.setId(20);
        newPlayer.setAccquiredAchievements(new ArrayList<>());
      
        when(achievementService.findAchievement(TEST_ID)).thenReturn(achievement);
        when(playerService.findByUsername(newPlayerName)).thenReturn(newPlayer);
      
        when(playerService.patchPlayerAchievement(eq(20), any())).thenReturn(newPlayer);
      
        when(achievementService.updateAchievement(any(Achievement.class), eq(TEST_ID))).thenReturn(achievement);

        Map<String, Object> updates = new HashMap<>();
        updates.put("players", List.of(newPlayerName));

        mockMvc.perform(patch("/api/v1/achievements/{id}", TEST_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());

        verify(playerService).savePlayer(oldPlayer);
        
        verify(playerService).patchPlayerAchievement(eq(20), any());
    }

    @Test
    @WithMockUser(value = "admin")
    void shouldFailCreateDuplicateAchievement() throws Exception {
        
        when(achievementService.existsByTittle(any())).thenReturn(true);
        
        String json = objectMapper.writeValueAsString(achievement);

        mockMvc.perform(post("/api/v1/achievements")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedAchievementException));
    }

    @Test
    @WithMockUser(value = "admin")
    void shouldPatchSimpleFields() throws Exception {
        
        Map<String, Object> updates = new HashMap<>();
        updates.put("description", "Patched Desc");

        when(achievementService.findAchievement(TEST_ID)).thenReturn(achievement);
        when(achievementService.updateAchievement(any(Achievement.class), eq(TEST_ID))).thenReturn(achievement);

        mockMvc.perform(patch("/api/v1/achievements/{id}", TEST_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());
        
        verify(achievementService).updateAchievement(any(Achievement.class), eq(TEST_ID));
    }

    @Test
    @WithMockUser(value = "admin")
    void shouldPatchRemoveAllPlayers() throws Exception {
        
        Player oldPlayer = new Player(); 
        oldPlayer.setUsername("OldPlayer"); 
        oldPlayer.setId(10);
        oldPlayer.setAccquiredAchievements(new java.util.ArrayList<>(List.of(achievement)));
        achievement.getPlayers().add(oldPlayer);

        when(achievementService.findAchievement(TEST_ID)).thenReturn(achievement);
        
        when(achievementService.updateAchievement(any(Achievement.class), eq(TEST_ID))).thenReturn(achievement);

        Map<String, Object> updates = new HashMap<>();
        updates.put("players", new ArrayList<>());

        mockMvc.perform(patch("/api/v1/achievements/{id}", TEST_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());

        verify(playerService).savePlayer(oldPlayer);
    }

    @Test
    @WithMockUser(value = "admin")
    void shouldFailUpdateIdMismatch() throws Exception {
        when(achievementService.findAchievement(TEST_ID)).thenReturn(achievement);

        achievement.setId(999);
        String json = objectMapper.writeValueAsString(achievement);

        mockMvc.perform(put("/api/v1/achievements/{id}", TEST_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(result -> assertTrue(result.getResolvedException() instanceof es.us.dp1.l4_04_24_25.saboteur.exceptions.BadRequestException));
    }
}