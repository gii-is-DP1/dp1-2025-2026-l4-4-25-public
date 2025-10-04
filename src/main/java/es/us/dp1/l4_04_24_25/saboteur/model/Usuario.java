package es.us.dp1.l4_04_24_25.saboteur.model;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "Usuario")
public class Usuario extends BaseEntity {
    @Column(name = "imagen")
    private String url;

    @Column(unique = true)
    @NotEmpty
    private String nombreUsuario;

    @NotEmpty
    private String nombreApellido;

    @Temporal(TemporalType.DATE)
    @NotEmpty
    private Date fechaNacimiento;

    @NotEmpty
    private String contrasena;

    @Column(unique=true)
    @NotEmpty
    private String correoElectronico;
}