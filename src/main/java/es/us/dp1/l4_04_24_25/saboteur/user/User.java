package es.us.dp1.l4_04_24_25.saboteur.user;


import java.sql.Date;

import java.util.ArrayList;
import java.util.List;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import jakarta.persistence.CascadeType;
import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "appusers")
@Inheritance(strategy = InheritanceType.JOINED)
public class User extends BaseEntity {
    @Column(unique = true, nullable = false)
    @NotEmpty
    private String username;

	@Column(name = "name", nullable = false)
    @NotEmpty
    private String name;
	
	// @Temporal(TemporalType.DATE)
    @NotEmpty
    @Column(name = "birthdate", nullable = false)
    private String birthDate;


    @NotEmpty
    @Column(name = "joined", nullable = false)
    private String joined;

    @NotEmpty
    @Column(name ="password", nullable = false)
    private String password;

	@Lob
	@Column(name = "image", nullable = false)
    private String image;

    @Column(unique=true, nullable = false)
    @NotEmpty
    private String email;

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

	//RELACION CON USUARIOS
    @ManyToMany
    @JoinTable(
        name = "admin_user",
        joinColumns = @JoinColumn(name = "admin_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> users = new ArrayList<>();

    //RELACION -> ADMIN CREA LGORO
    @OneToMany (mappedBy = "creator", cascade = CascadeType.ALL, orphanRemoval = true) //CASCADE ES PARA QUE CUALQIUER ACCIÓN SOBRE EL PADRE (EL ADMIN) SE APLIQUE TAMBIEN SOBRE SU HIJO (LOGRO)
    private List<Achievement> createdAchievements = new ArrayList<>();

    //RELACION -> ADMIN EDITA LOGRO
    @ManyToMany
    @JoinTable(
        name = "adminAchievement",
        joinColumns = @JoinColumn(name = "admin_id"),
        inverseJoinColumns = @JoinColumn(name = "achievement_id")
    )
    private List<Achievement> managedAchievements = new ArrayList<>();


    //RELACION -> ADMIN GESTIONA PARTIDA
    @ManyToMany
    @JoinTable(
        name = "adminGame",
        joinColumns = @JoinColumn(name = "admin_id"),
        inverseJoinColumns = @JoinColumn(name = "game_id")
    )
    private List<Game> managedGames = new ArrayList<>();

}
