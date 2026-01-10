package es.us.dp1.l4_04_24_25.saboteur.baseEntities;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class BaseEntityTests {

    @Test
    void shouldCreateBaseEntityWithId() {
        // Using a concrete implementation for testing
        TestableBaseEntity entity = new TestableBaseEntity();
        entity.setId(1);

        assertEquals(1, entity.getId());
    }

    @Test
    void shouldBeNewWhenIdIsNull() {
        TestableBaseEntity entity = new TestableBaseEntity();
        assertTrue(entity.isNew());
    }

    @Test
    void shouldNotBeNewWhenIdIsSet() {
        TestableBaseEntity entity = new TestableBaseEntity();
        entity.setId(1);
        assertFalse(entity.isNew());
    }

    @Test
    void shouldBeEqualWhenSameId() {
        TestableBaseEntity entity1 = new TestableBaseEntity();
        entity1.setId(1);

        TestableBaseEntity entity2 = new TestableBaseEntity();
        entity2.setId(1);

        assertEquals(entity1, entity2);
    }

    @Test
    void shouldNotBeEqualWhenDifferentId() {
        TestableBaseEntity entity1 = new TestableBaseEntity();
        entity1.setId(1);

        TestableBaseEntity entity2 = new TestableBaseEntity();
        entity2.setId(2);

        assertNotEquals(entity1, entity2);
    }

    @Test
    void shouldHaveSameHashCodeWhenSameId() {
        TestableBaseEntity entity1 = new TestableBaseEntity();
        entity1.setId(1);

        TestableBaseEntity entity2 = new TestableBaseEntity();
        entity2.setId(1);

        assertEquals(entity1.hashCode(), entity2.hashCode());
    }

    // Concrete implementation for testing
    private static class TestableBaseEntity extends BaseEntity {
    }
}
