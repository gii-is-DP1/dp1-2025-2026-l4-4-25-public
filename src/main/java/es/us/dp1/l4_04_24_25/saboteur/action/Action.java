package es.us.dp1.l4_04_24_25.saboteur.action;

import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import es.us.dp1.l4_04_24_25.saboteur.card.effectValue;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Action")
public class Action extends Card {

    @Column(name = "nombreAccion")
	@NotNull
	protected nameAction nameAction;

	@Column(name = "valorEfecto")
	@NotNull
	protected effectValue effectValue;

    
	@Column(name = "objetoAfecta", nullable = false)
	@NotNull
	protected boolean objectAffect;  //0 si afecta a un jugador, 1 si afecta al tablero



}