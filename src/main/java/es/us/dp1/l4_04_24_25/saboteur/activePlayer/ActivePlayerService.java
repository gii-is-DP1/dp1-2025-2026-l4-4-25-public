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
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.message.Message;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageService;
import jakarta.validation.Valid;

@Service
public class ActivePlayerService {
    
    private ActivePlayerRepository activePlayerRepository;
    private DeckService deckService;
    private GameService gameService;
    private MessageService messageService;

    
    @Autowired
    public ActivePlayerService(ActivePlayerRepository activePlayerRepository, DeckService deckService, GameService gameService, MessageService messageService) {
        this.activePlayerRepository = activePlayerRepository;
        this.deckService = deckService;
        this.gameService = gameService;
        this.messageService = messageService;
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
    ActivePlayer ap = findActivePlayer(id);

    // 1. Si tiene deck vinculado, desvincula ambas caras
    Deck deck = ap.getDeck();
    if (deck != null) {
        deck.setActivePlayer(null);
        ap.setDeck(null);
        deckService.saveDeck(deck);  // opcional si quieres persistir la desvinculación
    }

    // 2. Si tiene partidas como creador/ganador, poner a null esas referencias
    for (Game g : new ArrayList<>(ap.getCreatedGames())) {
        g.setCreator(null);
        gameService.saveGame(g);  // o repository.save
    }
    for (Game g : new ArrayList<>(ap.getWonGame())) {
        g.setWinner(null);
        gameService.saveGame(g);
    }

    // 3. Borrar los mensajes asociados o reasignarlos
    for (Message m : new ArrayList<>(ap.getMessages())) {
        m.setActivePlayer(null);
        messageService.saveMessage(m);
    }

    activePlayerRepository.delete(ap);
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
