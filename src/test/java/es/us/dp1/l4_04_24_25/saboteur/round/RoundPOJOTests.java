package es.us.dp1.l4_04_24_25.saboteur.round;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class RoundPOJOTests {

    @Test
    void testRoundGettersSetters() {
        Round r = new Round();
        r.setId(10);
        assertEquals(10, r.getId());

        // Añadir pruebas de lógica más específicas si son necesarias según la complejidad de Round
        // Se asume que Round es principalmente un POJO aquí según el tamaño del archivo
    }
}
