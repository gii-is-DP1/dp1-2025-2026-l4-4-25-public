/*
 * Copyright 2002-2013 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package es.us.dp1.l4_04_24_25.saboteur.user;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerRepository;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.deck.Deck;
import es.us.dp1.l4_04_24_25.saboteur.deck.DeckService;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.game.Game;
import es.us.dp1.l4_04_24_25.saboteur.game.GameService;
import es.us.dp1.l4_04_24_25.saboteur.message.Message;
import es.us.dp1.l4_04_24_25.saboteur.message.MessageService;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerRepository;
import jakarta.validation.Valid;





@Service
public class UserService {

	private UserRepository userRepository;
	private final PasswordEncoder passwordEncoder; 
	private final PlayerRepository playerRepository;
	private final AuthoritiesService authoritiesService;
	private final ActivePlayerService activePlayerService;
	private ActivePlayerRepository activePlayerRepository;
	private final DeckService deckService;
	private final GameService gameService;
	private final MessageService messageService;



	@Autowired
	public UserService(UserRepository userRepository, ActivePlayerRepository activePlayerRepository, 
	                   PasswordEncoder passwordEncoder, PlayerRepository playerRepository, 
	                   AuthoritiesService authoritiesService, ActivePlayerService activePlayerService,
	                   DeckService deckService, GameService gameService, MessageService messageService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder; 
		this.playerRepository = playerRepository;
		this.authoritiesService = authoritiesService; 
		this.activePlayerService = activePlayerService;
		this.activePlayerRepository = activePlayerRepository;
		this.deckService = deckService;
		this.gameService = gameService;
		this.messageService = messageService;
	}

	@Transactional
	public User saveUser(User user) throws DataAccessException {

		// Validar que birthDate sea anterior a la fecha actual
		if (user.getBirthDate() != null) {
			try {
				DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
				LocalDate birthDate = LocalDate.parse(user.getBirthDate(), formatter);
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

		ActivePlayer activePlayer = new ActivePlayer();
		activePlayer.setUsername(user.getUsername());
		activePlayer.setPassword(user.getPassword());
		activePlayer.setName(user.getName());
		activePlayer.setBirthDate(user.getBirthDate());
		activePlayer.setImage(user.getImage());
		activePlayer.setEmail(user.getEmail());
		String strRoles = user.getAuthority().authority;
		Authorities role;

		

		switch (strRoles.toLowerCase()) {
		case "admin":
			role = authoritiesService.findByAuthority("ADMIN");
			activePlayer.setAuthority(role);
			break;
		default:
			role = authoritiesService.findByAuthority("PLAYER");
			activePlayer.setAuthority(role);
			
		}
		return activePlayerRepository.save(activePlayer); 
	}

	@Transactional(readOnly = true)
	public UserDTO findByUsernameDTO(String username) {
		User user = userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "Username", username));
		return new UserDTO(user.getId(),user.getUsername(), user.getName(), user.getBirthDate(),
				user.getJoined(), user.getImage(), user.getEmail(), user.getAuthority().getAuthority());
	}

	@Transactional(readOnly = true)
	public User findByUsername(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "Username", username));
	}

	@Transactional(readOnly = true)
	public User findUser(Integer id) {
		return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
	}

	@Transactional(readOnly = true)
	public UserDTO findUserDTO(Integer id) {
		User user = userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
		return new UserDTO(user.getId(),user.getUsername(), user.getName(), user.getBirthDate(),
				user.getJoined(), user.getImage(), user.getEmail(), user.getAuthority().getAuthority());
	}
	@Transactional(readOnly = true)
	public User findCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null)
			throw new ResourceNotFoundException("Nobody authenticated!");
		else {
			return userRepository.findByUsername(auth.getName())
					.orElseThrow(() -> new ResourceNotFoundException("User", "Username", auth.getName()));
		}
	}

	@Transactional(readOnly = true)
	public UserDTO findCurrentUserDTO() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null)
			throw new ResourceNotFoundException("Nobody authenticated!");
		else {
			User currentUser = userRepository.findByUsername(auth.getName())
					.orElseThrow(() -> new ResourceNotFoundException("User", "Username", auth.getName()));
			return new UserDTO(currentUser.getId(),currentUser.getUsername(), currentUser.getName(), currentUser.getBirthDate(),
				currentUser.getJoined(), currentUser.getImage(), currentUser.getEmail(), currentUser.getAuthority().getAuthority());
		}
	}

	public Boolean existsUser(String username) {
		return userRepository.existsByUsername(username);
	}

	@Transactional(readOnly = true)
	public List<UserDTO> findAll() {
		Iterable<User> users =userRepository.findAll();
		List<UserDTO> res = new ArrayList<>();
		for (User user : users) {
			res.add(new UserDTO(user.getId(),user.getUsername(), user.getName(), user.getBirthDate(),
				user.getJoined(), user.getImage(), user.getEmail(), user.getAuthority().getAuthority()));
		}
		return res;
	}

	public List<UserDTO> findAllByAuthority(String auth) {
		Iterable<User> users = userRepository.findAllByAuthority(auth);
		List<UserDTO> res = new ArrayList<>();
		for (User user : users) {
			res.add(new UserDTO(user.getId(),user.getUsername(), user.getName(), user.getBirthDate(),
				user.getJoined(), user.getImage(), user.getEmail(), user.getAuthority().getAuthority()));
		}
		return res;
	}

	@Transactional
	public User updateUser(@Valid User user, Integer idToUpdate) {
    User toUpdate = findUser(idToUpdate);
    
	// Validar que birthDate sea anterior a la fecha actual si se está actualizando
	if (user.getBirthDate() != null && !user.getBirthDate().trim().isEmpty()) {
		try {
			DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
			LocalDate birthDate = LocalDate.parse(user.getBirthDate(), formatter);
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
    
    BeanUtils.copyProperties(user, toUpdate, "id", "authority", "password");
    String newPassword = user.getPassword();
	Authorities authority = user.getAuthority();

	
	if (newPassword != null && !newPassword.trim().isEmpty()){
		
		toUpdate.setPassword(passwordEncoder.encode(newPassword));
	}
	if (authority != null && authoritiesService.findByAuthority(authority.getAuthority()) != null){
		toUpdate.setAuthority(authority);
	}

	userRepository.save(toUpdate);
    return toUpdate;
}
	@Transactional
	public void deleteUser(Integer id) {
		User toDelete = findUser(id);
		
		boolean isPlayer = toDelete instanceof Player;
		boolean isActivePlayer = toDelete instanceof ActivePlayer;

		if (isPlayer) {
			Player player = (Player) toDelete;
			detachPlayerRelationships(player);
		}
		
		if (isActivePlayer) {
			ActivePlayer activePlayer = (ActivePlayer) toDelete;
			detachActivePlayerRelationships(activePlayer);
		}
	
		detachUserRelationships(toDelete);
		
		this.userRepository.delete(toDelete);
	}
	
	private void detachUserRelationships(User user) {
	
		for (Achievement achievement : new ArrayList<>(user.getCreatedAchievements())) {
			achievement.setCreator(null);
			
		}
		user.getCreatedAchievements().clear();
	}
	
	private void detachPlayerRelationships(Player player) {
		
		for (Player friend : new ArrayList<>(player.getFriends())) {
			friend.getFriends().remove(player);
		}
		player.getFriends().clear();
		
		for (Achievement achievement : new ArrayList<>(player.getAccquiredAchievements())) {
			achievement.getPlayers().remove(player);
		}
		player.getAccquiredAchievements().clear();
		
		
		Game game = player.getGame();
		if (game != null) {
			game.getWatchers().remove(player);
			player.setGame(null);
		}
	}
	
	private void detachActivePlayerRelationships(ActivePlayer activePlayer) {
		
		Deck deck = activePlayer.getDeck();
		if (deck != null) {
			deck.setActivePlayer(null);
			activePlayer.setDeck(null);
			deckService.saveDeck(deck);
		}
		
	
		for (Game created : new ArrayList<>(activePlayer.getCreatedGames())) {
			created.setCreator(null);
			gameService.saveGame(created);
		}
		activePlayer.getCreatedGames().clear();
	
		for (Game won : new ArrayList<>(activePlayer.getWonGame())) {
			won.setWinner(null);
			gameService.saveGame(won);
		}
		activePlayer.getWonGame().clear();
		
		
		Iterable<Game> gamesWithActivePlayer = gameService.findAllByActivePlayerId(activePlayer.getId());
		for (Game game : gamesWithActivePlayer) {
			if (game.getActivePlayers().remove(activePlayer)) {
				gameService.saveGame(game);
			}
		}
		

		for (Message message : new ArrayList<>(activePlayer.getMessages())) {
			message.setActivePlayer(null);
			messageService.saveMessage(message);
		}
		activePlayer.getMessages().clear();
	}
}
