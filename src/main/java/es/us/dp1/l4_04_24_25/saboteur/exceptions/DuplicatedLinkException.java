package es.us.dp1.l4_04_24_25.saboteur.exceptions;

public class DuplicatedLinkException extends RuntimeException {
    private static final long serialVersionUID = 1L; //Puede ser borrado??

    public DuplicatedLinkException(String message) {
        super(message);
    }
}
