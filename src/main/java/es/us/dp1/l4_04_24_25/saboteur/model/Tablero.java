package es.us.dp1.l4_04_24_25.saboteur.model;

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
@Table(name="Tablero")
public class Tablero extends BaseEntity{

    
    @Column(name = "base")
	@NotEmpty
	protected Integer base = 11;

	@Column(name = "altura")
	@NotEmpty
	protected Integer altura = 9;


	//Relación 1 tablero muchas casillas ocupadas
	@OneToMany(mappedBy = "tablero")
	private List<Casillas> ocupadas = new ArrayList<>();

	//Relacion 1 tablero 1 ronda
	@OneToOne(mappedBy = "tablero")
	private Ronda ronda;

   

}
