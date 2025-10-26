package es.us.dp1.l4_04_24_25.saboteur.achievements;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedAchievementException;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerService;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/achievements")
@SecurityRequirement(name = "bearerAuth")
public class AchievementRestController {

    private final AchievementService achievementService;
    private final UserService userService;
    private final PlayerService playerService;
    private final ObjectMapper objectMapper;

    @Autowired
    public AchievementRestController(AchievementService achievementService, UserService userService, PlayerService playerService, ObjectMapper objectMapper) {
        this.achievementService = achievementService;
        this.userService = userService;
        this.playerService = playerService;
        this.objectMapper = objectMapper;
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
        
        Achievement newAchievement = new Achievement();
        Achievement savedAchievement;
        BeanUtils.copyProperties(achievement, newAchievement, "id", "creator", "players");
        List<Player> players = new ArrayList<>();
        if (achievementService.existsByTittle(achievement.getTittle())){
            throw new DuplicatedAchievementException("An achievement with tittle '" + achievement.getTittle() + "' already exists");
        }

        if(achievement.getPlayers()!=null && !achievement.getPlayers().isEmpty()){
            for (Player player:achievement.getPlayers()){
                Player savedPlayer = playerService.findByUsername(player.getUsername());
                RestPreconditions.checkNotNull(savedPlayer, "Player", "Username",player.getUsername());
                players.add(player);
            }
        }
        User creator = userService.findByUsername(achievement.getCreator().getUsername());
        RestPreconditions.checkNotNull(creator, "CREATOR", "Username",achievement.getCreator().getUsername());
        creator.getCreatedAchievements().add(newAchievement);
        newAchievement.setCreator(creator);
        newAchievement.setPlayers(players);

        savedAchievement = this.achievementService.saveAchievement(newAchievement);
        for (Player player:savedAchievement.getPlayers()){
                player.getAccquiredAchievements().add(savedAchievement);
                playerService.savePlayer(player);
        }
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
    public ResponseEntity<Achievement> patch(@PathVariable("id") Integer id, @RequestBody Map<String, Object> updates) throws JsonMappingException{
        RestPreconditions.checkNotNull(achievementService.findAchievement(id), "Achievement", "ID", id);
        Achievement achievement = achievementService.findAchievement(id);
        Achievement achievementPatched = objectMapper.updateValue(achievement, updates);
        achievementService.updateAchievement(achievementPatched, id);
        return new ResponseEntity<>(achievementPatched, HttpStatus.OK);
    }

    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(achievementService.findAchievement(id), "Achievement", "ID", id);
        achievementService.deleteAchievement(id);
        return new ResponseEntity<>(new MessageResponse("Achievement deleted!"), HttpStatus.OK);
    }

    @GetMapping("byTittle")
        public ResponseEntity<Achievement> findByTittle(@RequestParam String tittle){
            return new ResponseEntity<>(achievementService.findByTittle(tittle), HttpStatus.OK);
        }
    }
