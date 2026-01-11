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
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Achievements")
public class Achievement extends BaseEntity{

    @NotBlank
    @Column (unique = true, nullable = false)
    private String tittle;

    @NotBlank
    @Column(name = "description", nullable = false)
    private String description;


    @Lob
    private String badgeImage;

    @Min(1)
    private Integer threshold; 

    @Enumerated(EnumType.STRING)
    @NotNull
    Metric metric;

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

    public String getActualDescription(){
        return description.replace("<THRESHOLD>",String.valueOf(threshold));
    }


}