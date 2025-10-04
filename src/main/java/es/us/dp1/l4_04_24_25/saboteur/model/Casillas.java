package es.us.dp1.l4_04_24_25.saboteur.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;

@Table(name="Casillas")
@Entity
public class Casillas extends BaseEntity{
    
    @Column(name = "coordenadaX")
	@NotEmpty
	protected Integer coordenadaX;

	@Column(name = "coordenadaY")
	@NotEmpty
	protected Integer coordenadaY;

    @Column(name = "ocupacion")
	@NotEmpty
	protected Boolean ocupacion;

    public Integer getCoordenadaX() {
		return this.coordenadaX;
	}

	public void setCoordenadaX(Integer coordenadaX ) {
		this.coordenadaX = coordenadaX;
	}

	public Integer getCoordenadaY() {
		return this.coordenadaY;
	}

	public void setCoordenadaY(Integer coordenadaY) {
		this.coordenadaY = coordenadaY;
	}

    public Boolean getOcupacion() {
		return this.ocupacion;
	}

	public void setOcupacion(Boolean ocupacion) {
		this.ocupacion = ocupacion;
	}





}
