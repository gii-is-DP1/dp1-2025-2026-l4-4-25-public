package es.us.dp1.l4_04_24_25.saboteur.achievements;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ReflectionUtils;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedAchievementException;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedActivePlayerException;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/achievements")
@SecurityRequirement(name = "bearerAuth")
public class AchievementRestController {

    private final AchievementService achievementService;

    @Autowired
    public AchievementRestController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public ResponseEntity<List<Achievement>> findAll(){
        List<Achievement> res;
        res = (List<Achievement>) achievementService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Achievement> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(achievementService.findAchievement(id), HttpStatus.OK);
    }
    

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Achievement> create(@RequestBody @Valid Achievement achievement) throws DataAccessException, DuplicatedAchievementException {
        
        if (achievementService.existsByTittle(achievement.getTittle())){
            throw new DuplicatedActivePlayerException("An achievement with tittle '" + achievement.getTittle() + "' already exists"); 
        }

        Achievement newAchievement = new Achievement();
        newAchievement.setTittle(achievement.getTittle());
        newAchievement.setDescription(achievement.getDescription());
        newAchievement.setScore(achievement.getScore());
        newAchievement.setCreator(achievement.getCreator());

        Achievement savedAchievement = this.achievementService.saveAchievement(newAchievement);
        return new ResponseEntity<>(savedAchievement, HttpStatus.CREATED);
    }


    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Achievement> update(@PathVariable("id") Integer id, @RequestBody @Valid Achievement achievement){
        RestPreconditions.checkNotNull(achievementService.findAchievement(id), "Achievement", "ID", id);
        return new ResponseEntity<>(achievementService.updateAchievement(achievement, id), HttpStatus.OK);
    }
    
    @PatchMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Achievement> patchAchievement(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Achievement achievement = achievementService.findAchievement(id);

        updates.forEach((k, v) -> {
            Field field = ReflectionUtils.findField(Achievement.class, k);
            
            if (field == null) return; 
            
            field.setAccessible(true);

            try {
                
                if (k.equals("score") && v instanceof Integer) {
                    ReflectionUtils.setField(field, achievement, (Integer) v);
                } 
                
                else if (k.equals("tittle") || k.equals("description")) {
                    ReflectionUtils.setField(field, achievement, (String) v);
                }
                
                else if (k.equals("creator") && v instanceof Map) {
                    // Lógica para buscar el User por ID y asignarlo
                }
                else {
                    ReflectionUtils.setField(field, achievement, v);
                }

            } catch (Exception e) {
                
                throw new RuntimeException("Error applying patch to field " + k, e);
            }
        });

        achievementService.saveAchievement(achievement);
        return ResponseEntity.ok(achievement);
    }


    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(achievementService.findAchievement(id), "Achievement", "ID", id);
        achievementService.deleteAchievement(id);
        return new ResponseEntity<>(new MessageResponse("Achievement deleted!"), HttpStatus.OK);
    }
}