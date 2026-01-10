package es.us.dp1.l4_04_24_25.saboteur.round;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import io.qameta.allure.Epic;
import io.qameta.allure.Feature;

@Epic("Rounds")
@Feature("Round Service Tests")
// @Owner("DP1-tutors")
@SpringBootTest
@AutoConfigureTestDatabase
class RoundServiceTest {

    @Autowired
    private RoundService roundService;

    @Autowired
    private GameService gameService;

    @Test
    void shouldFindSingleRoundById() {
        Integer id = 1;
        Round round = this.roundService.findRound(id);
        assertEquals(id, round.getId());
    }

    @Test
    void shouldNotFindSingleRoundById() {
        Integer id = 30;
        assertThrows(ResourceNotFoundException.class, () -> this.roundService.findRound(id));
    }

    @Test
    void shouldFindAllRounds() {
        List<Round> squares = (List<Round>) this.roundService.findAll();
        assertEquals(2, squares.size());
    }

    @Test
    void shouldPatchRoundBoard() {
        Round round = this.roundService.findRound(2);
        assertEquals(2, round.getBoard().getId());
        Round patchedRound = this.roundService.patchRoundBoard(2, Map.of("board", 2));
        assertEquals(2, patchedRound.getBoard().getId());
    }

    @Test
    void shouldPatchRoundGame() {
        Round round = this.roundService.findRound(2);
        assertEquals(1, round.getGame().getId());
        Round patchedRound = this.roundService.patchRoundGame(2, Map.of("game", 2));
        assertEquals(1, patchedRound.getGame().getId()); // patchRoundGame is not implemented yet
    }

    @Test
    @Transactional
    void shouldDeleteRound() {

        Round r = new Round();
        r.setLeftCards(10);
        r.setRoundNumber(99);
        Round saved = roundService.saveRound(r);
        Integer id = saved.getId();

        assertNotNull(roundService.findRound(id));

        roundService.deleteRound(id);

        assertThrows(ResourceNotFoundException.class, () -> roundService.findRound(id));
    }

    @Test
    @Transactional
    void shouldSaveRound() {
        Round newRound = new Round();
        newRound.setLeftCards(50);
        newRound.setRoundNumber(3);
        newRound.setTimeSpent(Duration.ZERO);

        Round saved = roundService.saveRound(newRound);
        assertNotNull(saved.getId());
        assertEquals(50, saved.getLeftCards());
    }

    @Test
    @Transactional
    void shouldUpdateRound() {
        Integer id = 1;
        Round round = roundService.findRound(id);
        Integer originalLeftCards = round.getLeftCards();

        Round updateInfo = new Round();
        updateInfo.setLeftCards(originalLeftCards - 5);
        updateInfo.setRoundNumber(1);

        Round updated = roundService.updateRound(updateInfo, id);

        assertEquals(originalLeftCards - 5, updated.getLeftCards());
    }

    @Test
    @Transactional
    void shouldInitializeRound() {
        Game game = gameService.findGame(1);

        Round created = roundService.initializeRound(game, 3);

        assertNotNull(created.getId());
        assertNotNull(created.getBoard());
        assertEquals(3, created.getRoundNumber());
        assertEquals(52, created.getLeftCards());
        assertEquals(game.getId(), created.getGame().getId());
    }

    @Test
    void shouldFindByGameId() {
        List<Round> rounds = roundService.findByGameId(1);
        assertFalse(rounds.isEmpty());
        assertTrue(rounds.stream().allMatch(r -> r.getGame().getId() == 1));
    }

    @Test
    void shouldFindByGameIdAndRoundNumber() {
        Round round = roundService.findByGameIdAndRoundNumber(1, 1);
        assertNotNull(round);
        assertEquals(1, round.getRoundNumber());
    }

    @Test
    void shouldFailFindByGameIdAndRoundNumber() {
        assertThrows(ResourceNotFoundException.class,
                () -> roundService.findByGameIdAndRoundNumber(1, 99));
    }

    @Test
    void shouldFindByWinnerRol() {

        List<Round> rounds = roundService.findByWinnerRol(false);
        assertFalse(rounds.isEmpty());
        assertTrue(rounds.stream().allMatch(r -> r.getWinnerRol() == false));
    }

    @Test
    void shouldFindByRoundNumber() {
        List<Round> rounds = roundService.findByRoundNumber(1);
        assertFalse(rounds.isEmpty());
        assertEquals(1, rounds.get(0).getRoundNumber());
    }

    @Test
    void shouldFindByLeftCardsLessThanEqual() {

        List<Round> rounds = roundService.findByLeftCardsLessThanEqual(20);
        assertFalse(rounds.isEmpty());
        assertTrue(rounds.stream().allMatch(r -> r.getLeftCards() <= 20));
    }

    @Test
    void shouldFindByBoardId() {
        Round round = roundService.findRound(2); // Round 2 has a board_id
        Integer boardId = round.getBoard().getId();

        Round foundRound = roundService.findByBoardId(boardId);
        assertNotNull(foundRound);
        assertEquals(boardId, foundRound.getBoard().getId());
    }

    @Test
    void shouldFailToFindByBoardId() {
        assertThrows(ResourceNotFoundException.class,
                () -> roundService.findByBoardId(99999));
    }

    @Test
    void shouldTestRoundGettersAndSetters() {
        Round round = new Round();

        round.setRoundNumber(2);
        assertEquals(2, round.getRoundNumber());

        round.setLeftCards(50);
        assertEquals(50, round.getLeftCards());

        round.setWinnerRol(true);
        assertTrue(round.getWinnerRol());

        Duration timeSpent = Duration.ofMinutes(10);
        round.setTimeSpent(timeSpent);
        assertEquals(timeSpent, round.getTimeSpent());
    }

    @Test
    void shouldTestRoundRelationships() {
        Round round = new Round();

        Game game = new Game();
        game.setId(1);
        round.setGame(game);
        assertEquals(game, round.getGame());

        // Test that round can have a board
        es.us.dp1.l4_04_24_25.saboteur.board.Board board = new es.us.dp1.l4_04_24_25.saboteur.board.Board();
        board.setId(1);
        round.setBoard(board);
        assertEquals(board, round.getBoard());
    }
}