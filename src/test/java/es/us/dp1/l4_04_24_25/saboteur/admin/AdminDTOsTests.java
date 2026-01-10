package es.us.dp1.l4_04_24_25.saboteur.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class AdminDTOsTests {

    @Test
    void shouldTestForceFinishRequest() {
        ForceFinishRequest req = new ForceFinishRequest();
        req.setReason("test");
        assertEquals("test", req.getReason());

        ForceFinishRequest req2 = new ForceFinishRequest("test");
        assertEquals(req, req2);
        assertEquals(req.hashCode(), req2.hashCode());
        assertTrue(req.toString().contains("test"));
    }

    @Test
    void shouldTestExpelPlayerRequest() {
        ExpelPlayerRequest req = new ExpelPlayerRequest();
        req.setUsername("user");
        req.setReason("reason");

        assertEquals("user", req.getUsername());
        assertEquals("reason", req.getReason());

        ExpelPlayerRequest req2 = new ExpelPlayerRequest("user", "reason");
        assertEquals(req, req2);
        assertEquals(req.hashCode(), req2.hashCode());
        assertTrue(req.toString().contains("user"));
    }

    @Test
    void shouldTestAdminActionMessage() {
        AdminActionMessage msg = new AdminActionMessage("ACTION", "reason", "player");
        assertEquals("ACTION", msg.getAction());
        assertEquals("reason", msg.getReason());
        assertEquals("player", msg.getAffectedPlayer());

        AdminActionMessage msg2 = new AdminActionMessage("ACTION", "reason");
        assertEquals("ACTION", msg2.getAction());
        assertEquals("reason", msg2.getReason());
        assertNull(msg2.getAffectedPlayer());

        msg2.setAffectedPlayer("player");
        assertEquals(msg, msg2);
        assertEquals(msg.hashCode(), msg2.hashCode());
        assertTrue(msg.toString().contains("ACTION"));
    }
}
