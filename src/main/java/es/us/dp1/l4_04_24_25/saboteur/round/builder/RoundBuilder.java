package es.us.dp1.l4_04_24_25.saboteur.round.builder;

import java.time.Duration;

import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;

public interface RoundBuilder {
    RoundBuilder withGame(Game game);
    RoundBuilder withRoundNumber(Integer roundNumber);
    RoundBuilder withLeftCards(Integer leftCards);
    RoundBuilder withTimeSpent(Duration timeSpent);
    RoundBuilder withWinnerRol(boolean winnerRol);
    Round build();
}
