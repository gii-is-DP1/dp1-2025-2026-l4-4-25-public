package es.us.dp1.l4_04_24_25.saboteur.tunnel;

import java.util.List;
import org.springframework.data.repository.CrudRepository;

public interface TunnelRepository extends CrudRepository<Tunnel, Integer> {

    List<Tunnel> findByRotacion(boolean rotacion);
    List<Tunnel> findByArriba(boolean arriba);
    List<Tunnel> findByAbajo(boolean abajo);
    List<Tunnel> findByDerecha(boolean derecha);
    List<Tunnel> findByIzquierda(boolean izquierda);
    
    List<Tunnel> findByArribaAndAbajo(boolean arriba, boolean abajo);
    
    List<Tunnel> findByArribaAndDerecha(boolean arriba, boolean derecha);

    List<Tunnel> findByArribaAndIzquierda(boolean arriba, boolean izquierda);

    List<Tunnel> findByAbajoAndDerecha(boolean abajo, boolean derecha);

    List<Tunnel> findByAbajoAndIzquierda(boolean abajo, boolean izquierda);
    
    List<Tunnel> findByDerechaAndIzquierda(boolean derecha, boolean izquierda);

    List<Tunnel> findByArribaAndAbajoAndDerecha(boolean arriba, boolean abajo, boolean derecha);

    List<Tunnel> findByArribaAndAbajoAndIzquierda(boolean arriba, boolean abajo, boolean izquierda);

    List<Tunnel> findByArribaAndDerechaAndIzquierda(boolean arriba, boolean derecha, boolean izquierda);

    List<Tunnel> findByAbajoAndDerechaAndIzquierda(boolean abajo, boolean derecha, boolean izquierda);

    List<Tunnel> findByArribaAndAbajoAndDerechaAndIzquierda(boolean arriba, boolean abajo, boolean derecha, boolean izquierda);
}