	package es.us.dp1.l4_04_24_25.saboteur.model;

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
	@Table(name = "cartas")
	@Inheritance(strategy = InheritanceType.JOINED)
	public class Carta extends BaseEntity {

		@Column(name = "estado", nullable = false)
		@NotEmpty
		protected boolean estado;

		@Column(name = "imagen", nullable = false)
		@NotEmpty
		protected String imagen;

		//RELACION CARTA-MANO (N-1)
		@ManyToOne
		protected Mano mano;



	}