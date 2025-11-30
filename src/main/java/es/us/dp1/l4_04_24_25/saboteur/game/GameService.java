package es.us.dp1.l4_04_24_25.saboteur.game;

import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;

@Service
public class GameService {
    
    private GameRepository gameRepository;

    @Autowired
    public GameService(GameRepository gameRepository) {
        this.gameRepository = gameRepository;
    }

    @Transactional
    public Game saveGame(Game game)  throws DataAccessException{
        gameRepository.save(game);
        return game;
    }

    @Transactional(readOnly = true)
    public Game findGame(Integer id) {
        return gameRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Game","id",id));
        
    }

    @Transactional(readOnly = true)
    public Iterable<Game> findAll(){
        return gameRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Iterable<Game> findAllByActivePlayerId(Integer activePlayerId) {
        return gameRepository.findAllByActivePlayerId(activePlayerId);
    }

    @Transactional
    public Game updateGame(@Valid Game game, Integer idToUpdate){
        Game toUpdate = findGame(idToUpdate);
        BeanUtils.copyProperties(game, toUpdate,"id");
        gameRepository.save(toUpdate);
        return toUpdate;
    }


    @Transactional
    public void deleteGame(Integer id) {
        Game toDelete = findGame(id);
        gameRepository.delete(toDelete);
    }

    @Transactional(readOnly = true)
    public Game findByLink(String link) {
        return gameRepository.findByLink(link).orElseThrow(()-> new ResourceNotFoundException("Game","link",link));
    }

    @Transactional(readOnly = true)
    public List<Game> findByCreator(String creatorUsername) {
        List<Game> games = gameRepository.findByCreatorUsername(creatorUsername);
        if (games.isEmpty()) {
            throw new ResourceNotFoundException("Game", "creator username", creatorUsername);
        }
        return games;
}

    /* 
    @Transactional(readOnly = true)
    public Iterable<Game> findAllByAdminUsername(String adminUsername) {
        return gameRepository.findAllByAdminUsername(adminUsername);
    }
*/
    @Transactional(readOnly = true)
    public Iterable<Game> findAllPublicGames() {
        return gameRepository.findAllPublicGames();
    }

    @Transactional(readOnly = true)
    public Iterable<Game> findAllPrivateGames() {
        return gameRepository.findAllPrivateGames();
    }

    public boolean existsByLink(String link) {
        return gameRepository.existsByLink(link);
    }

    
    
}
