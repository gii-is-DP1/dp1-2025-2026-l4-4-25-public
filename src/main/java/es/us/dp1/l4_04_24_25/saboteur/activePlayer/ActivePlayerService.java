package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;

@Service
public class ActivePlayerService {
    
    private ActivePlayerRepository activePlayerRepository;

    
    @Autowired
    public ActivePlayerService(ActivePlayerRepository activePlayerRepository) {
        this.activePlayerRepository = activePlayerRepository;
    }

    @Transactional(readOnly = true)
    public Iterable<ActivePlayer> findAll(){
        return activePlayerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public ActivePlayer findActivePlayer(Integer id) {
        return activePlayerRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("ActivePlayer","id",id));
    }

    @Transactional(readOnly = true)
    public ActivePlayer findByUsername(String username) {
        return activePlayerRepository.findByUsername(username).orElseThrow(()-> new ResourceNotFoundException("ActivePlayer","username",username));
    }

    @Transactional(readOnly = true)
    public Iterable<ActivePlayer> findByRol(Boolean rol) {
        return activePlayerRepository.findByRol(rol);
    }

    @Transactional(readOnly = true)
    public Iterable<ActivePlayer> findByPickaxeState(Boolean pickaxeState) {
        return activePlayerRepository.findByPickaxeState(pickaxeState);
    }

    @Transactional(readOnly = true)
    public Iterable<ActivePlayer> findByCandleState(Boolean candleState) {
        return activePlayerRepository.findByCandleState(candleState);
    }

    @Transactional(readOnly = true)
    public Iterable<ActivePlayer> findByCartState(Boolean cartState) {
        return activePlayerRepository.findByPickaxeState(cartState);
    }

    @Transactional(readOnly = true)
    public ActivePlayer findCreatorByGameId(Integer gameId) {
        return activePlayerRepository.findCreatorByGameId(gameId).orElseThrow(()-> new ResourceNotFoundException("GameId","id",gameId));
    }

    /*
    @Transactional(readOnly = true)
    public Iterable<ActivePlayer>  findByGameId(Integer gameId) {
        return activePlayerRepository.findByGameId(gameId);
    }
    */

    @Transactional
    public ActivePlayer saveActivePlayer(ActivePlayer activePlayer)  throws DataAccessException{
        activePlayerRepository.save(activePlayer);
        return activePlayer;
    }

    @Transactional
    public ActivePlayer updateActivePlayer(@Valid ActivePlayer activePlayer, Integer idToUpdate){
        ActivePlayer toUpdate = findActivePlayer(idToUpdate);
        BeanUtils.copyProperties(activePlayer, toUpdate,"id");
        activePlayerRepository.save(toUpdate);
        return toUpdate;
    }


    @Transactional
    public void deleteActivePlayer(Integer id) {
        ActivePlayer toDelete = findActivePlayer(id);
        activePlayerRepository.delete(toDelete);
    }

    /*
    @Transactional(readOnly = true)
    public ActivePlayer findWinnerByGameId(Integer gameId) {
        return activePlayerRepository.findWinnerByGameId(gameId).orElseThrow(()-> new ResourceNotFoundException("GameId","id",gameId));
    }
    */
}
