package es.us.dp1.l4_04_24_25.saboteur.round;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map; // Necesario para el PATCH/Map

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.board.BoardRepository;
import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import es.us.dp1.l4_04_24_25.saboteur.card.CardRepository;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.square.Square;
import es.us.dp1.l4_04_24_25.saboteur.square.SquareRepository;
import es.us.dp1.l4_04_24_25.saboteur.square.type;
import jakarta.validation.Valid;

@Service
public class RoundService {

    private final RoundRepository roundRepository;
    private final BoardRepository boardRepository;
    private final SquareRepository squareRepository;
    private final CardRepository cardRepository; 

    @Autowired
    public RoundService(RoundRepository roundRepository, BoardRepository boardRepository,
                        SquareRepository squareRepository,
                        CardRepository cardRepository) {
        this.roundRepository = roundRepository;
        this.boardRepository = boardRepository;
        this.squareRepository = squareRepository;
        this.cardRepository = cardRepository;
    }

    @Transactional
    public Round saveRound(@Valid Round round) throws DataAccessException {
        roundRepository.save(round);
        return round;
    }

    @Transactional(readOnly = true)
    public Round findRound(Integer id) {
        return roundRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Round", "id", id));
    }

    @Transactional(readOnly = true)
    public Iterable<Round> findAll() {
        return roundRepository.findAll();
    }

    @Transactional
    public Round updateRound(@Valid Round round, Integer idToUpdate) {
        Round toUpdate = findRound(idToUpdate);
        BeanUtils.copyProperties(round, toUpdate, "id", "game", "board"); 
        roundRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deleteRound(Integer id) {
        Round toDelete = findRound(id);
        roundRepository.delete(toDelete);
    }
    
    @Transactional(readOnly = true)
    public List<Round> findByGameId(Integer gameId) {
        return roundRepository.findByGameId(gameId);
    }
    
    @Transactional(readOnly = true)
    public Round findByGameIdAndRoundNumber(Integer gameId, Integer roundNumber) {
        return roundRepository.findByGameIdAndRoundNumber(gameId, roundNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Round", "GameId and RoundNumber", gameId + " and " + roundNumber));
    }
    
    @Transactional(readOnly = true)
    public List<Round> findByWinnerRol(boolean winnerRol) {
        return roundRepository.findByWinnerRol(winnerRol);
    }
    
    @Transactional(readOnly = true)
    public List<Round> findByRoundNumber(Integer roundNumber) {
        return roundRepository.findByRoundNumber(roundNumber);
    }
    
    @Transactional(readOnly = true)
    public List<Round> findByLeftCardsLessThanEqual(Integer leftCards) {
        return roundRepository.findByLeftCardsLessThanEqual(leftCards);
    }

    @Transactional
    public Round patchRoundBoard(Integer roundId, Map<String, Object> updates) {
        return findRound(roundId); 
    }

    @Transactional
    public Round patchRoundGame(Integer roundId, Map<String, Object> updates) {
        return findRound(roundId); 
    }

    @Transactional
    public Round initializeRound(Game game, Integer roundNumber){
        Round round = new Round();
        round.setGame(game);
        round.setLeftCards(60);
        round.setRoundNumber(roundNumber);
        round.setTimeSpent(Duration.ZERO);
        round.setPlayerTurn(null);



        Board board = new Board();
        board.setBase(11);
        board.setHeight(9);

        List<Square> squares = new ArrayList<>();
        
        for (int y = 0; y < board.getHeight(); y++){
            for (int x = 0; x < board.getBase(); x++){
                Square square = new Square();
                square.setCoordinateX(x);
                square.setCoordinateY(y);
                square.setOccupation(false);
                
                if(y == 4 && x == 1){
                    square.setType(type.START);
                } else if( (y == 4 && x == 9) || (y == 6 && x == 9) || ( y == 2 && x == 9) ){
                    square.setType(type.GOAL);
                } else {
                    square.setType(type.PATH);
                }

                square.setCard(null);
                square.setBoard(board);

                squares.add(square); 
                squareRepository.save(square);
            }
        }

        board.setBusy(squares);
        boardRepository.save(board);
        round.setBoard(board);
        this.saveRound(round);
        return round; 

    }
}