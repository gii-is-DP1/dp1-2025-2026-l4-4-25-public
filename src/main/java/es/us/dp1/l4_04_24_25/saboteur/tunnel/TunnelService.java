package es.us.dp1.l4_04_24_25.saboteur.tunnel;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;

@Service
public class TunnelService {
    
    private final TunnelRepository tunnelRepository;

    @Autowired
    public TunnelService(TunnelRepository tunnelRepository) {
        this.tunnelRepository = tunnelRepository;
    }

    @Transactional
    public Tunnel saveTunnel(@Valid Tunnel tunnel) {
        tunnelRepository.save(tunnel);
        return tunnel;
    }

    @Transactional(readOnly = true)
    public Tunnel findTunnel(Integer id) {
        return tunnelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tunnel", "id", id));
    }

    @Transactional(readOnly = true)
    public Iterable<Tunnel> findAll() {
        return (List<Tunnel>) tunnelRepository.findAll();
    }

    @Transactional
    public Tunnel updateTunnel(@Valid Tunnel tunnel, Integer idToUpdate) {
        Tunnel toUpdate = findTunnel(idToUpdate);
        BeanUtils.copyProperties(tunnel, toUpdate, "id"); 
        tunnelRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deleteTunnel(Integer id) {
        Tunnel toDelete = findTunnel(id);
        tunnelRepository.delete(toDelete);
    }
    
    
    @Transactional(readOnly = true)
    public List<Tunnel> findByRotacion(boolean rotacion) {
        return tunnelRepository.findByRotacion(rotacion);
    }

    @Transactional(readOnly = true)
    public List<Tunnel> findByArriba(boolean arriba) {
        return tunnelRepository.findByArriba(arriba);
    }

    @Transactional(readOnly = true)
    public List<Tunnel> findByAbajo(boolean abajo) {
        return tunnelRepository.findByAbajo(abajo);
    }

    @Transactional(readOnly = true)
    public List<Tunnel> findByDerecha(boolean derecha) {
        return tunnelRepository.findByDerecha(derecha);
    }

    @Transactional(readOnly = true)
    public List<Tunnel> findByIzquierda(boolean izquierda) {
        return tunnelRepository.findByIzquierda(izquierda);
    }
  
    @Transactional(readOnly = true)
    public List<Tunnel> findByArribaAndAbajo(boolean arriba, boolean abajo) {
        return tunnelRepository.findByArribaAndAbajo(arriba, abajo);
    }

    @Transactional(readOnly = true)
    public List<Tunnel> findByArribaAndDerecha(boolean arriba, boolean derecha) {
        return tunnelRepository.findByArribaAndDerecha(arriba, derecha);
    }

    @Transactional(readOnly = true)
    public List<Tunnel> findByArribaAndIzquierda(boolean arriba, boolean izquierda) {
        return tunnelRepository.findByArribaAndIzquierda(arriba, izquierda);
    }

    @Transactional(readOnly = true)
    public List<Tunnel> findByAbajoAndDerecha(boolean abajo, boolean derecha) {
        return tunnelRepository.findByAbajoAndDerecha(abajo, derecha);
    }

    @Transactional(readOnly = true)
    public List<Tunnel> findByAbajoAndIzquierda(boolean abajo, boolean izquierda) {
        return tunnelRepository.findByAbajoAndIzquierda(abajo, izquierda);
    }
    
    @Transactional(readOnly = true)
    public List<Tunnel> findByDerechaAndIzquierda(boolean derecha, boolean izquierda) {
        return tunnelRepository.findByDerechaAndIzquierda(derecha, izquierda);
    }

    
    @Transactional(readOnly = true)
    public List<Tunnel> findByArribaAndAbajoAndDerecha(boolean arriba, boolean abajo, boolean derecha) {
        return tunnelRepository.findByArribaAndAbajoAndDerecha(arriba, abajo, derecha);
    }

    @Transactional(readOnly = true)
    public List<Tunnel> findByArribaAndAbajoAndIzquierda(boolean arriba, boolean abajo, boolean izquierda) {
        return tunnelRepository.findByArribaAndAbajoAndIzquierda(arriba, abajo, izquierda);
    }

    @Transactional(readOnly = true)
    public List<Tunnel> findByArribaAndDerechaAndIzquierda(boolean arriba, boolean derecha, boolean izquierda) {
        return tunnelRepository.findByArribaAndDerechaAndIzquierda(arriba, derecha, izquierda);
    }

    @Transactional(readOnly = true)
    public List<Tunnel> findByAbajoAndDerechaAndIzquierda(boolean abajo, boolean derecha, boolean izquierda) {
        return tunnelRepository.findByAbajoAndDerechaAndIzquierda(abajo, derecha, izquierda);
    }

    
    @Transactional(readOnly = true)
    public List<Tunnel> findByArribaAndAbajoAndDerechaAndIzquierda(boolean arriba, boolean abajo, boolean derecha, boolean izquierda) {
        return tunnelRepository.findByArribaAndAbajoAndDerechaAndIzquierda(arriba, abajo, derecha, izquierda);
    }
}