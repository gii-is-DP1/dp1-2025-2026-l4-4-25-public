package es.us.dp1.l4_04_24_25.saboteur.card;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
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
import com.fasterxml.jackson.annotation.JsonBackReference; 

@Getter
@Setter
@Entity
@Table(name = "Cards")
@Inheritance(strategy = InheritanceType.JOINED)
public class Card extends BaseEntity {

    @Column(name = "status", nullable = false)
    @NotNull
    protected boolean status;

    @Column(name = "image", nullable = false)
    @NotBlank
    protected String image;

    @JsonBackReference 
    @ManyToOne
    protected Deck deck;
}