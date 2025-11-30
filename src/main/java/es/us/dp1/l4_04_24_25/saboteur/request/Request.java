package es.us.dp1.l4_04_24_25.saboteur.request;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerSerializer;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
public class Request extends BaseEntity{

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RequestStatus status;

    @JsonSerialize(using = PlayerSerializer.class)
    @JsonDeserialize(using = PlayerDeserializer.class)
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private Player sender;

    @JsonSerialize(using = PlayerSerializer.class)
    @JsonDeserialize(using = PlayerDeserializer.class)
    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private Player receiver;
}
