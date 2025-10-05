package es.us.dp1.l4_04_24_25.saboteur.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Table(name="Casillas")
@Entity
@Getter
@Setter
public class Casillas extends BaseEntity{
    
    @Column(name = "coordenadaX", nullable = false)
	@NotEmpty
	protected Integer coordenadaX;

	@Column(name = "coordenadaY", nullable = false)
	@NotEmpty
	protected Integer coordenadaY;

    @Column(name = "ocupacion", nullable = false)
	@NotEmpty
	protected boolean ocupacion;

	@Column(name = "tipo", nullable = false)
	protected Tipo tipo;

	//Relación muchas casillas 1 participante
	@ManyToOne
	protected Participante participante;

	//Relación muchas casillas 1 tablero
	@ManyToOne
	protected Tablero tablero;






}
