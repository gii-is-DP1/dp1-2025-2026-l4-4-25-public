package es.us.dp1.l4_04_24_25.saboteur.action;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import java.util.Collection;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.card.effectValue; 
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckService; 
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;

import io.qameta.allure.Epic;
import io.qameta.allure.Feature;
import io.qameta.allure.Owner;

@Epic("Card Module")
@Feature("Action Card Management")
@Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
class ActionServiceTests {

    @Autowired
    private ActionService actionService;
    
    @Autowired
    private DeckService deckService; 

    private static final int TEST_ACTION_ID = 200; 

    @Test
    @Transactional
    void shouldFindAllActions() {
        List<Action> actions = (List<Action>) this.actionService.findAll();
        assertTrue(actions.size() >= 1); 
    }

    @Test
    void shouldFindActionById() {
        Action action = this.actionService.findAction(TEST_ACTION_ID);
        assertNotNull(action);
        assertEquals(TEST_ACTION_ID, action.getId());
    }

    @Test
    void shouldThrowExceptionWhenFindingNonExistingAction() {
        assertThrows(ResourceNotFoundException.class, () -> this.actionService.findAction(99999));
    }
    
    @Test
    @Transactional
    void shouldInsertAction() {
        int initialCount = ((Collection<Action>) this.actionService.findAll()).size();
        
        Action newAction = new Action();
        newAction.setNameAction(nameAction.DESTROY);
        newAction.setEffectValue(effectValue.DESTROY_LAMP);
        newAction.setObjectAffect(true); 
        newAction.setStatus(true);
        newAction.setImage("action_destroy_lamp.png");
        newAction.setDeck(deckService.findDeck(1)); 

        Action savedAction = this.actionService.saveAction(newAction);
        
        assertNotNull(savedAction.getId());
        assertEquals(nameAction.DESTROY, savedAction.getNameAction());
        
        int finalCount = ((Collection<Action>) this.actionService.findAll()).size();
        assertEquals(initialCount + 1, finalCount);
    }
    
    @Test
    @Transactional
    void shouldUpdateAction() {
        boolean newObjectAffect = true; 
        
        Action action = this.actionService.findAction(TEST_ACTION_ID); 
        action.setObjectAffect(newObjectAffect);

        Action updatedAction = this.actionService.updateAction(action, TEST_ACTION_ID);
        
        assertEquals(newObjectAffect, updatedAction.isObjectAffect());
    }
    
    @Test
    @Transactional
    void shouldDeleteAction() {
        Action action = this.actionService.findAction(TEST_ACTION_ID);
        assertNotNull(action);

        this.actionService.deleteAction(TEST_ACTION_ID);
        
        assertThrows(ResourceNotFoundException.class, () -> this.actionService.findAction(TEST_ACTION_ID));
    }


    @Test
    void shouldFindActionsByNameAction() {
     
        Iterable<Action> actions = this.actionService.findByNameAction(nameAction.REPAIR);
        List<Action> list = (List<Action>) actions;
        
        assertTrue(list.size() >= 1);
        assertEquals(nameAction.REPAIR, list.get(0).getNameAction());
    }

    @Test
    void shouldFindActionsByEffectValue() {
       
        Iterable<Action> actions = this.actionService.findByEffectValue(effectValue.REPAIR_PICKAXE);
        List<Action> list = (List<Action>) actions;
        
        assertTrue(list.size() >= 1);
        assertEquals(effectValue.REPAIR_PICKAXE, list.get(0).getEffectValue());
    }

    @Test
    void shouldFindActionsByObjectAffect() {
       
        Iterable<Action> actions = this.actionService.findByObjectAffect(false);
        List<Action> list = (List<Action>) actions;
        
        assertTrue(list.size() >= 1);
        assertFalse(list.get(0).isObjectAffect());
    }
    
    @Test
    void shouldFindActionsByNameActionAndObjectAffect() {
       
        Iterable<Action> actions = this.actionService.findByNameActionAndObjectAffect(nameAction.REPAIR, false);
        List<Action> list = (List<Action>) actions;
        
        assertTrue(list.size() >= 1);
        assertEquals(nameAction.REPAIR, list.get(0).getNameAction());
        assertFalse(list.get(0).isObjectAffect());
    }
}