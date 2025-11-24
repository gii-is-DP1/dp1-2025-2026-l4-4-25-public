package es.us.dp1.l4_04_24_25.saboteur.action;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.dao.DataAccessException;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MapperFeature;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.card.effectValue;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;

@WebMvcTest(controllers = ActionRestController.class)
@ComponentScan(basePackageClasses = {RestPreconditions.class})
class ActionRestControllerTests {

    private static final String BASE_URL = "/api/v1/actions";
    private static final int TEST_ACTION_ID = 1;

    @MockBean
    private ActionService actionService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Action testAction;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public ObjectMapper objectMapper() {
            ObjectMapper om = new ObjectMapper();
            om.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
            om.disable(MapperFeature.USE_ANNOTATIONS);
            return om;
        }
    }

    @BeforeEach
    void setup() {
        
        testAction = new Action();
        testAction.setId(TEST_ACTION_ID);
        testAction.setImage("action_img.png");
        testAction.setStatus(true);
        testAction.setNameAction(nameAction.DESTROY);
        testAction.setEffectValue(effectValue.DESTROY_LAMP);
        testAction.setObjectAffect(false); 
    }


    @Test
    @WithMockUser(value = "spring")
    void shouldFindAllActions() throws Exception {
        
        when(actionService.findAll()).thenReturn(List.of(testAction));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_ACTION_ID))
                .andExpect(jsonPath("$[0].nameAction").value("DESTROY"));

        verify(actionService).findAll();
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindActionById() throws Exception {
       
        when(actionService.findAction(TEST_ACTION_ID)).thenReturn(testAction);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_ACTION_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_ACTION_ID))
                .andExpect(jsonPath("$.effectValue").value("DESTROY_LAMP"));

        verify(actionService).findAction(TEST_ACTION_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenActionDoesNotExist() throws Exception {
        
        when(actionService.findAction(TEST_ACTION_ID))
                .thenThrow(new ResourceNotFoundException("Action", "id", TEST_ACTION_ID));

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_ACTION_ID))
                .andExpect(status().isNotFound());

        verify(actionService).findAction(TEST_ACTION_ID);
    }


    @Test
    @WithMockUser(value = "spring")
    void shouldFindByNameAction() throws Exception {
       
        when(actionService.findByNameAction(nameAction.DESTROY)).thenReturn(List.of(testAction));

        mockMvc.perform(get(BASE_URL + "/byName")
                .param("nameAction", "DESTROY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].nameAction").value("DESTROY"));
        
        verify(actionService).findByNameAction(nameAction.DESTROY);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByEffectValue() throws Exception {
       
        when(actionService.findByEffectValue(effectValue.DESTROY_LAMP)).thenReturn(List.of(testAction));

        mockMvc.perform(get(BASE_URL + "/byEffectValue")
                .param("effectValue", "DESTROY_LAMP"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].effectValue").value("DESTROY_LAMP"));

        verify(actionService).findByEffectValue(effectValue.DESTROY_LAMP);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByObjectAffect() throws Exception {
       
        when(actionService.findByObjectAffect(false)).thenReturn(List.of(testAction));

        mockMvc.perform(get(BASE_URL + "/byObjectAffect")
                .param("objectAffect", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].objectAffect").value(false));

        verify(actionService).findByObjectAffect(false);
    }


    @Test
    @WithMockUser(value = "spring")
    void shouldCreateAction() throws Exception {
       
        when(actionService.saveAction(any(Action.class))).thenReturn(testAction);

        mockMvc.perform(post(BASE_URL)
                .with(csrf()) 
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAction)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(TEST_ACTION_ID));

        verify(actionService).saveAction(any(Action.class));
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnErrorWhenCreateFails() throws Exception {
        
        when(actionService.saveAction(any(Action.class)))
                .thenThrow(new DataAccessException("DB Error") {});

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAction)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldUpdateAction() throws Exception {
        
        when(actionService.findAction(TEST_ACTION_ID)).thenReturn(testAction);
        when(actionService.updateAction(any(Action.class), anyInt())).thenReturn(testAction);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_ACTION_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAction)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_ACTION_ID));

        verify(actionService).updateAction(any(Action.class), anyInt());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenUpdatingNonExistingAction() throws Exception {
       
        when(actionService.findAction(TEST_ACTION_ID))
                .thenThrow(new ResourceNotFoundException("Action", "id", TEST_ACTION_ID));

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_ACTION_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testAction)))
                .andExpect(status().isNotFound());

        verify(actionService, never()).updateAction(any(Action.class), anyInt());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldPatchAction() throws Exception {
        
        Map<String, Object> updates = new HashMap<>();
        updates.put("image", "new_image.png");

        Action patchedAction = new Action();
        patchedAction.setId(TEST_ACTION_ID);
        patchedAction.setImage("new_image.png"); 
        patchedAction.setNameAction(testAction.getNameAction()); 

        when(actionService.findAction(TEST_ACTION_ID)).thenReturn(testAction);
        when(actionService.updateAction(any(Action.class), eq(TEST_ACTION_ID))).thenReturn(patchedAction);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_ACTION_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.image").value("new_image.png"));

        verify(actionService).updateAction(any(Action.class), eq(TEST_ACTION_ID));
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldDeleteAction() throws Exception {
        
        when(actionService.findAction(TEST_ACTION_ID)).thenReturn(testAction);
        doNothing().when(actionService).deleteAction(TEST_ACTION_ID);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_ACTION_ID)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Action deleted!"));

        verify(actionService).deleteAction(TEST_ACTION_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenDeletingNonExistingAction() throws Exception {
       
        when(actionService.findAction(TEST_ACTION_ID))
                .thenThrow(new ResourceNotFoundException("Action", "id", TEST_ACTION_ID));

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_ACTION_ID)
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(actionService, never()).deleteAction(anyInt());
    }
}