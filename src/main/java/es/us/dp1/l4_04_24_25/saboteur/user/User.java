package es.us.dp1.l4_04_24_25.saboteur.user;


import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.achievements.AchievementDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.achievements.AchievementSerializer;
import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
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

	@Column( name = "name", nullable = false)
    @NotEmpty
    private String name;
	
	// @Temporal(TemporalType.DATE)
    @NotEmpty
    @Column(name = "birthdate", nullable = false)
    private String birthDate;


    @Column(name = "joined", nullable = false, updatable = false)
    private LocalDateTime joined = LocalDateTime.now(); 

   
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(name ="password", nullable = false)
    private String password;

	@Lob
	@Column(name = "image", nullable = false)
    private String image;

    @Column(unique = true, nullable = false)
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

    //RELACION -> ADMIN CREA LGORO
    @JsonSerialize(contentUsing = AchievementSerializer.class)
    @JsonDeserialize(contentUsing = AchievementDeserializer.class)
    @OneToMany (mappedBy = "creator", cascade = CascadeType.ALL) //CASCADE ES PARA QUE CUALQIUER ACCIÓN SOBRE EL PADRE (EL ADMIN) SE APLIQUE TAMBIEN SOBRE SU HIJO (LOGRO)
    private List<Achievement> createdAchievements = new ArrayList<>();
}