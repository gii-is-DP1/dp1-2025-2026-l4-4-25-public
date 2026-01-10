package es.us.dp1.l4_04_24_25.saboteur.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;

class ModelPOJOTests {

    @Test
    void testPerson() {
        Person p = new Person();

        p.setFirstName("John");
        assertEquals("John", p.getFirstName());

        p.setLastName("Doe");
        assertEquals("Doe", p.getLastName());

        p.setId(1);
        assertEquals(1, p.getId());

        // Test properties if any other
    }
}
