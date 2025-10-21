package es.us.dp1.l4_04_24_25.saboteur.achievements;


import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonBackReference; 

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.user.User;


@Entity
@Getter
@Setter
@Table(name = "Achievements")
public class Achievement extends BaseEntity{
    
    
    @NotBlank
    @Column (unique = true, nullable = false)
    private String tittle;

    @NotBlank
    @Column(name = "descripcion", nullable = false)
    private String description;

    @NotNull
    private Integer score = 0; 

    // Relacion muchos logros a un administrador que lo crea
    // CORRECCIÓN CLAVE: Lado INVERSO para la relación de creación (rompe el bucle con User).
    @JsonBackReference 
    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;
    
    // Hay que corregir la relacion de abajo en el modulo user pues ahora mismo no tiene campo de managedAchievements recordatorio por parte de Diego :D
    /* @ManyToMany(mappedBy = "managedAchievements")
    private List<User> admins = new ArrayList<>(); */ 
    
    
    
    @JsonBackReference 
    @ManyToMany(mappedBy = "accquiredAchievements")
    private List<Player> players = new ArrayList<>();
}