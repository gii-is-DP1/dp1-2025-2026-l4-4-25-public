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

import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayer;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerRepository;
import jakarta.validation.Valid;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerService;
import es.us.dp1.l4_04_24_25.saboteur.activePlayer.ActivePlayerRepository;





@Service
public class UserService {

	private UserRepository userRepository;
	private final PasswordEncoder passwordEncoder; 
	private final PlayerRepository playerRepository;
	private final AuthoritiesService authoritiesService;
	private final ActivePlayerService activePlayerService;
	private ActivePlayerRepository activePlayerRepository;



	@Autowired
	public UserService(UserRepository userRepository, ActivePlayerRepository activePlayerRepository, PasswordEncoder passwordEncoder, PlayerRepository playerRepository, AuthoritiesService authoritiesService, ActivePlayerService activePlayerService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder; 
		this.playerRepository = playerRepository;
		this.authoritiesService = authoritiesService; 
		this.activePlayerService = activePlayerService;
		this.activePlayerRepository = activePlayerRepository; 

	}

	@Transactional
	public User saveUser(User user) throws DataAccessException {
		ActivePlayer activePlayer = new ActivePlayer();
		activePlayer.setUsername(user.getUsername());
		activePlayer.setPassword(passwordEncoder.encode(user.getPassword()));
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
    BeanUtils.copyProperties(user, toUpdate, "id", "authority", "password","createdAchievements", "managedAchievements", "managedGames", "users");
    String newPassword = user.getPassword();

	// Solo actualiza si el campo de la contraseña NO es nulo y NO está vacío
	// Si está vacío se queda con el copyProperties del backend para password
	if (newPassword != null && !newPassword.trim().isEmpty()){
		//Hashear y establecer nueva contraseña
		toUpdate.setPassword(passwordEncoder.encode(newPassword));
	}
	// Si el newPassword está vacío este if se ignora, y se mantiene la contraseña que había en la base de datos
	userRepository.save(toUpdate);
    return toUpdate;
}
	@Transactional
	public void deleteUser(Integer id) {
		User toDelete = findUser(id);
		this.userRepository.delete(toDelete);
	}
}
