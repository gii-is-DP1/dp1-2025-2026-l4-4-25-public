package es.us.dp1.l4_04_24_25.saboteur.square;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
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

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import es.us.dp1.l4_04_24_25.saboteur.square.type; 
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/squares")
@SecurityRequirement(name = "bearerAuth")
public class SquareRestController {

    private final SquareService squareService;

    @Autowired
    public SquareRestController(SquareService squareService) {
        this.squareService = squareService;
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
    
    public ResponseEntity<Square> create(@RequestBody @Valid Square square) {
        
        Square newSquare = new Square();
        newSquare.setCoordinateX(square.getCoordinateX());
        newSquare.setCoordinateY(square.getCoordinateY());
        newSquare.setOccupation(square.isOccupation());
        newSquare.setType(square.getType());
        newSquare.setBoard(square.getBoard()); 

        Square savedSquare = squareService.saveSquare(newSquare);
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
   
    public ResponseEntity<Square> patchSquare(@PathVariable Integer id, @RequestBody Map<String, Object> updates) {
        Square square = squareService.findSquare(id);

        updates.forEach((k, v) -> {
            Field field = ReflectionUtils.findField(Square.class, k);
            
            if (field == null) return; 
            
            field.setAccessible(true);

            try {
                
                if (field.getType().equals(Boolean.class) || field.getType().equals(boolean.class)) {
                    ReflectionUtils.setField(field, square, (Boolean) v);
                } else if (field.getType().equals(Integer.class)) {
                    ReflectionUtils.setField(field, square, (Integer) v);
                } 
                
                else if (field.getType().isEnum() && v instanceof String) {
                    @SuppressWarnings({"rawtypes", "unchecked"})
                    Enum enumValue = Enum.valueOf((Class) field.getType(), (String) v);
                    ReflectionUtils.setField(field, square, enumValue);
                }
                
                else if (k.equals("board") && v instanceof Map) {
                    
                }
                else {
                    ReflectionUtils.setField(field, square, v);
                }

            } catch (Exception e) {
                
                throw new RuntimeException("Error applying patch to field " + k, e);
            }
        });

        squareService.saveSquare(square);
        return ResponseEntity.ok(square);
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
    public ResponseEntity<List<Square>> findByCoordinates(
        @RequestParam Integer coordinateX, 
        @RequestParam Integer coordinateY) {
        List<Square> res = squareService.findByCoordinates(coordinateX, coordinateY);
        return new ResponseEntity<>(res, HttpStatus.OK);
    }
}