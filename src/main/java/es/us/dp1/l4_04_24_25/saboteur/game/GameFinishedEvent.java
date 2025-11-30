package es.us.dp1.l4_04_24_25.saboteur.game;

import org.springframework.context.ApplicationEvent;

public class GameFinishedEvent extends ApplicationEvent {

    private final Game game;
    public GameFinishedEvent(Object source, Game game) {
        super(source);
        this.game = game;
    }

    public Game getGame() {
        return game;
    }
    
}
