package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckSerializer;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.game.GameSerializer;
import es.us.dp1.l4_04_24_25.saboteur.message.Message;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageSerializer;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.Max;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
//@Table(name = "ActivePlayer")
public class ActivePlayer extends Player{

    private boolean rol;

    @Max(50)
    private Integer goldNugget = 0;

    private boolean pickaxeState = true;

    private boolean candleState = true;

    private boolean cartState = true;

    //Relación 1 participante gana n partidas
    @JsonSerialize(contentUsing = GameSerializer.class)
    @JsonDeserialize(contentUsing = GameDeserializer.class)
    @OneToMany (mappedBy = "winner")
    private List<Game> wonGame;

    //Relación 1 participante crea n partidas
    @JsonSerialize(contentUsing = GameSerializer.class)
    @JsonDeserialize(contentUsing = GameDeserializer.class)
    @OneToMany (mappedBy = "creator")
    private List<Game> createdGames = new ArrayList<>();

    // Relación 1 participante 1 mano
    @OneToOne
    @JsonDeserialize(using= DeckDeserializer.class)
    @JsonSerialize(using= DeckSerializer.class)
    @JoinColumn(name = "deck_id")
    private Deck deck;

    

    //Relación 1 participante varios mensajes
    @JsonDeserialize(contentUsing = MessageDeserializer.class)
    @JsonSerialize(contentUsing = MessageSerializer.class)
    @OneToMany(mappedBy = "activePlayer")
    private List<Message> messages = new ArrayList<>();
}