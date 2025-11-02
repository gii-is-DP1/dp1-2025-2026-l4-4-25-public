package es.us.dp1.l4_04_24_25.saboteur.chat;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.game.GameSerializer;
import es.us.dp1.l4_04_24_25.saboteur.message.Message;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageDeserializer;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageSerializer;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter

@Table(name = "Chat")
public class Chat extends BaseEntity {

    //Relacion 1 chat muchos mensajes
    
   
    @OneToMany(mappedBy = "chat", cascade = CascadeType.ALL)
    @JsonSerialize(contentUsing = MessageSerializer.class)
    @JsonDeserialize(contentUsing = MessageDeserializer.class)
    private List<Message> messages = new ArrayList<>();

    //Relacion 1 chat 1 partida

    
    @JsonDeserialize(using= GameDeserializer.class)
    @JsonSerialize(using=GameSerializer.class)
    @OneToOne(mappedBy = "chat")
    private Game game;
}
