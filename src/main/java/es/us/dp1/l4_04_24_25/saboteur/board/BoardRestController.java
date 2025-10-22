package es.us.dp1.l4_04_24_25.saboteur.board;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ReflectionUtils;
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

import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;

import es.us.dp1.l4_04_24_25.saboteur.round.RoundService;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/boards")
@SecurityRequirement(name = "bearerAuth")
public class BoardRestController {

    private final BoardService boardService;
    

    @Autowired
    public BoardRestController(BoardService boardService, RoundService roundService, ObjectMapper objectMapper) {
        this.boardService = boardService;
    
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
        Board savedBoard;
        BeanUtils.copyProperties(board, newBoard,"id");
        savedBoard = this.boardService.saveBoard(newBoard);
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
    
    public ResponseEntity<Board> patchBoard(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        RestPreconditions.checkNotNull(boardService.findBoard(id), "Board", "ID", id);
        Board board = boardService.findBoard(id);

        updates.forEach((k, v) -> {
            Field field = ReflectionUtils.findField(Board.class, k);
            if (field == null) return;
            field.setAccessible(true);
            try {
        
                if (field.getType().equals(Integer.class)) {
                    ReflectionUtils.setField(field, board, (Integer) v);
                }
                
                else if (k.equals("round") && v instanceof Map) {
                    
                }
                else {
                    ReflectionUtils.setField(field, board, v);
                }
            } catch (Exception e) {
                throw new RuntimeException("Error applying patch to field " + k, e);
            }
        });

        boardService.saveBoard(board);
        return ResponseEntity.ok(board);
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