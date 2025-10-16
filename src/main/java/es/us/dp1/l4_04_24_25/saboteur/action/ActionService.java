package es.us.dp1.l4_04_24_25.saboteur.action;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.card.effectValue;
import jakarta.validation.Valid;

@Service
public class ActionService {
    
    private final ActionRepository actionRepository;

    @Autowired
    public ActionService(ActionRepository actionRepository) {
        this.actionRepository = actionRepository;
    }


    @Transactional
    public Action saveAction(@Valid Action action) {
        actionRepository.save(action);
        return action;
    }

    @Transactional(readOnly = true)
    public Action findAction(Integer id) {
        return actionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Action", "id", id));
    }

    @Transactional(readOnly = true)
    public Iterable<Action> findAll() {
        return actionRepository.findAll();
    }

    @Transactional
    public Action updateAction(@Valid Action action, Integer idToUpdate) {
        Action toUpdate = findAction(idToUpdate);
        BeanUtils.copyProperties(action, toUpdate, "id");
        actionRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deleteAction(Integer id) {
        Action toDelete = findAction(id);
        actionRepository.delete(toDelete);
    }

    @Transactional(readOnly = true)
    public Iterable<Action> findByNameAction(nameAction nameAction) {
        return actionRepository.findByNameAction(nameAction);
    }

    @Transactional(readOnly = true)
    public Iterable<Action> findByEffectValue(effectValue effectValue) {
        return actionRepository.findByEffectValue(effectValue);
    }

    @Transactional(readOnly = true)
    public Iterable<Action> findByObjectAffect(boolean objectAffect) {
        return actionRepository.findByObjectAffect(objectAffect);
    }
    
    @Transactional(readOnly = true)
    public Iterable<Action> findByNameActionAndObjectAffect(nameAction nameAction, boolean objectAffect) {
        return actionRepository.findByNameActionAndObjectAffect(nameAction, objectAffect);
    }
}