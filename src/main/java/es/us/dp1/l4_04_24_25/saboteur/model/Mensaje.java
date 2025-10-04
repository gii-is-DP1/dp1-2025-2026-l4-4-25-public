package es.us.dp1.l4_04_24_25.saboteur.model;

import org.springframework.context.annotation.EnableAspectJAutoProxy;

import com.fasterxml.jackson.databind.JsonSerializable.Base;

import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;

import jakarta.persistence.Table;

@Entity
@Table(name="Mensaje")
public class Mensaje extends BaseEntity{
    
    @ManyToOne(optional = false)
    private Chat chat;

}
