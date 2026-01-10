package es.us.dp1.l4_04_24_25.saboteur.card;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter; 

@Getter
@Setter
@Entity
@Table(name = "Card")
@Inheritance(strategy = InheritanceType.JOINED)
public class Card extends BaseEntity {

    @Column(name = "status", nullable = false)
    @NotNull
    private boolean status = false;

    @Column(name = "image", nullable = false)
    @NotBlank
    private String image;

    @JsonDeserialize(using = DeckDeserializer.class)
    @JsonSerialize(using = DeckSerializer.class)
    @ManyToOne
    private Deck deck;
}