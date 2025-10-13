package es.us.dp1.l4_04_24_25.saboteur.board;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.square.Square;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name="Board")
public class Board extends BaseEntity{

    
    @Column(name = "base")
	@NotEmpty
	protected Integer base = 11;

	@Column(name = "heigth")
	@NotEmpty
	protected Integer heigth = 9;


	//Relación 1 tablero muchas casillas ocupadas
	@OneToMany(mappedBy = "board")
	private List<Square> busy = new ArrayList<>();

	//Relacion 1 tablero 1 ronda
	@OneToOne(mappedBy = "board")
	private Round round;

   

}
