	package es.us.dp1.l4_04_24_25.saboteur.card;

	import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
	import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
	import jakarta.persistence.Column;
	import jakarta.persistence.Entity;
	import jakarta.persistence.Inheritance;
	import jakarta.persistence.InheritanceType;
	import jakarta.persistence.ManyToOne;
	import jakarta.persistence.Table;
	import jakarta.validation.constraints.NotEmpty;
	import lombok.Getter;
	import lombok.Setter;

	@Getter
	@Setter
	@Entity
	@Table(name = "Cards")
	@Inheritance(strategy = InheritanceType.JOINED)
	public class Card extends BaseEntity {

		@Column(name = "status", nullable = false)
		@NotEmpty
		protected boolean status;

		@Column(name = "image", nullable = false)
		@NotEmpty
		protected String image;

		//RELACION CARTA-MANO (N-1)
		@ManyToOne
		protected Deck deck;



	}