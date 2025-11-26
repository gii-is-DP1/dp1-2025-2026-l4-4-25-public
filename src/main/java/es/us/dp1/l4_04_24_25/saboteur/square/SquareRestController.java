package es.us.dp1.l4_04_24_25.saboteur.square;

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
import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.board.BoardService;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedSquareException;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import es.us.dp1.l4_04_24_25.saboteur.card.CardService;
import org.springframework.messaging.simp.SimpMessagingTemplate;


@RestController
@RequestMapping("/api/v1/squares")
@SecurityRequirement(name = "bearerAuth")
public class SquareRestController {

    private final SquareService squareService;
    private final BoardService boardService;
    private final ObjectMapper objectMapper;
    private final CardService cardService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public SquareRestController(SquareService squareService, BoardService boardService, ObjectMapper objectMapper, CardService cardService, SimpMessagingTemplate messagingTemplate) {
        this.squareService = squareService;
        this.boardService = boardService;
        this.objectMapper = objectMapper;
        this.cardService = cardService;
        this.messagingTemplate = messagingTemplate;
    }

    @GetMapping
    public ResponseEntity<List<Square>> findAll() {
        List<Square> res = (List<Square>) squareService.findAll();
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping(value = "{id}")
    public ResponseEntity<Square> findById(@PathVariable("id") Integer id) {
        return new ResponseEntity<>(squareService.findSquare(id), HttpStatus.OK);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    
    public ResponseEntity<Square> create(@RequestBody @Valid Square square) throws DataAccessException, DuplicatedSquareException {
        
        if(squareService.existsByCoordinateXAndCoordinateY(square.getCoordinateX(), square.getCoordinateY())){
            throw new DuplicatedSquareException("A square with coordinateX '" + square.getCoordinateX() + "' and coordinateY '" + square.getCoordinateY() + "' already exists");
        }
            
        Square newSquare = new Square();
        Square savedSquare;
        BeanUtils.copyProperties(square, newSquare, "id");
        savedSquare = this.squareService.saveSquare(newSquare);
        return new ResponseEntity<>(savedSquare, HttpStatus.CREATED);
    }

    @PutMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<Square> update(@PathVariable("id") Integer id, @RequestBody @Valid Square square) {
        RestPreconditions.checkNotNull(squareService.findSquare(id), "Square", "ID", id);
        return new ResponseEntity<>(squareService.updateSquare(square, id), HttpStatus.OK);
    }
    
    @PatchMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
   
    public ResponseEntity<Square> patchSquare(@PathVariable Integer id, @RequestBody Map<String, Object> updates) throws JsonMappingException{
        RestPreconditions.checkNotNull(squareService.findSquare(id), "Square", "ID", id);
        Square square = squareService.findSquare(id);
        
        if(updates.containsKey("coordinateX") && updates.containsKey("coordinateY") ){
            if(updates.get("coordinateX") != null && updates.get("coordinateY") != null){
                if(squareService.existsByCoordinateXAndCoordinateY((Integer) updates.get("coordinateX"), (Integer) updates.get("coordinateY"))){
                    throw new DuplicatedSquareException("A square with coordinateX '" + (Integer) updates.get("coordinateX") + "' and coordinateY '" + (Integer) updates.get("coordinateY") + "' already exists");
                }
            }
        }

        if(updates.containsKey("board")){
            if (updates.get("board") != null){
                Integer boardId = (Integer) updates.get("board");
                Board board = boardService.findBoard(boardId);
                board.getBusy().add(square);
                square.setBoard(board);
            }
        }

        if(updates.containsKey("card")){
            Integer cardId = (Integer)updates.get("card");
            Card card = cardService.findCard(cardId);
            square.setCard(card);
            square.setOccupation(true);
        }
        Square squarePatched = objectMapper.updateValue(square, updates);

        squareService.saveSquare(squarePatched);

        // ENVIAR DATOS AL CANAL WEBSOCKET
        Board board = squarePatched.getBoard();
        Integer boardId = board.getId();

        Map<String,Object> payload = Map.of(
            "action", "CARD_PLACED",
            "row", squarePatched.getCoordinateY(),
            "col", squarePatched.getCoordinateX(),
            "card", squarePatched.getCard(),
            "squareId", squarePatched.getId()
        );

        messagingTemplate.convertAndSend("/topic/game/" + boardId, payload);

        return new ResponseEntity<>(squarePatched,HttpStatus.OK);
    }


    @DeleteMapping(value = "{id}")
    @ResponseStatus(HttpStatus.OK)
    public ResponseEntity<MessageResponse> delete(@PathVariable("id") int id) {
        RestPreconditions.checkNotNull(squareService.findSquare(id), "Square", "ID", id);
        squareService.deleteSquare(id);
        return new ResponseEntity<>(new MessageResponse("Square deleted!"), HttpStatus.OK);
    }
    
    @GetMapping("byOccupation")
    public ResponseEntity<List<Square>> findByOccupation(@RequestParam boolean occupation) {
        List<Square> res = squareService.findByOccupation(occupation);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byType")
    public ResponseEntity<List<Square>> findByType(@RequestParam type type) {
        List<Square> res = squareService.findByType(type);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
    

    @GetMapping("byCoordinates")
    public ResponseEntity<Square> findByCoordinates(
        @RequestParam Integer coordinateX, 
        @RequestParam Integer coordinateY) {
        Square res = squareService.findByCoordinates(coordinateX, coordinateY);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }

    @GetMapping("byBoardAndCoordinates")
    public ResponseEntity<Square> findByBoardAndCoordinates(
        @RequestParam Integer boardId,
        @RequestParam Integer coordinateX, 
        @RequestParam Integer coordinateY) {
            Board board = boardService.findBoard(boardId);
        Square res = squareService.findByBoardIdAndCoordinates(board, coordinateX, coordinateY);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}