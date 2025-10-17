package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import java.util.ArrayList;
import java.util.List;

import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.message.Message;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.square.Square;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "ActivePlayer")
public class ActivePlayer extends Player{

    private boolean rol;

    @Max(50)
    private Integer goldNugget = 0;

    private boolean pickaxeState;

    private boolean candleState;

    private boolean cartState;

    //Relación 1 participante gana 1 partida
    @OneToOne
    @JoinColumn(name = "wonGame_id")
    private Game wonGame;

    //Relación 1 participante crea 1 partida
    @OneToOne
    @JoinColumn(name = "createdGame_id")
    private Game createdGame;

    // Relación 1 participante 1 mano
    @OneToOne
    @JoinColumn(name = "deck_id")
    private Deck deck;

    

    //Relación 1 participante varios mensajes
    @OneToMany(mappedBy = "activePlayer")
    private List<Message> messages = new ArrayList<>();
}