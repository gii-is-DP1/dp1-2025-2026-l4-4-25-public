package es.us.dp1.l4_04_24_25.saboteur.round;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.board.BoardRepository;
import es.us.dp1.l4_04_24_25.saboteur.card.CardRepository;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.log.LogService;
import es.us.dp1.l4_04_24_25.saboteur.round.builder.StandardRoundBuilder;
import es.us.dp1.l4_04_24_25.saboteur.square.SquareRepository;
import jakarta.validation.Valid;


@Service
public class RoundService {

    private final RoundRepository roundRepository;
    private final StandardRoundBuilder standardRoundBuilder;

    @Autowired
    public RoundService(RoundRepository roundRepository, BoardRepository boardRepository,
                        SquareRepository squareRepository,
                        CardRepository cardRepository,
                        LogService logService,
                        StandardRoundBuilder standardRoundBuilder) {
        this.roundRepository = roundRepository;
        this.standardRoundBuilder = standardRoundBuilder;
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
    public Round initializeRound(Game game, Integer roundNumber) {
        Round round = standardRoundBuilder
                .withGame(game)
                .withRoundNumber(roundNumber)
                .withLeftCards(60)
                .withTimeSpent(Duration.ZERO)
                .withWinnerRol(false)
                .build();
        
        this.saveRound(round);
        return round;
    }
}