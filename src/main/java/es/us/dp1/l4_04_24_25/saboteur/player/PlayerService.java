package es.us.dp1.l4_04_24_25.saboteur.player;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;


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

    @Transactional (readOnly = true)
    public Player findPlayer(Integer id) {
        return playerRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Player","id",id));
    }

    @Transactional (readOnly = true)
    public PlayerDTO findPlayerDTO(Integer id) {
        Player player = playerRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Player","id",id));
        return new PlayerDTO(player.getUsername(), player.getName(), player.getBirthDate(), player.getJoined(), player.getImage(), player.getEmail(), player.getAuthority().getAuthority(),
            player.getPlayedGames(), player.getWonGames(), player.getDestroyedPaths(), player.getBuiltPaths(), 
            player.getAcquiredGoldNuggets(), player.getPeopleDamaged(), player.getPeopleRepaired(), player.isWatcher(), player.getFriends().stream().map(f->f.getUsername()).toList(), player.getAccquiredAchievements(), player.getGame());
    }

    @Transactional (readOnly = true)
    public List<PlayerDTO> findAll(){
        Iterable<Player> players = playerRepository.findAll();
        List<PlayerDTO> playerDTOs = new ArrayList<>();
        for (Player p : players) {
            playerDTOs.add(new PlayerDTO(p.getUsername(), p.getName(), p.getBirthDate(), p.getJoined(), p.getImage(), p.getEmail(), p.getAuthority().getAuthority(),
            p.getPlayedGames(), p.getWonGames(), p.getDestroyedPaths(), p.getBuiltPaths(), p.getAcquiredGoldNuggets(), p.getPeopleDamaged(), p.getPeopleRepaired(), p.isWatcher(),
            p.getFriends().stream().map(f->f.getUsername()).toList(), p.getAccquiredAchievements(), p.getGame()));
        }
        return playerDTOs;
    }

    @Transactional (readOnly = true)
    public PlayerDTO findByUsernameDTO(String username) {
        Player player = playerRepository.findByUsername(username).orElseThrow(()-> new ResourceNotFoundException("Player","username",username));
         return new PlayerDTO(player.getUsername(), player.getName(), player.getBirthDate(), player.getJoined(), player.getImage(), player.getEmail(), player.getAuthority().getAuthority(),
            player.getPlayedGames(), player.getWonGames(), player.getDestroyedPaths(), player.getBuiltPaths(), 
            player.getAcquiredGoldNuggets(), player.getPeopleDamaged(), player.getPeopleRepaired(), player.isWatcher(), player.getFriends().stream().map(f->f.getUsername()).toList(), player.getAccquiredAchievements(), player.getGame());
    }

    @Transactional (readOnly = true)
    public Player findByUsername(String username) {
        return playerRepository.findByUsername(username).orElseThrow(()-> new ResourceNotFoundException("Player","username",username));
    }

    @Transactional (readOnly = true)
    public PlayerDTO findByGameIdAndUsername(Integer gameId, String username) {
        Player player = playerRepository.findByGameIdAndUsername(gameId, username).orElseThrow(()-> new ResourceNotFoundException("Player","gameId and username",gameId + " and " + username));
         return new PlayerDTO(player.getUsername(), player.getName(), player.getBirthDate(), player.getJoined(), player.getImage(), player.getEmail(), player.getAuthority().getAuthority(),
            player.getPlayedGames(), player.getWonGames(), player.getDestroyedPaths(), player.getBuiltPaths(), 
            player.getAcquiredGoldNuggets(), player.getPeopleDamaged(), player.getPeopleRepaired(), player.isWatcher(), player.getFriends().stream().map(f->f.getUsername()).toList(), player.getAccquiredAchievements(), player.getGame());
    }

    @Transactional (readOnly = true)
    public List<PlayerDTO> findAllByGameId(Integer gameId) {
        Iterable<Player> players = playerRepository.findAllByGameId(gameId);
        List<PlayerDTO> playersDTO = new ArrayList<>();
        for(Player p : players) {
            playersDTO.add(new PlayerDTO(p.getUsername(), p.getName(), p.getBirthDate(), p.getJoined(), p.getImage(), p.getEmail(), p.getAuthority().getAuthority(),
            p.getPlayedGames(), p.getWonGames(), p.getDestroyedPaths(), p.getBuiltPaths(), p.getAcquiredGoldNuggets(), p.getPeopleDamaged(), p.getPeopleRepaired(), p.isWatcher(),
            p.getFriends().stream().map(f->f.getUsername()).toList(), p.getAccquiredAchievements(), p.getGame()));
        }
        return playersDTO;
    }

    @Transactional
    public PlayerDTO updatePlayer(Player player, Integer idToUpdate){
        Player toUpdate = findPlayer(idToUpdate);
        BeanUtils.copyProperties(player, toUpdate,"id");
        playerRepository.save(toUpdate);
        return new PlayerDTO(player.getUsername(), player.getName(), player.getBirthDate(), player.getJoined(), player.getImage(), player.getEmail(), player.getAuthority().getAuthority(),
            player.getPlayedGames(), player.getWonGames(), player.getDestroyedPaths(), player.getBuiltPaths(), 
            player.getAcquiredGoldNuggets(), player.getPeopleDamaged(), player.getPeopleRepaired(), player.isWatcher(), player.getFriends().stream().map(f->f.getUsername()).toList(), player.getAccquiredAchievements(), player.getGame());
    }

    @Transactional
    public void deletePlayer(Integer id) {
        Player toDelete = findPlayer(id);
        playerRepository.delete(toDelete);
    }



    
    
}
