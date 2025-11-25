package es.us.dp1.l4_04_24_25.saboteur.square;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;

import es.us.dp1.l4_04_24_25.saboteur.board.Board;

public interface SquareRepository extends CrudRepository<Square, Integer> {

    Optional<Square> findById (Integer id);

    List<Square> findByOccupation(boolean occupation);

    List<Square> findByType(type type);

    Square findByCoordinateXAndCoordinateY(Integer coordinateX, Integer coordinateY);

    Square findByCoordinateXAndCoordinateYAndBoard(Integer coordinateX, Integer coordinateY, Board board);
    
    boolean existsByCoordinateXAndCoordinateY (Integer coordinateX, Integer coordinateY);
}