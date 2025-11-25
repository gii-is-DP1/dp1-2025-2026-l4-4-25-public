package es.us.dp1.l4_04_24_25.saboteur.player;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.achievements.AchievementService;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckService;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.message.Message;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class PlayerService {

    private final PlayerRepository playerRepository;
    private final GameService gameService;
    private final AchievementService achievementService;
    private final DeckService deckService;
    private final MessageService messageService;
    
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public PlayerService(PlayerRepository playerRepository,
                         GameService gameService,
                         AchievementService achievementService,
                         DeckService deckService,
                         MessageService messageService) {
        this.playerRepository = playerRepository;
        this.gameService = gameService;
        this.achievementService = achievementService;
        this.deckService = deckService;
        this.messageService = messageService;
    }

    @Transactional
    public Player savePlayer(Player player) {
        playerRepository.save(player);
        return player;
    }

    @Transactional(readOnly = true)
    public Player findPlayer(Integer id) {
        return playerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Player", "id", id));
    }

    @Transactional(readOnly = true)
    public PlayerDTO findPlayerDTO(Integer id) {
        Player player = playerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Player", "id", id));
        return new PlayerDTO(player.getId(), player.getUsername(), player.getName(), player.getBirthDate(), player.getJoined(), player.getImage(),
            player.getEmail(), player.getAuthority().getAuthority(), player.getPlayedGames(), player.getWonGames(), player.getDestroyedPaths(),
            player.getBuiltPaths(), player.getAcquiredGoldNuggets(), player.getPeopleDamaged(), player.getPeopleRepaired(), player.isWatcher(),
            player.getFriends().stream().map(f -> f.getUsername()).toList(), player.getAccquiredAchievements(), player.getGame());
    }

    @Transactional (readOnly = true)
    public List<PlayerDTO> findAll(){
        Iterable<Player> players = playerRepository.findAll();
        List<PlayerDTO> playerDTOs = new ArrayList<>();
        for (Player p : players) {
            playerDTOs.add(new PlayerDTO(p.getId(),p.getUsername(), p.getName(), p.getBirthDate(), p.getJoined(), p.getImage(), p.getEmail(), p.getAuthority().getAuthority(),
            p.getPlayedGames(), p.getWonGames(), p.getDestroyedPaths(), p.getBuiltPaths(), p.getAcquiredGoldNuggets(), p.getPeopleDamaged(), p.getPeopleRepaired(), p.isWatcher(),
            p.getFriends().stream().map(f->f.getUsername()).toList(), p.getAccquiredAchievements(), p.getGame()));
        }
        return playerDTOs;
    }

    @Transactional (readOnly = true)
    public PlayerDTO findByUsernameDTO(String username) {
        Player player = playerRepository.findByUsername(username).orElseThrow(()-> new ResourceNotFoundException("Player","username",username));
         return new PlayerDTO(player.getId(),player.getUsername(), player.getName(), player.getBirthDate(), player.getJoined(), player.getImage(), player.getEmail(), player.getAuthority().getAuthority(),
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
         return new PlayerDTO(player.getId(),player.getUsername(), player.getName(), player.getBirthDate(), player.getJoined(), player.getImage(), player.getEmail(), player.getAuthority().getAuthority(),
            player.getPlayedGames(), player.getWonGames(), player.getDestroyedPaths(), player.getBuiltPaths(), 
            player.getAcquiredGoldNuggets(), player.getPeopleDamaged(), player.getPeopleRepaired(), player.isWatcher(), player.getFriends().stream().map(f->f.getUsername()).toList(), player.getAccquiredAchievements(), player.getGame());
    }

    @Transactional (readOnly = true)
    public List<PlayerDTO> findAllByGameId(Integer gameId) {
        Iterable<Player> players = playerRepository.findAllByGameId(gameId);
        List<PlayerDTO> playersDTO = new ArrayList<>();
        for(Player p : players) {
            playersDTO.add(new PlayerDTO(p.getId(),p.getUsername(), p.getName(), p.getBirthDate(), p.getJoined(), p.getImage(), p.getEmail(), p.getAuthority().getAuthority(),
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
        return new PlayerDTO(player.getId(),player.getUsername(), player.getName(), player.getBirthDate(), player.getJoined(), player.getImage(), player.getEmail(), player.getAuthority().getAuthority(),
            player.getPlayedGames(), player.getWonGames(), player.getDestroyedPaths(), player.getBuiltPaths(), 
            player.getAcquiredGoldNuggets(), player.getPeopleDamaged(), player.getPeopleRepaired(), player.isWatcher(), player.getFriends().stream().map(f->f.getUsername()).toList(), player.getAccquiredAchievements(), player.getGame());
    }

    @Transactional
    public void deletePlayer(Integer id) {
        Player toDelete = findPlayer(id);
        Integer userId = toDelete.getId();
        boolean isActivePlayer = toDelete instanceof ActivePlayer;

        detachCommonRelationships(toDelete);

        if (isActivePlayer) {
            detachActivePlayerRelationships((ActivePlayer) toDelete);
        }
        entityManager.flush();
        entityManager.clear();
        
        if (isActivePlayer) {
            entityManager.createNativeQuery("DELETE FROM active_player WHERE id = :id")
                .setParameter("id", userId)
                .executeUpdate();
        }
        
        entityManager.createNativeQuery("DELETE FROM player WHERE id = :id")
            .setParameter("id", userId)
            .executeUpdate();
    }

    @Transactional
    public Player patchPlayer(Integer id, Map<String, Object> updates) {
        Player player = findPlayer(id);
        if (updates.containsKey("game")) {
            Integer gameId = (Integer) updates.get("game");
            Game game = gameService.findGame(gameId);
            player.setGame(game);
        }
        return playerRepository.save(player);
    }

    @Transactional
    public Player patchPlayerAchievement(Integer id, Map<String, Object> updates) {
        Player player = findPlayer(id);
        if (updates.containsKey("accquiredAchievements")) {
            Integer achievementId = (Integer) updates.get("accquiredAchievements");
            Achievement achievement = achievementService.findAchievement(achievementId);
            player.getAccquiredAchievements().add(achievement);
        }
        return playerRepository.save(player);
    }

    @Transactional
    public Player addFriend (Integer id, Integer friendId) {
        Player player = findPlayer(id);
        Player friend = findPlayer(friendId);

        if(id.equals(friendId)) {
            throw new IllegalArgumentException("A player cannot add themselves as a friend.");
        }
        
        player.getFriends().add(friend);
        friend.getFriends().add(player);
        return playerRepository.save(player);
    }

    @Transactional
    public Player removeFriend (Integer id, Integer friendId) {
        Player player = findPlayer(id);
        Player friend = findPlayer(friendId);
            if (player.getFriends().contains(friend) && friend.getFriends().contains(player)) {
                player.getFriends().remove(friend);
                friend.getFriends().remove(player);
            }
        return playerRepository.save(player);
        
        }    
    




    private void detachCommonRelationships(Player player) {
        for (Player friend : new ArrayList<>(player.getFriends())) {
            friend.getFriends().remove(player);
        }
        player.getFriends().clear();

        for (Achievement achievement : new ArrayList<>(player.getAccquiredAchievements())) {
            achievement.getPlayers().remove(player);
        }
        player.getAccquiredAchievements().clear();

        Game game = player.getGame();
        if (game != null) {
            game.getWatchers().remove(player);
            player.setGame(null);
        }
    }

    private void detachActivePlayerRelationships(ActivePlayer activePlayer) {
        Deck deck = activePlayer.getDeck();
        if (deck != null) {
            deck.setActivePlayer(null);
            activePlayer.setDeck(null);
            deckService.saveDeck(deck);
        }

        for (Game created : new ArrayList<>(activePlayer.getCreatedGames())) {
            created.setCreator(null);
            gameService.saveGame(created);
        }
        activePlayer.getCreatedGames().clear();

        for (Game won : new ArrayList<>(activePlayer.getWonGame())) {
            won.setWinner(null);
            gameService.saveGame(won);
        }
        activePlayer.getWonGame().clear();

        Iterable<Game> gamesWithActivePlayer = gameService.findAllByActivePlayerId(activePlayer.getId());
        for (Game game : gamesWithActivePlayer) {
            if (game.getActivePlayers().remove(activePlayer)) {
                gameService.saveGame(game);
            }
        }

        for (Message message : new ArrayList<>(activePlayer.getMessages())) {
            message.setActivePlayer(null);
            messageService.saveMessage(message);
        }
        activePlayer.getMessages().clear();
    }
    
    
}
