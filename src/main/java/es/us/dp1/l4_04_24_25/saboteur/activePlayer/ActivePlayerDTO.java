package es.us.dp1.l4_04_24_25.saboteur.activePlayer;

import java.util.List;

import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.message.Message;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ActivePlayerDTO{

    private Boolean rol;
    private Integer goldNugget;
    private Boolean pickaxeState;
    private Boolean candleState;
    private Boolean cartState;
    private Game wonGame;
    private Game createdGame;
    private Deck deck;
    private List<Message> messages;

    public ActivePlayerDTO() {
    }

    public ActivePlayerDTO(Boolean rol, Integer goldNugget, Boolean pickaxeState, Boolean candleState,
            Boolean cartState, Game wonGame, Game createdGame, Deck deck, List<Message> messages) {
        this.rol = rol;
        this.goldNugget = goldNugget;
        this.pickaxeState = pickaxeState;
        this.candleState = candleState;
        this.cartState = cartState;
        this.wonGame = wonGame;
        this.createdGame = createdGame;
        this.deck = deck;
        this.messages = messages;

    }
}