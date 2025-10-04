package es.us.dp1.l4_04_24_25.saboteur.model;

import java.util.ArrayList;
import java.util.List;


import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;


@Entity
@Table(name = "Mano")
public class Mano extends BaseEntity{

    //Relación 1 mano muchas cartas
    @OneToMany(mappedBy = "mano")
    private List<Carta> cartas = new ArrayList<>();

    //Relación 1 mano 1 participante
    @OneToOne(mappedBy = "mano")
    private Participante participante;

}