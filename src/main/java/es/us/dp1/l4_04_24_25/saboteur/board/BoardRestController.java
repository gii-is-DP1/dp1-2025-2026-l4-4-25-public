package es.us.dp1.l4_04_24_25.saboteur.board;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundService;
import es.us.dp1.l4_04_24_25.saboteur.square.Square;
import es.us.dp1.l4_04_24_25.saboteur.square.SquareService;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/boards")
@SecurityRequirement(name = "bearerAuth")
public class BoardRestController {

    private final BoardService boardService;
    private final SquareService squareService;
    private final RoundService roundService;
    private final ObjectMapper objectMapper;
    

    @Autowired
    public BoardRestController(BoardService boardService, RoundService roundService,SquareService squareService, ObjectMapper objectMapper) {
        this.boardService = boardService;
        this.roundService = roundService;
        this.squareService = squareService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<List<Board>> findAll() {
        List<Board> res = (List<Board>) boardService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Board> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(boardService.findBoard(id), HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    
    public ResponseEntity<Board> create(@Valid @RequestBody Board board) throws DataAccessException{
        Board newBoard = new Board();
        BeanUtils.copyProperties(board, newBoard, "id","busy","round");

        if (board.getBusy()!=null && !board.getBusy().isEmpty()){
            for (var square: board.getBusy()){
                square.setBoard(newBoard);
                // squareService.saveSquare(square);
                newBoard.getBusy().add(square);
            }
        }

        if (board.getRound()!=null){
            var round = board.getRound();
            round.setBoard(newBoard);
            // roundService.saveRound(round);
            newBoard.setRound(round);
        }

        Board savedBoard = this.boardService.saveBoard(newBoard);
        return new ResponseEntity<>(savedBoard, HttpStatus.CREATED);
    }

    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Board> update(@PathVariable("id") Integer id, @RequestBody @Valid Board board) {
        RestPreconditions.checkNotNull(boardService.findBoard(id), "Board", "ID", id);
        return new ResponseEntity<>(this.boardService.updateBoard(board, id), HttpStatus.OK);
    }

    @PatchMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Board> patch(@PathVariable("id") Integer id, @RequestBody Map<String, Object> updates) throws JsonMappingException{
        Board board = boardService.findBoard(id);
        RestPreconditions.checkNotNull(board, "Achievement", "ID", id);
        List<Square> updatedSquares = new ArrayList<>();
        if (updates.containsKey("busy")){
            List<Integer> squares = (List<Integer>) updates.get("busy");

            List<Square> oldSquares = new ArrayList<>(board.getBusy());
            for (Square oldSquare : oldSquares) {
                if (!squares.contains(oldSquare.getId())) {
                    oldSquare.setBoard(null);
                    squareService.saveSquare(oldSquare);
                    board.getBusy().remove(oldSquare);
                }
            }

            for(Integer sq:squares){
                if (sq!=null){
                    RestPreconditions.checkNotNull(squareService.findById(sq), "Square", "ID", id);
                    Square patchedSquare = squareService.patchSquare(sq, Map.of("board", board.getId()));
                    updatedSquares.add(patchedSquare);
                }
            }

            board.setBusy(updatedSquares);
        }

        if (updates.containsKey("round")){
            Object roundObject = updates.get("round");
            if (roundObject != null) {
                Integer roundId = (Integer) roundObject;
                Round roundUpdated = roundService.patchRoundBoard(roundId, Map.of("board", board.getId()));
                board.setRound(roundUpdated);
            } else {
                if (board.getRound() != null) {
                    board.getRound().setBoard(null);
                }
                board.setRound(null);
            }     
        }
        Board boardPatched = objectMapper.updateValue(board, updates);
        boardService.updateBoard(boardPatched, id);
        return new ResponseEntity<>(boardPatched, HttpStatus.OK);
    }
    
    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(boardService.findBoard(id), "Board", "ID", id);
        boardService.deleteBoard(id);
        return new ResponseEntity<>(new MessageResponse("Board deleted!"), HttpStatus.OK);
    }

    @GetMapping("byBase")
    public ResponseEntity<List<Board>> findByBase(@RequestParam Integer base) {
        List<Board> res = boardService.findByBase(base);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byHeigth")
    public ResponseEntity<List<Board>> findByHeigth(@RequestParam Integer heigth) {
        List<Board> res = boardService.findByHeigth(heigth);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byBaseAndHeigth")
    public ResponseEntity<List<Board>> findByBaseAndHeigth(
        @RequestParam Integer base, 
        @RequestParam Integer heigth) {
        List<Board> res = boardService.findByBaseAndHeigth(base, heigth);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}