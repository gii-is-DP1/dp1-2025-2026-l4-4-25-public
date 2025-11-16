package es.us.dp1.l4_04_24_25.saboteur.square;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.board.Board;
import es.us.dp1.l4_04_24_25.saboteur.board.BoardDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.board.BoardSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull; 
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import es.us.dp1.l4_04_24_25.saboteur.card.Card;

@Table(name="Squares")
@Entity
@Getter
@Setter
public class Square extends BaseEntity{
    @Min(0)
    @Max(11)
    @Column(name = "coordinateX", nullable = false)
    @NotNull
    protected Integer coordinateX;

    @Min(0)
    @Max(9)
    @Column(name = "coordinateY", nullable = false)
    @NotNull
    protected Integer coordinateY;

    @Column(name = "occupation", nullable = false)
    @NotNull 
    protected boolean occupation;

    @Column(name = "type", nullable = false)
    @NotNull 
    protected type type; 

    @JsonDeserialize(using = BoardDeserializer.class)
    @JsonSerialize(using = BoardSerializer.class)
    @ManyToOne
    protected Board board;

    @OneToOne
    private Card card;
}