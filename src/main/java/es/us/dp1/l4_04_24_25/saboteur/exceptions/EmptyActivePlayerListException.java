package es.us.dp1.l4_04_24_25.saboteur.exceptions;

public class EmptyActivePlayerListException extends RuntimeException {
    public EmptyActivePlayerListException(String message) {
        super(message);
    }
}