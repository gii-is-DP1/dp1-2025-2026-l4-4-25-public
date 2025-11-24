package es.us.dp1.l4_04_24_25.saboteur.round.builder;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.board.BoardRepository;
import es.us.dp1.l4_04_24_25.saboteur.log.Log;
import es.us.dp1.l4_04_24_25.saboteur.log.LogService;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.square.Square;
import es.us.dp1.l4_04_24_25.saboteur.square.SquareRepository;
import es.us.dp1.l4_04_24_25.saboteur.square.type;

@Component
public class StandardRoundBuilder extends AbstractRoundBuilder {

    private final LogService logService;
    private final BoardRepository boardRepository;
    private final SquareRepository squareRepository;

    @Autowired
    public StandardRoundBuilder(LogService logService, 
                                BoardRepository boardRepository,
                                SquareRepository squareRepository) {
        this.logService = logService;
        this.boardRepository = boardRepository;
        this.squareRepository = squareRepository;
    }

    @Override
    public Round build() {
        Round round = new Round();
        
        round.setGame(this.game);
        round.setRoundNumber(this.roundNumber != null ? this.roundNumber : 1);
        round.setLeftCards(this.leftCards != null ? this.leftCards : 60);
        round.setTimeSpent(this.timeSpent != null ? this.timeSpent : Duration.ZERO);
        round.setPlayerTurn(null);
        round.setWinnerRol(this.winnerRol);
        
        Log newLog = new Log();
        logService.saveLog(newLog);
        round.setLog(newLog);
        
        Board board = createBoard();
        round.setBoard(board);
        
        return round;
    }

    private Board createBoard() {
        Board board = new Board();
        board.setBase(11);
        board.setHeight(9);

        List<Square> squares = new ArrayList<>();
        
        for (int y = 0; y < board.getHeight(); y++) {
            for (int x = 0; x < board.getBase(); x++) {
                Square square = new Square();
                square.setCoordinateX(x);
                square.setCoordinateY(y);
                square.setOccupation(false);
                
                //Determinar el tipo de casilla
                if (y == 4 && x == 1) {
                    square.setType(type.START);
                } else if ((y == 4 && x == 9) || (y == 6 && x == 9) || (y == 2 && x == 9)) {
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
        
        return board;
    }
}
