package es.us.dp1.l4_04_24_25.saboteur.exceptions;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Date;

import org.junit.jupiter.api.Test;

class ExceptionsTests {

    @Test
    void shouldCreateResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("User", "id", 1);
        assertNotNull(ex);
        assertTrue(ex.getMessage().contains("User"));
        assertTrue(ex.getMessage().contains("id"));
    }

    @Test
    void shouldCreateResourceNotOwnedException() {
        // ResourceNotOwnedException takes an Object parameter
        Object testObject = new Object() {
        };
        ResourceNotOwnedException ex = new ResourceNotOwnedException(testObject);
        assertNotNull(ex);
        assertTrue(ex.getMessage().contains("not owned"));
    }

    @Test
    void shouldCreateAccessDeniedException() {
        AccessDeniedException ex = new AccessDeniedException("Access denied message");
        assertNotNull(ex);
        assertEquals("Access denied message", ex.getMessage());
    }

    @Test
    void shouldCreateAccessDeniedExceptionWithDefaultMessage() {
        AccessDeniedException ex = new AccessDeniedException();
        assertNotNull(ex);
    }

    @Test
    void shouldCreateBadRequestException() {
        BadRequestException ex = new BadRequestException("Bad request message");
        assertNotNull(ex);
        assertEquals("Bad request message", ex.getMessage());
    }

    @Test
    void shouldCreateDuplicatedAchievementException() {
        DuplicatedAchievementException ex = new DuplicatedAchievementException("Achievement already exists");
        assertNotNull(ex);
        assertEquals("Achievement already exists", ex.getMessage());
    }

    @Test
    void shouldCreateDuplicatedActivePlayerException() {
        DuplicatedActivePlayerException ex = new DuplicatedActivePlayerException("Active player already exists");
        assertNotNull(ex);
        assertEquals("Active player already exists", ex.getMessage());
    }

    @Test
    void shouldCreateDuplicatedPlayerException() {
        DuplicatedPlayerException ex = new DuplicatedPlayerException("Player already exists");
        assertNotNull(ex);
        assertEquals("Player already exists", ex.getMessage());
    }

    @Test
    void shouldCreateDuplicatedSquareException() {
        DuplicatedSquareException ex = new DuplicatedSquareException("Square already exists");
        assertNotNull(ex);
        assertEquals("Square already exists", ex.getMessage());
    }

    @Test
    void shouldCreateDuplicatedUserException() {
        DuplicatedUserException ex = new DuplicatedUserException("testUser");
        assertNotNull(ex);
        assertTrue(ex.getMessage().contains("testUser"));
    }

    @Test
    void shouldCreateEmptyActivePlayerListException() {
        EmptyActivePlayerListException ex = new EmptyActivePlayerListException("List is empty");
        assertNotNull(ex);
        assertEquals("List is empty", ex.getMessage());
    }

    @Test
    void shouldCreateDeniedPasswordChangeException() {
        DeniedPasswordChangeException ex = new DeniedPasswordChangeException("Password change denied");
        assertNotNull(ex);
    }

    @Test
    void shouldCreateErrorMessage() {
        Date date = new Date();
        ErrorMessage errorMessage = new ErrorMessage(404, date, "Not found", "Details here");

        assertNotNull(errorMessage);
        assertEquals(404, errorMessage.getStatusCode());
        assertEquals(date, errorMessage.getTimestamp());
        assertEquals("Not found", errorMessage.getMessage());
        assertEquals("Details here", errorMessage.getDescription());
    }

    @Test
    void shouldGetErrorMessageProperties() {
        Date date = new Date();
        ErrorMessage errorMessage = new ErrorMessage(500, date, "Error", "Description");

        // Test all getters
        assertEquals(500, errorMessage.getStatusCode());
        assertEquals(date, errorMessage.getTimestamp());
        assertEquals("Error", errorMessage.getMessage());
        assertEquals("Description", errorMessage.getDescription());
    }
}
