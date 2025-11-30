package es.us.dp1.l4_04_24_25.saboteur.round.builder;

import java.time.Duration;

import es.us.dp1.l4_04_24_25.saboteur.game.Game;

public abstract class AbstractRoundBuilder implements RoundBuilder {
    protected Game game;
    protected Integer roundNumber;
    protected Integer leftCards;
    protected Duration timeSpent;
    protected boolean winnerRol;

    @Override
    public RoundBuilder withGame(Game game) {
        this.game = game;
        return this;
    }

    @Override
    public RoundBuilder withRoundNumber(Integer roundNumber) {
        this.roundNumber = roundNumber;
        return this;
    }

    @Override
    public RoundBuilder withLeftCards(Integer leftCards) {
        this.leftCards = leftCards;
        return this;
    }

    @Override
    public RoundBuilder withTimeSpent(Duration timeSpent) {
        this.timeSpent = timeSpent;
        return this;
    }

    @Override
    public RoundBuilder withWinnerRol(boolean winnerRol) {
        this.winnerRol = winnerRol;
        return this;
    }
}
