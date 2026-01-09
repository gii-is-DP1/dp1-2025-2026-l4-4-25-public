package es.us.dp1.l4_04_24_25.saboteur.tunnel;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyBoolean;
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
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
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
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());

        verify(tunnelService, never()).deleteTunnel(anyInt());
    }


    @Test
    @WithMockUser(value = "spring")
    void shouldReturnNotFoundWhenPatchingNonExistingTunnel() throws Exception {
        when(tunnelService.findTunnel(TEST_TUNNEL_ID))
                .thenThrow(new ResourceNotFoundException("Tunnel", "id", TEST_TUNNEL_ID));

        Map<String, Object> updates = new HashMap<>();
        updates.put("image", "new.png");

        mockMvc.perform(patch(BASE_URL + "/{id}", TEST_TUNNEL_ID)
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updates)))
                .andExpect(status().isNotFound());

        verify(tunnelService, never()).updateTunnel(any(Tunnel.class), anyInt());
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByRotacion() throws Exception {
        when(tunnelService.findByRotacion(anyBoolean())).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byRotacion").param("rotacion", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_TUNNEL_ID));
        verify(tunnelService).findByRotacion(false);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByArriba() throws Exception {
        when(tunnelService.findByArriba(anyBoolean())).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byArriba").param("arriba", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_TUNNEL_ID));
        verify(tunnelService).findByArriba(true);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByAbajo() throws Exception {
        when(tunnelService.findByAbajo(anyBoolean())).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byAbajo").param("abajo", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_TUNNEL_ID));
        verify(tunnelService).findByAbajo(false);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByDerecha() throws Exception {
        when(tunnelService.findByDerecha(anyBoolean())).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byDerecha").param("derecha", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_TUNNEL_ID));
        verify(tunnelService).findByDerecha(true);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByIzquierda() throws Exception {
        when(tunnelService.findByIzquierda(anyBoolean())).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byIzquierda").param("izquierda", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_TUNNEL_ID));
        verify(tunnelService).findByIzquierda(false);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByArribaAndAbajo() throws Exception {
        when(tunnelService.findByArribaAndAbajo(true, false)).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byArribaAndAbajo")
                .param("arriba", "true")
                .param("abajo", "false"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(TEST_TUNNEL_ID));
        verify(tunnelService).findByArribaAndAbajo(true, false);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByArribaAndDerecha() throws Exception {
        when(tunnelService.findByArribaAndDerecha(true, true)).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byArribaAndDerecha")
                .param("arriba", "true")
                .param("derecha", "true"))
                .andExpect(status().isOk());
        verify(tunnelService).findByArribaAndDerecha(true, true);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByArribaAndIzquierda() throws Exception {
        when(tunnelService.findByArribaAndIzquierda(true, false)).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byArribaAndIzquierda")
                .param("arriba", "true")
                .param("izquierda", "false"))
                .andExpect(status().isOk());
        verify(tunnelService).findByArribaAndIzquierda(true, false);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByAbajoAndDerecha() throws Exception {
        when(tunnelService.findByAbajoAndDerecha(false, true)).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byAbajoAndDerecha")
                .param("abajo", "false")
                .param("derecha", "true"))
                .andExpect(status().isOk());
        verify(tunnelService).findByAbajoAndDerecha(false, true);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByAbajoAndIzquierda() throws Exception {
        when(tunnelService.findByAbajoAndIzquierda(false, false)).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byAbajoAndIzquierda")
                .param("abajo", "false")
                .param("izquierda", "false"))
                .andExpect(status().isOk());
        verify(tunnelService).findByAbajoAndIzquierda(false, false);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByDerechaAndIzquierda() throws Exception {
        when(tunnelService.findByDerechaAndIzquierda(true, false)).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byDerechaAndIzquierda")
                .param("derecha", "true")
                .param("izquierda", "false"))
                .andExpect(status().isOk());
        verify(tunnelService).findByDerechaAndIzquierda(true, false);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByArribaAndAbajoAndDerecha() throws Exception {
        when(tunnelService.findByArribaAndAbajoAndDerecha(true, false, true)).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byArribaAndAbajoAndDerecha")
                .param("arriba", "true")
                .param("abajo", "false")
                .param("derecha", "true"))
                .andExpect(status().isOk());
        verify(tunnelService).findByArribaAndAbajoAndDerecha(true, false, true);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByArribaAndAbajoAndIzquierda() throws Exception {
        when(tunnelService.findByArribaAndAbajoAndIzquierda(true, false, false)).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byArribaAndAbajoAndIzquierda")
                .param("arriba", "true")
                .param("abajo", "false")
                .param("izquierda", "false"))
                .andExpect(status().isOk());
        verify(tunnelService).findByArribaAndAbajoAndIzquierda(true, false, false);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByArribaAndDerechaAndIzquierda() throws Exception {
        when(tunnelService.findByArribaAndDerechaAndIzquierda(true, true, false)).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byArribaAndDerechaAndIzquierda")
                .param("arriba", "true")
                .param("derecha", "true")
                .param("izquierda", "false"))
                .andExpect(status().isOk());
        verify(tunnelService).findByArribaAndDerechaAndIzquierda(true, true, false);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByAbajoAndDerechaAndIzquierda() throws Exception {
        when(tunnelService.findByAbajoAndDerechaAndIzquierda(false, true, false)).thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byAbajoAndDerechaAndIzquierda")
                .param("abajo", "false")
                .param("derecha", "true")
                .param("izquierda", "false"))
                .andExpect(status().isOk());
        verify(tunnelService).findByAbajoAndDerechaAndIzquierda(false, true, false);
    }

    @Test
    @WithMockUser(value = "spring")
    void shouldFindByAllConnections() throws Exception {
        // Endpoint is /byAllConnections
        when(tunnelService.findByArribaAndAbajoAndDerechaAndIzquierda(true, false, true, false))
                .thenReturn(List.of(testTunnel));

        mockMvc.perform(get(BASE_URL + "/byAllConnections")
                .param("arriba", "true")
                .param("abajo", "false")
                .param("derecha", "true")
                .param("izquierda", "false"))
                .andExpect(status().isOk());
        verify(tunnelService).findByArribaAndAbajoAndDerechaAndIzquierda(true, false, true, false);
    }
}