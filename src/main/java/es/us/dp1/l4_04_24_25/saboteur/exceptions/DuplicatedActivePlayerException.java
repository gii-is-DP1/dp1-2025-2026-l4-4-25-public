package es.us.dp1.l4_04_24_25.saboteur.exceptions;

public class DuplicatedActivePlayerException extends RuntimeException {
    public DuplicatedActivePlayerException(String message) {
        super(message);
    }
}