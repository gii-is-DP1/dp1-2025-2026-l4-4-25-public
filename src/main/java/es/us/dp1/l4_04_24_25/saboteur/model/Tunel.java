package es.us.dp1.l4_04_24_25.saboteur.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Tunel")
public class Tunel extends Carta {

    @Column(name = "rotacion", nullable = false)
	@NotEmpty
	protected boolean rotacion;

	@Column(name = "arriba", nullable = false)
	@NotEmpty
	protected boolean arriba;

    
	@Column(name = "abajo", nullable = false)
	@NotEmpty
	protected boolean abajo;

    @Column(name = "derecha", nullable = false)
	@NotEmpty
	protected boolean derecha;

    @Column(name = "izquierda", nullable = false)
	@NotEmpty
	protected boolean izquierda;

   





}