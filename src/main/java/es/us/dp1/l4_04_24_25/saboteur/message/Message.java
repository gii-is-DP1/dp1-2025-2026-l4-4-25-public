package es.us.dp1.l4_04_24_25.saboteur.message;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerSerializer;
import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.chat.Chat;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name="Message")
public class Message extends BaseEntity{

    @NotEmpty
    @Column(name = "text", nullable = false)
    private String text;
    
    //Relación muchos mensajes 1 participante

   
    @JsonSerialize(using = ActivePlayerSerializer.class)
    @JsonDeserialize(using = ActivePlayerDeserializer.class)
    @ManyToOne(optional = false)
    private ActivePlayer activePlayer;

    //Relación muchos mensajes 1 chat
    @ManyToOne(optional = false)
    private Chat chat;

}
