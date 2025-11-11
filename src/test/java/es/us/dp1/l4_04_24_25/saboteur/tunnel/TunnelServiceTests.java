package es.us.dp1.l4_04_24_25.saboteur.tunnel;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;

@Epic("Card type: Tunnel")
@Feature("TunnelService")
//@Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
class TunnelServiceTests {

    @Autowired
    private TunnelService tunnelService;

    @Test
	void shouldFindSingleTunnelById() {
        Integer id = 31;
		Tunnel tunnel = this.tunnelService.findTunnel(id);
		assertEquals(id, tunnel.getId());
	}

    @Test
	void shouldNotFindSingleTunnelById() {
        Integer id = 30;
		assertThrows(ResourceNotFoundException.class, () -> this.tunnelService.findTunnel(id));
	}

    @Test
    void shouldFindTunnelByUpAndDownExists() {
        List<Tunnel> tunnels = this.tunnelService.findByArribaAndAbajo(true, true);
        assertTrue(tunnels.stream().allMatch(x->(x.arriba && x.abajo) == true));
    }

    @Test
    void shouldUpdateTunnel(){
        Tunnel originalTunnel = this.tunnelService.findTunnel(31);
        originalTunnel.setDerecha(true);
        Tunnel tunnel = this.tunnelService.updateTunnel(originalTunnel, 31);
        assertTrue(tunnel.derecha);
    }

    @Test
    void shouldDeleteTunnel() {
        Integer id = 31;
        Tunnel tunnelToDelete = this.tunnelService.findTunnel(id);
        assertEquals(id, tunnelToDelete.getId());
        this.tunnelService.deleteTunnel(id);
        assertThrows(ResourceNotFoundException.class, () -> this.tunnelService.findTunnel(id));
    }
}