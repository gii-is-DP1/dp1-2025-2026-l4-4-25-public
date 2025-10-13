package es.us.dp1.l4_04_24_25.saboteur.achievements;


import java.util.ArrayList;
import java.util.List;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;
import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.model.Admin;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;


@Entity
@Getter
@Setter
@Table(name = "Achievements")
public class Achievement extends BaseEntity{

    @NotEmpty
    @Column (unique = true, nullable = false)
    private String tittle;

    @NotEmpty
    @Column(name = "descripcion", nullable = false)
    private String description;

    private Integer score = 0; //Valor inicial es 0 si no se indica lo contrario

    //Relacion muchos logros a un administrador que lo crea

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private Admin creator;

    //Relacion muchos logros a muchos administradores que lo gestionan
    @ManyToMany(mappedBy = "managedAchievements")
    private List<Admin> admins =  new ArrayList<>();
    
    //Relacion muchos logros a muchos jugadores que lo han adquirido
    @ManyToMany(mappedBy = "accquiredAchievements")
    private List<Player> players = new ArrayList<>();


}