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
import es.us.dp1.l4_04_24_25.saboteur.game.gameStatus;
import es.us.dp1.l4_04_24_25.saboteur.message.Message;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.validation.Valid;

@Service
public class ActivePlayerService {
    
    private ActivePlayerRepository activePlayerRepository;
    private DeckService deckService;
    private GameService gameService;
    private MessageService messageService;
    
    @PersistenceContext
    private EntityManager entityManager;

    
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
    public ActivePlayer findByUsernameInOngoingGame(String username) {
        List<ActivePlayer> players = activePlayerRepository.findAllByUsername(username);
        
        // Buscar el ActivePlayer que está en una partida ONGOING
        for (ActivePlayer ap : players) {
            List<Game> games = (List<Game>) gameService.findAllByActivePlayerId(ap.getId());
            for (Game g : games) {
                if (g.getGameStatus() == gameStatus.ONGOING) {
                    return ap;
                }
            }
        }
        
        // Si no hay ninguno en ONGOING, devolver el más reciente (último de la lista)
        if (!players.isEmpty()) {
            return players.get(players.size() - 1);
        }
        
        throw new ResourceNotFoundException("ActivePlayer", "username", username);
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
        Integer activePlayerId = ap.getId();

        // 1. Desvincular deck
        Deck deck = ap.getDeck();
        if (deck != null) {
            deck.setActivePlayer(null);
            ap.setDeck(null);
            deckService.saveDeck(deck);
        }

        // 2. Desvincular partidas creadas
        for (Game g : new ArrayList<>(ap.getCreatedGames())) {
            g.setCreator(null);
            gameService.saveGame(g);
        }
        ap.getCreatedGames().clear();

        // 3. Desvincular partidas ganadas
        for (Game g : new ArrayList<>(ap.getWonGame())) {
            g.setWinner(null);
            gameService.saveGame(g);
        }
        ap.getWonGame().clear();

        // 4. Desvincular de la tabla many-to-many game_activePlayers
        Iterable<Game> gamesWithActivePlayer = gameService.findAllByActivePlayerId(activePlayerId);
        for (Game game : gamesWithActivePlayer) {
            if (game.getActivePlayers().remove(ap)) {
                gameService.saveGame(game);
            }
        }

        // 5. Desvincular mensajes
        for (Message m : new ArrayList<>(ap.getMessages())) {
            m.setActivePlayer(null);
            messageService.saveMessage(m);
        }
        ap.getMessages().clear();

        // 6. Forzar sincronización y limpiar el contexto de persistencia
        entityManager.flush();
        entityManager.clear();

        // 7. Usar SQL nativo para eliminar SOLO de la tabla active_player
        // manteniendo intactas las tablas player y appusers (User) con el mismo ID
        entityManager.createNativeQuery("DELETE FROM active_player WHERE id = :id")
            .setParameter("id", activePlayerId)
            .executeUpdate();

        // El Player y User permanecen intactos con el MISMO ID
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
