package es.us.dp1.l4_04_24_25.saboteur.log;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;

@SpringBootTest
@AutoConfigureTestDatabase
class LogServiceTests {

    @Autowired
    private LogService logService;

    @Test
    @Transactional
    void shouldSaveLog() {
        Log log = new Log();
        List<String> msgs = new ArrayList<>();
        msgs.add("Game started");
        log.setMessages(msgs);

        Log savedLog = this.logService.saveLog(log);
        
        assertNotNull(savedLog.getId());
        assertEquals(1, savedLog.getMessages().size());
    }

    @Test
    @Transactional
    void shouldFindLogById() {
        
        Log log = new Log();
        log.setMessages(List.of("Test Message"));
        Log savedLog = this.logService.saveLog(log);

        Log foundLog = this.logService.findLog(savedLog.getId());
        assertEquals(savedLog.getId(), foundLog.getId());
    }

    @Test
    void shouldThrowExceptionWhenFindingNonExistingLog() {
        assertThrows(ResourceNotFoundException.class, () -> this.logService.findLog(999999));
    }

    @Test
    @Transactional
    void shouldFindAllLogs() {
        
        Log log1 = new Log();
        log1.setMessages(List.of("Msg 1"));
        this.logService.saveLog(log1);

        Log log2 = new Log();
        log2.setMessages(List.of("Msg 2"));
        this.logService.saveLog(log2);

        List<Log> logs = (List<Log>) this.logService.findAll();
        assertTrue(logs.size() >= 2);
    }

    @Test
    @Transactional
    void shouldUpdateLog() {
        
        Log log = new Log();
        log.setMessages(new ArrayList<>(List.of("Original Message")));
        Log savedLog = this.logService.saveLog(log);

        savedLog.getMessages().add("New Message");
        Log updatedLog = this.logService.updateLog(savedLog, savedLog.getId());

        assertEquals(2, updatedLog.getMessages().size());
        assertTrue(updatedLog.getMessages().contains("New Message"));
    }

    @Test
    @Transactional
    void shouldDeleteLog() {
       
        Log log = new Log();
        log.setMessages(List.of("To be deleted"));
        Log savedLog = this.logService.saveLog(log);
        Integer id = savedLog.getId();

        this.logService.deleteLog(id);

        assertThrows(ResourceNotFoundException.class, () -> this.logService.findLog(id));
    }
}