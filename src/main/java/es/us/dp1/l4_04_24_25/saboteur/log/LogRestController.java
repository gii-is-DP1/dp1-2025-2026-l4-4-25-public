package es.us.dp1.l4_04_24_25.saboteur.log;

import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundService;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/logs")
@SecurityRequirement(name = "bearerAuth")
class LogRestController {

    private final LogService logService;
    private final RoundService roundService;
    private final ObjectMapper objectMapper;

    @Autowired
    public LogRestController(LogService logService, RoundService roundService, ObjectMapper objectMapper) {
        this.logService = logService;
        this.roundService = roundService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<Log>> getAllLogs() {
        return new ResponseEntity<>((List<Log>) logService.findAll(), HttpStatus.OK);
    }

    @GetMapping("/{logId}")
    public ResponseEntity<Log> getLogById(@PathVariable Integer logId) {
        Log log = logService.findLog(logId);
        RestPreconditions.checkNotNull(log, "Log", "id", logId);
        return new ResponseEntity<>(log, HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Log> createLog(@Valid @RequestBody Log log) {
        Log newLog = new Log();
        BeanUtils.copyProperties(log, newLog,"id");
        Round round = roundService.findRound(log.getRound().getId());
        RestPreconditions.checkNotNull(round, "Round", "id", log.getRound().getId());
        newLog.setRound(round);
        Log createdLog = logService.saveLog(newLog);
        round.setLog(createdLog);
        roundService.saveRound(round);
        
        return new ResponseEntity<>(createdLog, HttpStatus.CREATED);
    }

    @PatchMapping("/{logId}")
    public ResponseEntity<Log> patchLog(@PathVariable Integer logId, @RequestBody Map<String, Object> updates) {
        Log existingLog = logService.findLog(logId);
        RestPreconditions.checkNotNull(existingLog, "Log", "id", logId);
        if (updates.containsKey("round")) {
            Integer roundId = (Integer) updates.get("round");
            Round round = roundService.findRound(roundId);
            RestPreconditions.checkNotNull(round, "Round", "id", roundId);
            if (!existingLog.getRound().equals(round)){
                existingLog.getRound().setLog(null);
                existingLog.setRound(round);
                round.setLog(existingLog);
            }
        }
        Log updatedLog =logService.saveLog(existingLog);
        roundService.saveRound(existingLog.getRound());
        return new ResponseEntity<>(updatedLog, HttpStatus.OK);
    }

    @DeleteMapping("/{logId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteLog(@PathVariable Integer logId) {
        Log log = logService.findLog(logId);
        RestPreconditions.checkNotNull(log, "Log", "id", logId);
        Round round = log.getRound();
        if (round != null) {
            round.setLog(null);
            roundService.saveRound(round);
        }
        logService.deleteLog(logId);
    }
}