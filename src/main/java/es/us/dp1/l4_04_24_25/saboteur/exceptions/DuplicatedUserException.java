package es.us.dp1.l4_04_24_25.saboteur.exceptions;

public class DuplicatedUserException extends RuntimeException {
    private static final long serialVersionUID = 1L;

    public DuplicatedUserException(String message) {
        super(message);
    }
}
