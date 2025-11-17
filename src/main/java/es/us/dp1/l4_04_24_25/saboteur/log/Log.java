package es.us.dp1.l4_04_24_25.saboteur.log;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.round.Round;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.round.RoundSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;


@Entity
@Getter
@Setter
@Table(name = "Log")
public class Log extends BaseEntity {

    @OneToOne
    @JoinColumn(name = "round_id", nullable = false)
    @JsonSerialize(using=RoundSerializer.class)
    @JsonDeserialize(using=RoundDeserializer.class)
    private Round round;

    @Column(name = "message", nullable = false)
    private String message;
}
    