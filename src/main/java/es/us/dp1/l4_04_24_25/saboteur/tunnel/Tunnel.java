package es.us.dp1.l4_04_24_25.saboteur.tunnel;

import es.us.dp1.l4_04_24_25.saboteur.card.Card;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Tunnel")
public class Tunnel extends Card {

    @Column(name = "rotation", nullable = false)
	@NotEmpty
	protected boolean rotation;

	@Column(name = "up", nullable = false)
	@NotEmpty
	protected boolean up;

    
	@Column(name = "down", nullable = false)
	@NotEmpty
	protected boolean down;

    @Column(name = "right", nullable = false)
	@NotEmpty
	protected boolean right;

    @Column(name = "left", nullable = false)
	@NotEmpty
	protected boolean left;

   





}