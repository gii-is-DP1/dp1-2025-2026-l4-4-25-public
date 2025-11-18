package es.us.dp1.l4_04_24_25.saboteur.game;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerSerializer;
import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.chat.Chat;
import es.us.dp1.l4_04_24_25.saboteur.chat.ChatDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.chat.ChatSerializer;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerSerializer;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundSerializer;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "Game")
public class Game extends BaseEntity{

    @jakarta.persistence.Convert(converter = DurationSecondsConverter.class)
    @Column(name = "time_seconds", nullable = false)
    private Duration time = Duration.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "game_status", nullable = false)
    private gameStatus gameStatus = Enum.valueOf(gameStatus.class, "CREATED");

    @Column(unique = true, nullable = false)
    private String link;

    @Column(nullable = false)
    private boolean isPrivate = true;

    @Max(value = 12, message = "El número máximo de jugadores no puede ser mayor de 12")
    @Min(value = 3, message = "El número mínimo de jugadores no puede ser menor de 3")
    @Column(nullable = false)

    private Integer maxPlayers = 3;

    /* 
    // Relacion varias partidas son gestionadas por varios administradores
    @ManyToMany(mappedBy = "managedGames")
    private List<User> admins = new ArrayList<>();
*/
    // Relación 1 partidas son observadas por n jugador

    @JsonSerialize(contentUsing  = PlayerSerializer.class)
    @JsonDeserialize(contentUsing = PlayerDeserializer.class)
    @OneToMany(mappedBy = "game")
    private List<Player> watchers = new ArrayList<>();

    //Relacion n partida es jugada por n participantes

    @JsonSerialize(contentUsing  = ActivePlayerSerializer.class)
    @JsonDeserialize(contentUsing = ActivePlayerDeserializer.class)
    @ManyToMany
    @JoinTable(
        name = "game_activePlayers",
        joinColumns = @JoinColumn(name = "game_id"),
        inverseJoinColumns = @JoinColumn(name = "activePlayer_id")
    )
    private List<ActivePlayer> activePlayers = new ArrayList<>();

    //Relacion 1 partida es ganada por 1 participante
    @JsonSerialize(using = ActivePlayerSerializer.class)
    @JsonDeserialize(using = ActivePlayerDeserializer.class)
    @ManyToOne()
    private ActivePlayer winner;

    @JsonSerialize(using = ActivePlayerSerializer.class)
    @JsonDeserialize(using = ActivePlayerDeserializer.class)
    //Relacion 1 partida es creada por 1 participante
    @ManyToOne
    private ActivePlayer creator;

    //Relacion 1 partida tiene 3 rondas
    @JsonDeserialize(contentUsing = RoundDeserializer.class)
    @JsonSerialize(contentUsing = RoundSerializer.class)
    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL)
    private List<Round> rounds = new ArrayList<>();

    //Relacion 1 partida 1 chat
    @JsonDeserialize(using = ChatDeserializer.class)
    @JsonSerialize(using = ChatSerializer.class)
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    private Chat chat;


    public void agregarRonda (Round ronda){
        if(rounds.size()<3){
            rounds.add(ronda);
            ronda.setGame(this);
        } else{
            throw new IllegalStateException("Una partida no puede tener más de 3 rondas");
        }
    }

    
    public boolean canAddPlayer(){
        return this.activePlayers.size() < this.maxPlayers;
    }

}
