package es.us.dp1.l4_04_24_25.saboteur.tunnel;

import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Tunnel")
public class Tunnel extends Card {

    @Column(name = "rotacion", nullable = false)
	@NotNull
	protected boolean rotacion;

	@Column(name = "arriba", nullable = false)
	@NotNull
	protected boolean arriba = false;

    
	@Column(name = "abajo", nullable = false)
	@NotNull
	protected boolean abajo = false;

    @Column(name = "derecha", nullable = false)
	@NotNull
	protected boolean derecha = false;

    @Column(name = "izquierda", nullable = false)
	@NotNull
	protected boolean izquierda = false;

	@Column(name = "centro", nullable = false)
	@NotNull
	protected boolean centro; //true si el centro está cerrado, false en el caso contrario

   





}