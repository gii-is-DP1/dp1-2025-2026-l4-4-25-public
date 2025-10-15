package es.us.dp1.l4_04_24_25.saboteur.chat;

import java.util.ArrayList;
import java.util.List;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.message.Message;
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
    
   
    @OneToMany(mappedBy = "chat")
    private List<Message> messages = new ArrayList<>();

    //Relacion 1 chat 1 partida

    
    @OneToOne(mappedBy = "chat")
    private Game game;
}
