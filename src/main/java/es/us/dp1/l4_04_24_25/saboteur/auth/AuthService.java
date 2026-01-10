package es.us.dp1.l4_04_24_25.saboteur.auth;

import java.util.ArrayList;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import es.us.dp1.l4_04_24_25.saboteur.auth.payload.request.SignupRequest;
import es.us.dp1.l4_04_24_25.saboteur.user.Authorities;
import es.us.dp1.l4_04_24_25.saboteur.user.AuthoritiesService;
import es.us.dp1.l4_04_24_25.saboteur.user.User;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.user.UserService;

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
		//CreateUser modificado para que cree un ActivePlayer, estos datos se extenderán a la tabla Player y User
		/*
		User user = new User();
		user.setUsername(request.getUsername());
		user.setPassword(encoder.encode(request.getPassword()));
		user.setName(request.getName());
		user.setBirthDate(request.getBirthDate());
		user.setImage(request.getImage());
		user.setEmail(request.getEmail());
		String strRoles = request.getAuthority();
		Authorities role;
		*/
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
			/*Player player = new Player();
			player.setFirstName(request.getFirstName());
			player.setLastName(request.getLastName());
			player.setAddress(request.getAddress());
			player.setCity(request.getCity());
			player.setTelephone(request.getTelephone());
			player.setUser(user);
			playerService.savePlayer(player);
			*/
		}
	}

}
