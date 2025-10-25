package es.us.dp1.l4_04_24_25.saboteur.round;

import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.board.BoardService;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;

@Service
public class RoundService {
    
    private RoundRepository roundRepository;
    private BoardService boardService;
    private GameService gameService;


    @Autowired
    public RoundService(RoundRepository roundRepository, BoardService boardService, GameService gameService) {
        this.roundRepository = roundRepository;
        this.boardService = boardService;
        this.gameService = gameService;
    }

    @Transactional
    public Round saveRound(Round round) {
        roundRepository.save(round);
        return round;
    }

    @Transactional (readOnly = true)
    public Round findRound(Integer id) {
        return roundRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Round","id",id));
    }

    @Transactional (readOnly = true)
    public Iterable<Round> findAll(){
        return roundRepository.findAll();
    }

    @Transactional
    public Round updateRound(Round round, Integer idToUpdate){
        Round toUpdate = findRound(idToUpdate);
        BeanUtils.copyProperties(round, toUpdate,"id");
        roundRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deleteRound(Integer id) {
        Round toDelete = findRound(id);
        roundRepository.delete(toDelete);
    }

    @Transactional(readOnly = true)
    public Round patchRoundBoard(Integer id, Map<String, Object> updates) {
        Round round = findRound(id);
        if (updates.containsKey("board")){
            Integer boardId = (Integer) updates.get("board");
            Board board = boardService.findBoard(boardId);
            round.setBoard(board);
        }
        return roundRepository.save(round);
    }
    @Transactional
    public Round patchRound(Integer id, Map<String, Object> updates) {
    Round round = findRound(id);
    if (updates.containsKey("game")) {
        Integer gameId = (Integer) updates.get("game");
        Game game = gameService.findGame(gameId);
        round.setGame(game); // actualiza FK, lado propietario
    }
    return roundRepository.save(round);
}

}