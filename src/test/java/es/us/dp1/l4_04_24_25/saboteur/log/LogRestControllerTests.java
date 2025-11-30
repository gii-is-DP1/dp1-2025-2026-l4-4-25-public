package es.us.dp1.l4_04_24_25.saboteur.log;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
import org.springframework.context.annotation.Import; 
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.WebSecurityConfigurer;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.configuration.SecurityConfiguration;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundService;

@WebMvcTest(controllers = LogRestController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = WebSecurityConfigurer.class),
    excludeAutoConfiguration = SecurityConfiguration.class)

@Import({RoundDeserializer.class}) 
class LogRestControllerTests {

    private static final String BASE_URL = "/api/v1/logs";
    private static final int TEST_LOG_ID = 1;
    private static final int TEST_ROUND_ID = 10;

    @MockBean
    private LogService logService;

    @MockBean
    private RoundService roundService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Log testLog;
    private Round testRound;

    @BeforeEach
    void setup() {
        testRound = new Round();
        testRound.setId(TEST_ROUND_ID);

        testLog = new Log();
        testLog.setId(TEST_LOG_ID);
        testLog.setMessages(new ArrayList<>(List.of("Init game")));
        testLog.setRound(testRound);

        testRound.setLog(testLog);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldGetAllLogs() throws Exception {
        when(logService.findAll()).thenReturn(List.of(testLog));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1))
                .andExpect(jsonPath("$[0].id").value(TEST_LOG_ID));

        verify(logService).findAll();
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldGetLogById() throws Exception {
        when(logService.findLog(TEST_LOG_ID)).thenReturn(testLog);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_LOG_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_LOG_ID))
                .andExpect(jsonPath("$.messages[0]").value("Init game"));

        verify(logService).findLog(TEST_LOG_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldNotGetLogByInvalidId() throws Exception {
        when(logService.findLog(999)).thenThrow(new ResourceNotFoundException("Log", "id", 999));

        mockMvc.perform(get(BASE_URL + "/{id}", 999))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser("spring")
    void shouldCreateLog() throws Exception {
        
        Log inputLog = new Log();
        inputLog.setMessages(new ArrayList<>(List.of("Init game")));
        
        Round roundRef = new Round();
        roundRef.setId(TEST_ROUND_ID);
        inputLog.setRound(roundRef);

        when(roundService.findRound(TEST_ROUND_ID)).thenReturn(testRound);
        
        when(logService.saveLog(any(Log.class))).thenReturn(testLog);
        when(roundService.saveRound(any(Round.class))).thenReturn(testRound);

        mockMvc.perform(
                post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputLog)) 
        )
        .andExpect(status().isCreated())
        .andExpect(jsonPath("$.id").value(TEST_LOG_ID))
        .andExpect(jsonPath("$.messages[0]").value("Init game")); 

        verify(roundService, times(2)).findRound(TEST_ROUND_ID);
        verify(logService).saveLog(any(Log.class));
        verify(roundService).saveRound(any(Round.class));
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldPatchLogChangingRound() throws Exception {

        int newRoundId = 20;
        Round newRound = new Round();
        newRound.setId(newRoundId);

        Map<String, Object> updates = new HashMap<>();
        updates.put("round", newRoundId);

        when(logService.findLog(TEST_LOG_ID)).thenReturn(testLog);
        when(roundService.findRound(newRoundId)).thenReturn(newRound);
        when(logService.saveLog(any(Log.class))).thenReturn(testLog);
        when(roundService.saveRound(any(Round.class))).thenReturn(newRound);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_LOG_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk());

        verify(logService).findLog(TEST_LOG_ID);
        
        verify(roundService).findRound(newRoundId);
        verify(logService).saveLog(any(Log.class));
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldDeleteLogAndUnlinkRound() throws Exception {

        when(logService.findLog(TEST_LOG_ID)).thenReturn(testLog);
        doNothing().when(logService).deleteLog(TEST_LOG_ID);
        when(roundService.saveRound(any(Round.class))).thenReturn(testRound);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_LOG_ID)
                .with(csrf()))
                .andExpect(status().isNoContent());

        verify(logService).findLog(TEST_LOG_ID);
        verify(roundService).saveRound(testRound);
        verify(logService).deleteLog(TEST_LOG_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenDeletingNonExistingLog() throws Exception {

        when(logService.findLog(TEST_LOG_ID)).thenThrow(new ResourceNotFoundException("Log", "id", TEST_LOG_ID));

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_LOG_ID)
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(logService, never()).deleteLog(anyInt());
    }
}