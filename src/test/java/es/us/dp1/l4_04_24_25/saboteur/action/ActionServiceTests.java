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
import org.springframework.test.context.jdbc.Sql; 

import es.us.dp1.l4_04_24_25.saboteur.card.effectValue; 
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckService; 
import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.action.nameAction;


@SpringBootTest
@AutoConfigureTestDatabase
class ActionServiceTests {

    @Autowired
    private ActionService actionService;
    
    @Autowired
    private DeckService deckService; 

    private static final int TEST_ACTION_ID = 25; 


    @Test
    @Transactional
    void shouldFindAllActions() {
        List<Action> actions = (List<Action>) this.actionService.findAll();
        assertTrue(actions.size() == 30); 
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
    @Sql(statements = "ALTER SEQUENCE entity_sequence RESTART WITH 1000") 
    void shouldInsertAction() {
        int initialCount = ((Collection<Action>) this.actionService.findAll()).size();
        
        Action newAction = new Action();
        newAction.setNameAction(nameAction.DESTROY);
        newAction.setEffectValue(effectValue.DESTROY_LAMP);
        newAction.setObjectAffect(true); 
        newAction.setStatus(true);
        newAction.setImage("action_test_insert.png");
        
        Deck deckRef = deckService.findDeck(1);
        newAction.setDeck(deckRef);

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
        
        assertFalse(action.isObjectAffect()); 

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
    void shouldFindActionsByNameActionRepair() {
    
        List<Action> actions = (List<Action>)this.actionService.findByNameAction(nameAction.REPAIR);
        
        assertTrue(actions.size() == 12, "Debe haber 12 Action de tipo REPAIR.");
        assertEquals(nameAction.REPAIR, actions.get(0).getNameAction());
    }

     @Test
    void shouldFindActionsByNameActionDestroy() {
    
        List<Action> actions = (List<Action>)this.actionService.findByNameAction(nameAction.DESTROY);
        
        assertTrue(actions.size() == 12, "Debe haber 12 Action de tipo DESTROY.");
        assertEquals(nameAction.DESTROY, actions.get(0).getNameAction());
    }

    @Test
    void shouldFindActionsByEffectValue() {
        
        List<Action> actions = (List<Action>)this.actionService.findByEffectValue(effectValue.REPAIR_PICKAXE);
    
        assertTrue(actions.size() == 3, "Debe haber 3 Action con el efecto REPAIR_PICKAXE.");
        assertEquals(effectValue.REPAIR_PICKAXE, actions.get(0).getEffectValue());
    }

    @Test
    void shouldFindActionsByObjectAffect() {
        
        List<Action> actions = (List<Action>)this.actionService.findByObjectAffect(false);
        
        assertTrue(actions.size() == 27, "Debe haber 27 Action que afecten al jugador.");
        assertFalse(actions.get(0).isObjectAffect());
    }
    
}