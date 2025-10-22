package es.us.dp1.l4_04_24_25.saboteur.square;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;

@Service
public class SquareService {

    private final SquareRepository squareRepository;

    @Autowired
    public SquareService(SquareRepository squareRepository) {
        this.squareRepository = squareRepository;
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
        
}