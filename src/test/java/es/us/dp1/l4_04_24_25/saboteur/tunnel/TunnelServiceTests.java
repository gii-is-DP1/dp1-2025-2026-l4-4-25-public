package es.us.dp1.l4_04_24_25.saboteur.tunnel;

import java.util.List;
import java.util.Collection;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;

@Epic("Card type: Tunnel")
@Feature("TunnelService")
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
        // Busca túneles que conectan Arriba y Abajo (como el ID 34, 58, etc.)
        List<Tunnel> tunnels = this.tunnelService.findByArribaAndAbajo(true, true);
        assertFalse(tunnels.isEmpty());
        assertTrue(tunnels.stream().allMatch(x -> x.arriba && x.abajo));
    }

    @Test
    @Transactional
    void shouldUpdateTunnel() {
        Tunnel originalTunnel = this.tunnelService.findTunnel(31);
        originalTunnel.setDerecha(true);
        Tunnel tunnel = this.tunnelService.updateTunnel(originalTunnel, 31);
        assertTrue(tunnel.derecha);
    }

    @Test
    @Transactional
    void shouldDeleteTunnel() {
        Integer id = 31;
        Tunnel tunnelToDelete = this.tunnelService.findTunnel(id);
        assertEquals(id, tunnelToDelete.getId());
        this.tunnelService.deleteTunnel(id);
        assertThrows(ResourceNotFoundException.class, () -> this.tunnelService.findTunnel(id));
    }

    @Test
    void shouldFindAllTunnels() {
        Iterable<Tunnel> tunnels = tunnelService.findAll();
        assertNotNull(tunnels);
        assertTrue(((Collection<?>) tunnels).size() >= 40); // Hay 40 túneles en el data.sql (31-70)
    }

    @Test
    @Transactional
    void shouldSaveTunnel() {
        Tunnel newTunnel = new Tunnel();
        newTunnel.setImage("test-image.png");
        newTunnel.setRotacion(false);
        newTunnel.setArriba(true);
        newTunnel.setAbajo(true);
        newTunnel.setDerecha(true);
        newTunnel.setIzquierda(true);
        newTunnel.setCentro(false); // Centro abierto

        Tunnel saved = tunnelService.saveTunnel(newTunnel);
        assertNotNull(saved.getId());
        assertTrue(saved.isArriba());
    }

    @Test
    void shouldFindByRotacion() {
        List<Tunnel> tunnels = tunnelService.findByRotacion(false);
        assertNotNull(tunnels);
        assertFalse(tunnels.isEmpty());
    }

    @Test
    void shouldFindBySpecificDirection() {

        List<Tunnel> tunnels = tunnelService.findByDerecha(true);
        assertNotNull(tunnels);
        assertTrue(tunnels.stream().allMatch(Tunnel::isDerecha));
    }

    @Test
    void shouldFindByAllFourDirections() {

        List<Tunnel> tunnels = tunnelService.findByArribaAndAbajoAndDerechaAndIzquierda(true, true, true, true);
        assertFalse(tunnels.isEmpty());
        assertTrue(tunnels.stream().anyMatch(t -> t.getId() == 34));
    }

    @Test
    void shouldFindByThreeDirections() {
        List<Tunnel> tunnels = tunnelService.findByArribaAndAbajoAndDerecha(true, true, true);
        assertFalse(tunnels.isEmpty());
        assertTrue(tunnels.stream().allMatch(t -> t.isArriba() && t.isAbajo() && t.isDerecha()));
    }

    @Test
    void shouldFindByTwoDirectionsCorners() {
        List<Tunnel> tunnels = tunnelService.findByArribaAndIzquierda(true, true);
        assertFalse(tunnels.isEmpty());
        assertTrue(tunnels.stream().allMatch(t -> t.isArriba() && t.isIzquierda()));
    }

    @Test
    void shouldFindByArriba() {
        List<Tunnel> tunnels = tunnelService.findByArriba(true);
        assertNotNull(tunnels);
        assertTrue(tunnels.stream().allMatch(Tunnel::isArriba));
    }

    @Test
    void shouldFindByAbajo() {
        List<Tunnel> tunnels = tunnelService.findByAbajo(true);
        assertNotNull(tunnels);
        assertTrue(tunnels.stream().allMatch(Tunnel::isAbajo));
    }

    @Test
    void shouldFindByIzquierda() {
        List<Tunnel> tunnels = tunnelService.findByIzquierda(true);
        assertNotNull(tunnels);
        assertTrue(tunnels.stream().allMatch(Tunnel::isIzquierda));
    }

    @Test
    void shouldFindByArribaAndDerecha() {
        List<Tunnel> tunnels = tunnelService.findByArribaAndDerecha(true, true);
        assertFalse(tunnels.isEmpty());
        assertTrue(tunnels.stream().allMatch(t -> t.isArriba() && t.isDerecha()));
    }

    @Test
    void shouldFindByAbajoAndDerecha() {
        List<Tunnel> tunnels = tunnelService.findByAbajoAndDerecha(true, true);
        assertNotNull(tunnels);
    }

    @Test
    void shouldFindByAbajoAndIzquierda() {
        List<Tunnel> tunnels = tunnelService.findByAbajoAndIzquierda(true, true);
        assertNotNull(tunnels);
    }

    @Test
    void shouldFindByDerechaAndIzquierda() {
        List<Tunnel> tunnels = tunnelService.findByDerechaAndIzquierda(true, true);
        assertNotNull(tunnels);
    }

    @Test
    void shouldFindByArribaAndAbajoAndIzquierda() {
        List<Tunnel> tunnels = tunnelService.findByArribaAndAbajoAndIzquierda(true, true, true);
        assertNotNull(tunnels);
    }

    @Test
    void shouldFindByArribaAndDerechaAndIzquierda() {
        List<Tunnel> tunnels = tunnelService.findByArribaAndDerechaAndIzquierda(true, true, true);
        assertNotNull(tunnels);
    }

    @Test
    void shouldFindByAbajoAndDerechaAndIzquierda() {
        List<Tunnel> tunnels = tunnelService.findByAbajoAndDerechaAndIzquierda(true, true, true);
        assertNotNull(tunnels);
    }
}