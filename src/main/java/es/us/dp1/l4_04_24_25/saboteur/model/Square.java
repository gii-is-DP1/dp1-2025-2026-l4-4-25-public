package es.us.dp1.l4_04_24_25.saboteur.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Table(name="Squares")
@Entity
@Getter
@Setter
public class Square extends BaseEntity{
    
    @Column(name = "coordinateX", nullable = false)
	@NotEmpty
	protected Integer coordinateX;

	@Column(name = "coordinateY", nullable = false)
	@NotEmpty
	protected Integer coordinateY;

    @Column(name = "occupation", nullable = false)
	@NotEmpty
	protected boolean occupation;

	@Column(name = "type", nullable = false)
	protected type type;

	//Relación muchas casillas 1 participante
	@ManyToOne
	protected ActivePlayer activePlayer;

	//Relación muchas casillas 1 tablero
	@ManyToOne
	protected Board board;






}
