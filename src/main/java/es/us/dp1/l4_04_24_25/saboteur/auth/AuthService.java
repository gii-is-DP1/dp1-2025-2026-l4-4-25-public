package es.us.dp1.l4_04_24_25.saboteur.auth;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.auth.payload.request.SignupRequest;
import es.us.dp1.l4_04_24_25.saboteur.user.Authorities;
import es.us.dp1.l4_04_24_25.saboteur.user.AuthoritiesService;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@Service
public class AuthService {

	private final PasswordEncoder encoder;
	private final AuthoritiesService authoritiesService;
	private final UserService userService;
	private final ActivePlayerService activePlayerService;
	

	@Autowired
	public AuthService(PasswordEncoder encoder, AuthoritiesService authoritiesService, UserService userService, ActivePlayerService activePlayerService
		) {
		this.encoder = encoder;
		this.authoritiesService = authoritiesService;
		this.userService = userService;
		this.activePlayerService = activePlayerService;		
	}

	@Transactional
	public void createUser(@Valid SignupRequest request) {
		// Validar que birthDate sea anterior a la fecha actual
		if (request.getBirthDate() != null) {
			try {
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
				LocalDate birthDate = LocalDate.parse(request.getBirthDate(), formatter);
				if (birthDate.isAfter(LocalDate.now()) || birthDate.isEqual(LocalDate.now())) {
					throw new IllegalArgumentException("Birth date must be before current date");
				}
			} catch (Exception e) {
				if (e instanceof IllegalArgumentException) {
					throw e;
				}
				throw new IllegalArgumentException("Invalid birth date format. Expected yyyy-MM-dd");
			}
		}
		
		//CreateUser modificado para que cree un ActivePlayer, estos datos se extenderán a la tabla Player y User

		ActivePlayer activePlayer = new ActivePlayer();
		activePlayer.setUsername(request.getUsername());
		activePlayer.setPassword(encoder.encode(request.getPassword()));
		activePlayer.setName(request.getName());
		activePlayer.setBirthDate(request.getBirthDate());
		activePlayer.setImage(request.getImage());
		activePlayer.setEmail(request.getEmail());
		String strRoles = request.getAuthority();
		Authorities role;

		switch (strRoles.toLowerCase()) {
		case "admin":
			role = authoritiesService.findByAuthority("ADMIN");
			activePlayer.setAuthority(role);
			activePlayerService.saveActivePlayer(activePlayer);
			break;
		default:
			role = authoritiesService.findByAuthority("PLAYER");
			activePlayer.setAuthority(role);
			activePlayerService.saveActivePlayer(activePlayer);
		}
	}

}
