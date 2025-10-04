package es.us.dp1.l4_04_24_25.saboteur.model;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;

@MappedSuperclass
@Table(name = "Carta")
public class Carta extends BaseEntity {

    @Column(name = "estado")
	@NotEmpty
	protected String estado;

	@Column(name = "imagen")
	@NotEmpty
	protected String imagen;

    public String getEstado() {
		return this.estado;
	}

	public void setEstado(String estado ) {
		this.estado = estado;
	}

	public String getImagen() {
		return this.imagen;
	}

	public void setImagen(String imagen) {
		this.imagen = imagen;
	}



}