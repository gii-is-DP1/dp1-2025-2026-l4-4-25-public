package es.us.dp1.l4_04_24_25.saboteur.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;

@Entity
@Table(name = "Tunel")
public class Tunel extends Carta {

    @Column(name = "rotacion")
	@NotEmpty
	protected boolean rotacion;

	@Column(name = "arriba")
	@NotEmpty
	protected boolean arriba;

    
	@Column(name = "abajo")
	@NotEmpty
	protected boolean abajo;

    @Column(name = "derecha")
	@NotEmpty
	protected boolean derecha;

    @Column(name = "izquierda")
	@NotEmpty
	protected boolean izquierda;

    public Boolean getRotacion() {
		return this.rotacion;
	}

	public void setRotacion(Boolean rotacion ) {
		this.rotacion = rotacion;
	}

	public Boolean getArriba() {
		return this.arriba;
	}

	public void setArriba(Boolean arriba) {
		this.arriba = arriba;
	}

    public Boolean getAbajo() {
		return this.abajo;
	}

	public void setAbajo(Boolean abajo) {
		this.abajo = abajo;
	}

    public Boolean getDerecha() {
		return this.derecha;
	}

	public void setDerecha(Boolean derecha) {
		this.derecha = derecha;
	}

    public Boolean getIzquierda() {
		return this.izquierda;
	}

	public void setIzquierda(Boolean izquierda) {
		this.izquierda = izquierda;
	}





}