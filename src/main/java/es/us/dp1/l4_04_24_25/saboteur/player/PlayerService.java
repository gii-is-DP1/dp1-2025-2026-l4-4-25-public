package es.us.dp1.l4_04_24_25.saboteur.player;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.transaction.Transactional;

@Service
public class PlayerService {

    private PlayerRepository playerRepository;

    @Autowired
    public PlayerService(PlayerRepository playerRepository) {
        this.playerRepository = playerRepository;
    }

    @Transactional
    public Player savePlayer(Player player) {
        playerRepository.save(player);
        return player;
    }

    @Transactional
    public Player findPlayer(Integer id) {
        return playerRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Player","id",id));
    }

    @Transactional
    public Iterable<Player> findAll(){
        return playerRepository.findAll();
    }


    @Transactional
    public Player updatePlayer(Player player, Integer idToUpdate){
        Player toUpdate = findPlayer(idToUpdate);
        BeanUtils.copyProperties(player, toUpdate,"id");
        playerRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deletePlayer(Integer id) {
        Player toDelete = findPlayer(id);
        playerRepository.delete(toDelete);
    }

    @Transactional
    public Player findByUsername(String username) {
        return playerRepository.findByUsername(username).orElseThrow(()-> new ResourceNotFoundException("Player","username",username));
    }

    @Transactional
    public Player findByGameIdAndUsername(Integer gameId, String username) {
        return playerRepository.findByGameIdAndUsername(gameId, username).orElseThrow(()-> new ResourceNotFoundException("Player","gameId and username",gameId + " and " + username));
    }

    @Transactional
    public Iterable<Player> findAllByGameId(Integer gameId) {
        return playerRepository.findAllByGameId(gameId);
    }

    
    
}
