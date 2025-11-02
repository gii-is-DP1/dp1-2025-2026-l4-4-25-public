package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckService;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;

@Service
public class ActivePlayerService {
    
    private ActivePlayerRepository activePlayerRepository;
    private DeckService deckService;

    
    @Autowired
    public ActivePlayerService(ActivePlayerRepository activePlayerRepository, DeckService deckService) {
        this.activePlayerRepository = activePlayerRepository;
        this.deckService = deckService;
    }

    @Transactional(readOnly = true)
    public List<ActivePlayer> findAll(){
        Iterable<ActivePlayer> activePlayer =  activePlayerRepository.findAll();
        List<ActivePlayer> res = new ArrayList<>();
        for (ActivePlayer a : activePlayer){
            res.add(a);
        }
        return res;
    }

    @Transactional(readOnly = true)
    public ActivePlayer findActivePlayer(Integer id) {
        return activePlayerRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("ActivePlayer","id",id));
    }

   public Boolean existsActivePlayer(String username) {
		return activePlayerRepository.existsByUsername(username);
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

    @Transactional
    public ActivePlayer patchActivePlayer(Integer id, Map<String, Object> updates) {
    ActivePlayer ap = findActivePlayer(id);
    if (updates.containsKey("deck")) {
        Integer deckId = (Integer) updates.get("deck");
        Deck deck = deckService.findDeck(deckId);
        ap.setDeck(deck); // actualiza FK
    }
    return activePlayerRepository.save(ap);
}
}
