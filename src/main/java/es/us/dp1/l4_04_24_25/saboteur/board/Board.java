package es.us.dp1.l4_04_24_25.saboteur.board;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundSerializer;
import es.us.dp1.l4_04_24_25.saboteur.square.Square;
import es.us.dp1.l4_04_24_25.saboteur.square.SquareDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.square.SquareSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull; 
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name="Board")
public class Board extends BaseEntity{
 
    @Column(name = "base")
    @NotNull 
    protected Integer base = 11;

    @Column(name = "heigth")
    @NotNull 
    protected Integer heigth = 9;

    @JsonSerialize(contentUsing = SquareSerializer.class)
    @JsonDeserialize(contentUsing =  SquareDeserializer.class)
    @OneToMany(mappedBy = "board")
    private List<Square> busy = new ArrayList<>();

    @JsonSerialize(using = RoundSerializer.class)
    @JsonDeserialize(using = RoundDeserializer.class)
    @OneToOne(mappedBy = "board")
    private Round round;
}