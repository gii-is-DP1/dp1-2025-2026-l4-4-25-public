package es.us.dp1.l4_04_24_25.saboteur.action;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import es.us.dp1.l4_04_24_25.saboteur.card.effectValue;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;

@ExtendWith(MockitoExtension.class)
class ActionServiceTests {

    @Mock
    private ActionRepository actionRepository;

    @InjectMocks
    private ActionService actionService;

    private Action testAction;
    private Action testAction2;

    @BeforeEach
    void setUp() {
        testAction = new Action();
        testAction.setId(1);
        testAction.setNameAction(nameAction.REPAIR);
        testAction.setEffectValue(effectValue.REPAIR_PICKAXE);
        testAction.setObjectAffect(false);

        testAction2 = new Action();
        testAction2.setId(2);
        testAction2.setNameAction(nameAction.DESTROY);
        testAction2.setEffectValue(effectValue.DESTROY_CART);
        testAction2.setObjectAffect(false);
    }

    @Test
    void shouldFindAllActions() {
     
        List<Action> expectedActions = Arrays.asList(testAction, testAction2);
        when(actionRepository.findAll()).thenReturn(expectedActions);

        Iterable<Action> result = actionService.findAll();

        assertNotNull(result);
        assertEquals(2, ((List<Action>) result).size());
        verify(actionRepository, times(1)).findAll();
    }

    @Test
    void shouldFindActionById() {
       
        when(actionRepository.findById(1)).thenReturn(Optional.of(testAction));

        Action result = actionService.findAction(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
        assertEquals(nameAction.REPAIR, result.getNameAction());
        verify(actionRepository, times(1)).findById(1);
    }

    @Test
    void shouldThrowExceptionWhenFindingNonExistingAction() {
  
        when(actionRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            actionService.findAction(999);
        });
        verify(actionRepository, times(1)).findById(999);
    }

    @Test
    void shouldSaveAction() {
       
        when(actionRepository.save(testAction)).thenReturn(testAction);

        Action result = actionService.saveAction(testAction);

        assertNotNull(result);
        assertEquals(1, result.getId());
        verify(actionRepository, times(1)).save(testAction);
    }

    @Test
    void shouldUpdateAction() {
       
        Action updatedAction = new Action();
        updatedAction.setNameAction(nameAction.OVERTHROW);
        updatedAction.setEffectValue(effectValue.DESTROY_TUNNEL);
        updatedAction.setObjectAffect(true);

        when(actionRepository.findById(1)).thenReturn(Optional.of(testAction));
        when(actionRepository.save(any(Action.class))).thenReturn(updatedAction);

        Action result = actionService.updateAction(updatedAction, 1);

        assertNotNull(result);
        assertEquals(nameAction.OVERTHROW, result.getNameAction());
        assertEquals(effectValue.DESTROY_TUNNEL, result.getEffectValue());
        assertTrue(result.isObjectAffect());
        verify(actionRepository, times(1)).findById(1);
        verify(actionRepository, times(1)).save(any(Action.class));
    }

    @Test
    void shouldDeleteAction() {
        
        when(actionRepository.findById(1)).thenReturn(Optional.of(testAction));

        actionService.deleteAction(1);

        verify(actionRepository, times(1)).findById(1);
        verify(actionRepository, times(1)).delete(testAction);
    }

    @Test
    void shouldFindActionsByNameAction() {
       
        List<Action> expectedActions = Arrays.asList(testAction);
        when(actionRepository.findByNameAction(nameAction.REPAIR)).thenReturn(expectedActions);

        Iterable<Action> result = actionService.findByNameAction(nameAction.REPAIR);

        assertNotNull(result);
        assertEquals(1, ((List<Action>) result).size());
        assertEquals(nameAction.REPAIR, ((List<Action>) result).get(0).getNameAction());
        verify(actionRepository, times(1)).findByNameAction(nameAction.REPAIR);
    }

    @Test
    void shouldFindActionsByEffectValue() {
        
        List<Action> expectedActions = Arrays.asList(testAction);
        when(actionRepository.findByEffectValue(effectValue.REPAIR_PICKAXE)).thenReturn(expectedActions);

        Iterable<Action> result = actionService.findByEffectValue(effectValue.REPAIR_PICKAXE);

        assertNotNull(result);
        assertEquals(1, ((List<Action>) result).size());
        assertEquals(effectValue.REPAIR_PICKAXE, ((List<Action>) result).get(0).getEffectValue());
        verify(actionRepository, times(1)).findByEffectValue(effectValue.REPAIR_PICKAXE);
    }

    @Test
    void shouldFindActionsByObjectAffect() {
    
        List<Action> expectedActions = Arrays.asList(testAction, testAction2);
        when(actionRepository.findByObjectAffect(false)).thenReturn(expectedActions);

       
        Iterable<Action> result = actionService.findByObjectAffect(false);

     
        assertNotNull(result);
        assertEquals(2, ((List<Action>) result).size());
        verify(actionRepository, times(1)).findByObjectAffect(false);
    }

    @Test
    void shouldFindActionsByNameActionAndObjectAffect() {
        
        List<Action> expectedActions = Arrays.asList(testAction);
        when(actionRepository.findByNameActionAndObjectAffect(nameAction.REPAIR, false))
            .thenReturn(expectedActions);

        Iterable<Action> result = actionService.findByNameActionAndObjectAffect(nameAction.REPAIR, false);

        assertNotNull(result);
        assertEquals(1, ((List<Action>) result).size());
        assertEquals(nameAction.REPAIR, ((List<Action>) result).get(0).getNameAction());
        verify(actionRepository, times(1)).findByNameActionAndObjectAffect(nameAction.REPAIR, false);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistingAction() {
        
        when(actionRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            actionService.deleteAction(999);
        });
        verify(actionRepository, never()).delete(any(Action.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistingAction() {
        
        when(actionRepository.findById(999)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            actionService.updateAction(testAction, 999);
        });
        verify(actionRepository, never()).save(any(Action.class));
    }

    @Test
    void shouldReturnEmptyListWhenNoActionsMatchCriteria() {
        
        when(actionRepository.findByNameAction(nameAction.REVEAL)).thenReturn(Arrays.asList());

        Iterable<Action> result = actionService.findByNameAction(nameAction.REVEAL);

        assertNotNull(result);
        assertEquals(0, ((List<Action>) result).size());
        verify(actionRepository, times(1)).findByNameAction(nameAction.REVEAL);
    }
}