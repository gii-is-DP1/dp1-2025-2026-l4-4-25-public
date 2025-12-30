package es.us.dp1.l4_04_24_25.saboteur.square;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.board.BoardService;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;
import java.util.HashMap;
import es.us.dp1.l4_04_24_25.saboteur.square.GoalType;


@Service
public class SquareService {

    private final SquareRepository squareRepository;
    private final BoardService boardService;
    private final SimpMessagingTemplate messagingTemplate; 

    @Autowired
    public SquareService(SquareRepository squareRepository, BoardService boardService, SimpMessagingTemplate messagingTemplate) {
        this.squareRepository = squareRepository;
        this.boardService = boardService;
        this.messagingTemplate = messagingTemplate; 
    }

    @Transactional
    public Square saveSquare(@Valid Square square) {
        
        squareRepository.save(square);
        return square;
    }

    @Transactional(readOnly = true)
    public Square findSquare(Integer id) {
        return squareRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Square", "id", id));
    }

    @Transactional(readOnly = true)
    public Iterable<Square> findAll() {
        return squareRepository.findAll();
    }

    @Transactional
    public Square updateSquare(@Valid Square square, Integer idToUpdate) {
        Square toUpdate = findSquare(idToUpdate);
        
        BeanUtils.copyProperties(square, toUpdate, "id", "board"); 
        squareRepository.save(toUpdate);
        return toUpdate;
    }

    @Transactional
    public void deleteSquare(Integer id) {
        Square toDelete = findSquare(id);
        squareRepository.delete(toDelete);
    }

    @Transactional (readOnly = true)
    public Optional<Square>  findById(Integer id){
        return squareRepository.findById(id);
    }
    @Transactional(readOnly = true)
    public List<Square> findByOccupation(boolean occupation) {
        return squareRepository.findByOccupation(occupation);
    }

    @Transactional(readOnly = true)
    public List<Square> findByType(type type) {
        return squareRepository.findByType(type);
    }

    @Transactional(readOnly = true)
    public Square findByCoordinates(Integer coordinateX, Integer coordinateY) {
        return squareRepository.findByCoordinateXAndCoordinateY(coordinateX, coordinateY);
    }

    public boolean existsByCoordinateXAndCoordinateY (Integer coordinateX, Integer coordinateY){
        return squareRepository.existsByCoordinateXAndCoordinateY(coordinateX, coordinateY);
    }

    @Transactional(readOnly = true)
    public Square patchSquare(Integer id, Map<String, Object> updates) {
        Square sq = findSquare(id);
        if (updates.containsKey("board")){
            Integer boardId = (Integer) updates.get("board");
            Board board = boardService.findBoard(boardId);
            sq.setBoard(board);
        }
        return squareRepository.save(sq);
    }

    @Transactional(readOnly = true)
    public Square findByBoardIdAndCoordinates(Board board, Integer coordinateX, Integer coordinateY) {
        return squareRepository.findByCoordinateXAndCoordinateYAndBoard(coordinateX, coordinateY, board);
    }

    public void checkAndRevealGoal (Square placedSquare){
        int x = placedSquare.getCoordinateX();
        int y = placedSquare.getCoordinateY(); 
        Board board = placedSquare.getBoard(); 

        // Direcciones: Derecha, Izquierda, Arriba, Abajo
        int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        for (int[] dir : directions) {
            int targetX = x + dir[0];
            int targetY = y + dir[1];

            //Buscamos si hay un cuadrado vecino en esa coordenada
            Square neighbor = squareRepository.findByCoordinateXAndCoordinateYAndBoard(targetX, targetY, board);
            if (neighbor != null && neighbor.getType() == type.GOAL){
                GoalType goalType = neighbor.getGoalType(); 
                if (goalType == null) continue; 

                // Extraemos el tipo de carta (gold, carbon_1, carbon_2) de la imagen
                /*String cardType = "unknown"; 
                if (neighbor.getCard() != null && neighbor.getCard().getImage() != null){
                    String img = neighbor.getCard().getImage();
                    if (img.contains("gold")) cardType = "gold"; 
                    else if (img.contains("carbon_1") || img.contains("coal_1")) cardType = "carbon_1"; 
                    else if (img.contains("carbon_2") || img.contains("coal_2")) cardType = "carbon_2"; 
                }*/
                
                // Preparamos el mensaje para el Frontend
                Map<String, Object> payload = new HashMap<>();
                payload.put("action", "GOAL_REVEALED");
                payload.put("row", targetY);
                payload.put("col", targetX); 
                payload.put("goalType", goalType.getValue()); // "gold", "carbon_1", "carbon_2"  
                
                // Enviamos el mensaje por WebSocket
                messagingTemplate.convertAndSend("/topic/game/" + board.getId(), payload);
                System.out.println("GOAL REVEALED: " + goalType + " at " + targetX + "," + targetY);
            }

        }
    }
        
}