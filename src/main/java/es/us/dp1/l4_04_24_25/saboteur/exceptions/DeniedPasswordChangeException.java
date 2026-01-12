package es.us.dp1.l4_04_24_25.saboteur.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import lombok.Getter;

@ResponseStatus(value = HttpStatus.FORBIDDEN)
@Getter
public class DeniedPasswordChangeException extends RuntimeException {

	private static final long serialVersionUID = -1461835347378078102L;

	public DeniedPasswordChangeException() {
		super("You can't modify other user password");
	}
	
	public DeniedPasswordChangeException(String message) {
		super(message);
	}
	
}
