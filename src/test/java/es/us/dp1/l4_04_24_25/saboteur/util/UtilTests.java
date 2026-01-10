package es.us.dp1.l4_04_24_25.saboteur.util;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.orm.ObjectRetrievalFailureException;

import es.us.dp1.l4_04_24_25.saboteur.baseEntities.BaseEntity;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;

class UtilTests {

    static class TestEntity extends BaseEntity {
        // ID inherited
    }

    @Test
    void testEntityUtils() {
        TestEntity e1 = new TestEntity();
        e1.setId(1);
        TestEntity e2 = new TestEntity();
        e2.setId(2);

        List<TestEntity> list = List.of(e1, e2);

        assertEquals(e1, EntityUtils.getById(list, TestEntity.class, 1));
        assertThrows(ObjectRetrievalFailureException.class,
                () -> EntityUtils.getById(list, TestEntity.class, 99));
    }

    @Test
    void testRestPreconditions() {
        String res = "exists";
        assertEquals(res, RestPreconditions.checkNotNull(res, "Res", "id", 1));

        assertThrows(ResourceNotFoundException.class,
                () -> RestPreconditions.checkNotNull(null, "Res", "id", 1));
    }
}
