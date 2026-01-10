package es.us.dp1.l4_04_24_25.saboteur.square;

import java.util.ArrayList;
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
import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import es.us.dp1.l4_04_24_25.saboteur.tunnel.Tunnel;
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

    @Transactional
    public void handleSquarePatched(Square squarePatched) {

        Board board = squarePatched.getBoard();
        Integer boardId = board.getId();

        // 1️⃣ CARD_PLACED / CARD_DESTROYED
        String action = (squarePatched.getCard() != null)
                ? "CARD_PLACED"
                : "CARD_DESTROYED";

        Map<String, Object> payload = new HashMap<>();
        payload.put("action", action);
        payload.put("row", squarePatched.getCoordinateY());
        payload.put("col", squarePatched.getCoordinateX());
        payload.put("card", squarePatched.getCard());
        payload.put("squareId", squarePatched.getId());


        // 2️⃣ CHECK GOAL - Enviar todos los objetivos adyacentes
        List<Map<String, Object>> goalReveals = getGoalReveals(squarePatched); 
        if (goalReveals != null && !goalReveals.isEmpty()) {
            payload.put("goalReveals", goalReveals);
            // Mantener compatibilidad con el campo singular (primer objetivo)
            payload.put("goalReveal", goalReveals.get(0));
        }

        messagingTemplate.convertAndSend("/topic/game/" + boardId, payload);

    }


    @Transactional
    public List<Map<String, Object>> getGoalReveals (Square placedSquare){
        int x = placedSquare.getCoordinateX();
        int y = placedSquare.getCoordinateY(); 
        Board board = placedSquare.getBoard(); 
        Card card = placedSquare.getCard();

        // Verificar si la carta colocada es un túnel
        if (!(card instanceof Tunnel)) {
            return null; // No es un túnel, no puede revelar objetivos
        }
        
        Tunnel tunnel = (Tunnel) card;
        
        // Si el túnel tiene el centro bloqueado, no puede atravesarse y por tanto no puede revelar objetivos
        if (tunnel.isCentro()) {
            return null;
        }

        // Direcciones: Derecha, Izquierda, Arriba, Abajo
        // dir[0] = desplazamiento en X, dir[1] = desplazamiento en Y
        // También necesitamos saber qué propiedad de conexión verificar para cada dirección
        int[][] directions = {{1, 0}, {-1, 0}, {0, 1}, {0, -1}};

        List<Map<String, Object>> goals = new ArrayList<>();

        for (int[] dir : directions) {
            int targetX = x + dir[0];
            int targetY = y + dir[1];

            // Verificar si el túnel tiene conexión en la dirección del objetivo
            boolean hasConnectionInDirection = false;
            if (dir[0] == 1 && dir[1] == 0) { // Derecha
                hasConnectionInDirection = tunnel.isDerecha();
            } else if (dir[0] == -1 && dir[1] == 0) { // Izquierda
                hasConnectionInDirection = tunnel.isIzquierda();
            } else if (dir[0] == 0 && dir[1] == 1) { // Abajo (Y aumenta hacia abajo)
                hasConnectionInDirection = tunnel.isAbajo();
            } else if (dir[0] == 0 && dir[1] == -1) { // Arriba (Y disminuye hacia arriba)
                hasConnectionInDirection = tunnel.isArriba();
            }
            
            // Si el túnel no tiene conexión en esta dirección, no puede revelar el objetivo en esta dirección
            if (!hasConnectionInDirection) {
                continue;
            }

            //Buscamos si hay un cuadrado vecino en esa coordenada
            Square neighbor = squareRepository.findByCoordinateXAndCoordinateYAndBoard(targetX, targetY, board);
            if (neighbor != null && neighbor.getType() == type.GOAL){
                GoalType goalType = neighbor.getGoalType(); 
                if (goalType == null) continue; 

                
                // Preparamos el mensaje para el Frontend
                Map<String, Object> goal = new HashMap<>();
                goal.put("row", targetY);
                goal.put("col", targetX); 
                goal.put("goalType", goalType.getValue()); // "gold", "carbon_1", "carbon_2"  
                
                goals.add(goal);
            }

        }
        
        return goals.isEmpty() ? null : goals;
    }
        
}