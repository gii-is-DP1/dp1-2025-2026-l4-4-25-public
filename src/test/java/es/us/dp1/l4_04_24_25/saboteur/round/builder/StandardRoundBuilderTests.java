package es.us.dp1.l4_04_24_25.saboteur.round.builder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.time.Duration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;

@SpringBootTest
@AutoConfigureTestDatabase
@Transactional
class StandardRoundBuilderTests {

    @Autowired
    private StandardRoundBuilder standardRoundBuilder;

    @Autowired
    private GameService gameService;

    @org.junit.jupiter.api.BeforeEach
    void resetBuilder() {
        ((AbstractRoundBuilder) standardRoundBuilder).withGame(null);
        ((AbstractRoundBuilder) standardRoundBuilder).withRoundNumber(null);
        ((AbstractRoundBuilder) standardRoundBuilder).withLeftCards(null);
        ((AbstractRoundBuilder) standardRoundBuilder).withTimeSpent(null);
        ((AbstractRoundBuilder) standardRoundBuilder).withWinnerRol(false);
    }

    @Test
    void shouldBuildRoundWithAllProperties() {
        Game game = gameService.findGame(1);

        Round round = standardRoundBuilder
                .withGame(game)
                .withRoundNumber(2)
                .withLeftCards(50)
                .withTimeSpent(Duration.ofMinutes(5))
                .withWinnerRol(true)
                .build();

        assertNotNull(round);
        assertEquals(2, round.getRoundNumber());
        assertEquals(50, round.getLeftCards());
        assertEquals(Duration.ofMinutes(5), round.getTimeSpent());
        assertEquals(true, round.getWinnerRol());
        assertEquals(game.getId(), round.getGame().getId());
    }

    @Test
    void shouldBuildRoundWithDefaultValues() {
        Game game = gameService.findGame(1);

        Round round = standardRoundBuilder
                .withGame(game)
                .build();

        assertNotNull(round);
        assertEquals(1, round.getRoundNumber()); // default
        assertEquals(70, round.getLeftCards()); // default
        assertEquals(Duration.ZERO, round.getTimeSpent()); // default
    }

    @Test
    void shouldCreateBoardWithCorrectDimensions() {
        Game game = gameService.findGame(1);

        Round round = standardRoundBuilder
                .withGame(game)
                .withRoundNumber(1)
                .build();

        assertNotNull(round.getBoard());
        assertEquals(11, round.getBoard().getBase());
        assertEquals(9, round.getBoard().getHeight());
    }

    @Test
    void shouldCreateLogForRound() {
        Game game = gameService.findGame(1);

        Round round = standardRoundBuilder
                .withGame(game)
                .withRoundNumber(1)
                .build();

        assertNotNull(round.getLog());
    }

    @Test
    void shouldChainBuilderMethods() {
        Game game = gameService.findGame(1);

        RoundBuilder builder = standardRoundBuilder.withGame(game);
        assertNotNull(builder);

        builder = builder.withRoundNumber(1);
        assertNotNull(builder);

        builder = builder.withLeftCards(50);
        assertNotNull(builder);

        builder = builder.withTimeSpent(Duration.ZERO);
        assertNotNull(builder);

        builder = builder.withWinnerRol(false);
        assertNotNull(builder);
    }

    @Test
    void shouldCreateBoardWithObjectiveCards() {
        Game game = gameService.findGame(1);

        Round round = standardRoundBuilder
                .withGame(game)
                .withRoundNumber(1)
                .build();

        assertNotNull(round.getBoard());
        String objectiveCardsOrder = round.getBoard().getObjectiveCardsOrder();
        assertNotNull(objectiveCardsOrder);
        // Should contain gold, carbon_1, carbon_2 in some order
        String[] cards = objectiveCardsOrder.split(",");
        assertEquals(3, cards.length);
    }
}
