package es.us.dp1.l4_04_24_25.saboteur.model;

import org.springframework.context.annotation.EnableAspectJAutoProxy;

import com.fasterxml.jackson.databind.JsonSerializable.Base;

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
    @ManyToOne(optional = false)
    private ActivePlayer activePlayer;

    //Relación muchos mensajes 1 chat
    @ManyToOne(optional = false)
    private Chat chat;

}
