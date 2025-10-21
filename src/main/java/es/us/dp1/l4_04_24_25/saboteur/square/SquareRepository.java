package es.us.dp1.l4_04_24_25.saboteur.square;

import java.util.List;
import org.springframework.data.repository.CrudRepository;

public interface SquareRepository extends CrudRepository<Square, Integer> {

    List<Square> findByOccupation(boolean occupation);

    List<Square> findByType(type type);

    List<Square> findByCoordinateXAndCoordinateY(Integer coordinateX, Integer coordinateY);
    
}