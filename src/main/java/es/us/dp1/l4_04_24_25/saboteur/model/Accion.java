package es.us.dp1.l4_04_24_25.saboteur.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;

@Entity
@Table(name = "Accion")
public class Accion extends Carta {

    @Column(name = "nombreAccion")
	@NotEmpty
	protected String nombreAccion;

	@Column(name = "valorEfecto")
	@NotEmpty
	protected String valorEfecto;

    
	@Column(name = "objetoAfecta")
	@NotEmpty
	protected String objetoAfecta;

    public String getNombreAccion() {
		return this.nombreAccion;
	}

	public void setNombreAccion(String nombreAccion ) {
		this.nombreAccion = nombreAccion;
	}

	public String getValorEfecto() {
		return this.valorEfecto;
	}

	public void setValorEfecto(String valorEfecto) {
		this.valorEfecto = valorEfecto;
	}

    public String getObjetoAfecta() {
		return this.objetoAfecta;
	}

	public void setObjetoAfecta(String objetoAfecta) {
		this.objetoAfecta = objetoAfecta;
	}



}