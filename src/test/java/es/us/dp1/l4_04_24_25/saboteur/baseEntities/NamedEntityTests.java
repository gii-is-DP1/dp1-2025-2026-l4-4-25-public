package es.us.dp1.l4_04_24_25.saboteur.baseEntities;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class NamedEntityTests {

    @Test
    void shouldSetAndGetName() {
        TestableNamedEntity entity = new TestableNamedEntity();
        entity.setName("TestName");

        assertEquals("TestName", entity.getName());
    }

    @Test
    void shouldReturnNameInToString() {
        TestableNamedEntity entity = new TestableNamedEntity();
        entity.setName("TestEntityName");

        assertEquals("TestEntityName", entity.toString());
    }

    @Test
    void shouldInheritBaseEntityFunctionality() {
        TestableNamedEntity entity = new TestableNamedEntity();
        entity.setId(1);
        entity.setName("Test");

        assertEquals(1, entity.getId());
        assertFalse(entity.isNew());
    }

    @Test
    void shouldHandleNullName() {
        TestableNamedEntity entity = new TestableNamedEntity();
        assertNull(entity.getName());
        assertNull(entity.toString());
    }

    // Concrete implementation for testing
    private static class TestableNamedEntity extends NamedEntity {
    }
}
