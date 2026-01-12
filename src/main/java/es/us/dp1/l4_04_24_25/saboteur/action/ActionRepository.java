package es.us.dp1.l4_04_24_25.saboteur.action;

import java.util.List;
import org.springframework.data.repository.CrudRepository;
import es.us.dp1.l4_04_24_25.saboteur.card.effectValue;

public interface ActionRepository extends CrudRepository<Action, Integer> {
    
    List<Action> findByNameAction(nameAction nameAction);

    List<Action> findByEffectValue(effectValue effectValue);

    // Para buscar acciones por objeto afectado (true para tablero, false para jugador)
    List<Action> findByObjectAffect(boolean objectAffect);

    // Combinación por nombre y objeto afectado
    List<Action> findByNameActionAndObjectAffect(nameAction nameAction, boolean objectAffect);
}