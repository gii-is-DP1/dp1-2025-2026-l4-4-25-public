package es.us.dp1.l4_04_24_25.saboteur.user;

import java.util.Date;

import es.us.dp1.l4_04_24_25.saboteur.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "appusers")
public class User extends BaseEntity {
    @Column(unique = true, nullable = false)
    @NotEmpty
    private String nombreUsuario;

    @NotEmpty
    private String nombreApellido;
	
	@Temporal(TemporalType.DATE)
    @NotEmpty
    @Column(name = "fechaNacimiento", nullable = false)
    private Date fechaNacimiento;

    @NotEmpty
    @Column(name ="contrasena", nullable = false)
    private String contrasena;

	@Column(name = "imagen", nullable = false)
    private String url;

    @Column(unique=true, nullable = false)
    @NotEmpty
    private String correoElectronico;

	@ManyToOne(optional = false)
	@JoinColumn(name = "authority")
	Authorities authority;

	public Boolean hasAuthority(String auth) {
		return authority.getAuthority().equals(auth);
	}

	public Boolean hasAnyAuthority(String... authorities) {
		Boolean cond = false;
		for (String auth : authorities) {
			if (auth.equals(authority.getAuthority()))
				cond = true;
		}
		return cond;
	}

}
