package es.us.dp1.l4_04_24_25.saboteur.square;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull; 
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Table(name="Squares")
@Entity
@Getter
@Setter
public class Square extends BaseEntity{
    
    @Column(name = "coordinateX", nullable = false)
    @NotNull
    protected Integer coordinateX;

    @Column(name = "coordinateY", nullable = false)
    @NotNull
    protected Integer coordinateY;

    @Column(name = "occupation", nullable = false)
    @NotNull 
    protected boolean occupation;

    @Column(name = "type", nullable = false)
    @NotNull 
    protected type type;

    @JsonBackReference 
    @ManyToOne
    protected Board board;
    
    public Square() {
        super();
    }
}