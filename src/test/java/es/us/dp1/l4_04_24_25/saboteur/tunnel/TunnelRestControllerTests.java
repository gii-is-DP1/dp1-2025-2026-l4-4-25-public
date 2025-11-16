package es.us.dp1.l4_04_24_25.saboteur.tunnel;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

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

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;

@WebMvcTest(controllers = TunnelRestController.class)
@ComponentScan(basePackageClasses = {RestPreconditions.class})
class TunnelRestControllerTests {

    private static final String BASE_URL = "/api/v1/tunnels";
    private static final int TEST_TUNNEL_ID = 1;

    @MockBean
    private TunnelService tunnelService;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private Tunnel testTunnel;

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
        testTunnel = new Tunnel();
        testTunnel.setId(TEST_TUNNEL_ID);
        testTunnel.setImage("img.png");
        testTunnel.setStatus(true);
        testTunnel.setRotacion(false);
        testTunnel.setArriba(true);
        testTunnel.setAbajo(false);
        testTunnel.setDerecha(true);
        testTunnel.setIzquierda(false);
        testTunnel.setCentro(false);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindAllTunnels() throws Exception {
        when(tunnelService.findAll()).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_TUNNEL_ID));

        verify(tunnelService).findAll();
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindTunnelById() throws Exception {
        when(tunnelService.findTunnel(TEST_TUNNEL_ID)).thenReturn(testTunnel);

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_TUNNEL_ID))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_TUNNEL_ID));

        verify(tunnelService).findTunnel(TEST_TUNNEL_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenTunnelDoesNotExist() throws Exception {
        when(tunnelService.findTunnel(TEST_TUNNEL_ID))
                .thenThrow(new ResourceNotFoundException("Tunnel", "id", TEST_TUNNEL_ID));

        mockMvc.perform(get(BASE_URL + "/{id}", TEST_TUNNEL_ID))
                .andExpect(status().isNotFound());

        verify(tunnelService).findTunnel(TEST_TUNNEL_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldCreateTunnel() throws Exception {
        when(tunnelService.saveTunnel(any(Tunnel.class))).thenReturn(testTunnel);

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTunnel)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(TEST_TUNNEL_ID));

        verify(tunnelService).saveTunnel(any(Tunnel.class));
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnErrorWhenCreateFails() throws Exception {
        when(tunnelService.saveTunnel(any(Tunnel.class)))
                .thenThrow(new DataAccessException("DB Error") {});

        mockMvc.perform(post(BASE_URL)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTunnel)))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldUpdateTunnel() throws Exception {
        when(tunnelService.findTunnel(TEST_TUNNEL_ID)).thenReturn(testTunnel);
        when(tunnelService.updateTunnel(any(Tunnel.class), anyInt())).thenReturn(testTunnel);

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_TUNNEL_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTunnel)))
                .andExpect(status().isOk());

        verify(tunnelService).updateTunnel(any(Tunnel.class), anyInt());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenUpdatingNonExistingTunnel() throws Exception {
        when(tunnelService.findTunnel(TEST_TUNNEL_ID))
                .thenThrow(new ResourceNotFoundException("Tunnel", "id", TEST_TUNNEL_ID));

        mockMvc.perform(put(BASE_URL + "/{id}", TEST_TUNNEL_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testTunnel)))
                .andExpect(status().isNotFound());

        verify(tunnelService, never()).updateTunnel(any(Tunnel.class), anyInt());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldPatchTunnel() throws Exception {
        Map<String, Object> updates = new HashMap<>();
        updates.put("image", "new.png");

        Tunnel patched = new Tunnel();
        patched.setId(TEST_TUNNEL_ID);
        patched.setImage("new.png");

        when(tunnelService.findTunnel(TEST_TUNNEL_ID)).thenReturn(testTunnel);
        when(tunnelService.updateTunnel(any(Tunnel.class), anyInt())).thenReturn(patched);

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_TUNNEL_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.image").value("new.png"));

        verify(tunnelService).updateTunnel(any(Tunnel.class), anyInt());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldDeleteTunnel() throws Exception {
        when(tunnelService.findTunnel(TEST_TUNNEL_ID)).thenReturn(testTunnel);

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_TUNNEL_ID)
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Tunnel deleted!"));

        verify(tunnelService).deleteTunnel(TEST_TUNNEL_ID);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenDeletingNonExistingTunnel() throws Exception {
        when(tunnelService.findTunnel(TEST_TUNNEL_ID))
                .thenThrow(new ResourceNotFoundException("Tunnel", "id", TEST_TUNNEL_ID));

        mockMvc.perform(delete(BASE_URL + "/{id}", TEST_TUNNEL_ID)
                .with(csrf()))
                .andExpect(status().isNotFound());

        verify(tunnelService, never()).deleteTunnel(anyInt());
    }
}
