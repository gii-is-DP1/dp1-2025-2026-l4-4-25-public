
package es.us.dp1.l4_04_24_25.saboteur.achievements;


import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerSerializer;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.user.UserDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.user.UserSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

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

    @JsonDeserialize(using = UserDeserializer.class)
    @JsonSerialize(using = UserSerializer.class)
    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;
    

    /* 
    //Relacion muchos logros a muchos administradores que lo gestionan
    @ManyToMany(mappedBy = "managedAchievements")
    private List<User> admins =  new ArrayList<>();
    */

    @JsonDeserialize(contentUsing = PlayerDeserializer.class)
    @JsonSerialize(contentUsing = PlayerSerializer.class)
    //Relacion muchos logros a muchos jugadores que lo han adquirido
    @ManyToMany(mappedBy = "accquiredAchievements")
    private List<Player> players = new ArrayList<>();


}
