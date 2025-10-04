package es.us.dp1.l4_04_24_25.saboteur.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;

@Entity
@Table(name="Tablero")
public class Tablero extends BaseEntity{

    @OneToMany(mappedBy = "tablero")
    private List<Casillas> casillas = new ArrayList<>();
    
    @Column(name = "base")
	@NotEmpty
	protected Integer base;

	@Column(name = "altura")
	@NotEmpty
	protected Integer altura;

    public Integer getBase() {
		return this.base;
	}

	public void setBase(Integer base ) {
		this.base = base;
	}

	public Integer getAltura() {
		return this.altura;
	}

	public void setCoordenadaY(Integer altura) {
		this.altura = altura;
	}

}
