package es.us.dp1.l4_04_24_25.saboteur.model;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "Chat")
public class Chat {
    @OneToMany(mappedBy = "chat")
    private List<Mensaje> mensajes = new ArrayList<>();
}
