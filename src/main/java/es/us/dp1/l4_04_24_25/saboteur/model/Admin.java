package es.us.dp1.l4_04_24_25.saboteur.model;

import java.util.ArrayList;
import java.util.List;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "Admin")
public class Admin extends User {

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