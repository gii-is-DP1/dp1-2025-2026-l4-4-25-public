package es.us.dp1.l4_04_24_25.saboteur.game;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.transaction.Transactional;
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

    @Transactional
    public Game findGame(Integer id) {
        return gameRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Game","id",id));
        
    }

    @Transactional
    public Iterable<Game> findAll(){
        return gameRepository.findAll();
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

    @Transactional
    public Game findByLink(String link) {
        return gameRepository.findByLink(link).orElseThrow(()-> new ResourceNotFoundException("Game","link",link));
    }

    @Transactional
    public Game findByCreator(String creatorUsername) {
        return gameRepository.findByCreatorUsername(creatorUsername).orElseThrow(()-> new ResourceNotFoundException("Game","creator username",creatorUsername));
    }

    @Transactional
    public Iterable<Game> findAllByAdminUsername(String adminUsername) {
        return gameRepository.findAllByAdminUsername(adminUsername);
    }

    @Transactional
    public Iterable<Game> findAllPublicGames() {
        return gameRepository.findAllPublicGames();
    }

    @Transactional
    public Iterable<Game> findAllPrivateGames() {
        return gameRepository.findAllPrivateGames();
    }
    
}
