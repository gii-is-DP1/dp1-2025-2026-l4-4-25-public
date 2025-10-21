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

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder; 
import es.us.dp1.l4_04_24_25.saboteur.exceptions.ResourceNotFoundException;
import jakarta.validation.Valid;
import es.us.dp1.l4_04_24_25.saboteur.player.Player;
import es.us.dp1.l4_04_24_25.saboteur.player.PlayerRepository;



@Service
public class UserService {

	private UserRepository userRepository;
	private final PasswordEncoder passwordEncoder; 
	private final PlayerRepository playerRepository;

	@Autowired
	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, PlayerRepository playerRepository) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder; 
		this.playerRepository = playerRepository;

	}

	@Transactional
	public User saveUser(User user) throws DataAccessException {
		// Rellenar tabla Player
		Player newPlayer = new Player();
		BeanUtils.copyProperties(user, newPlayer);

		newPlayer.setPlayedGames(5);
        newPlayer.setWonGames(0);
        newPlayer.setDestroyedPaths(0);
        newPlayer.setBuiltPaths(0);
        newPlayer.setAcquiredGoldNuggets(0);
		newPlayer.setPeopleDamaged(0);
		newPlayer.setPeopleRepaired(0);
		newPlayer.setFriends(new ArrayList<>());
		newPlayer.setAccquiredAchievements(new ArrayList<>());
		newPlayer.setWatcher(false);

		return playerRepository.save(newPlayer); // Se guarda el player (extiende de User por lo que estamos devolviendo un objeto User)

	}

	@Transactional(readOnly = true)
	public User findUser(String username) {
		return userRepository.findByUsername(username)
				.orElseThrow(() -> new ResourceNotFoundException("User", "Username", username));
	}

	@Transactional(readOnly = true)
	public User findUser(Integer id) {
		return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
	}

	@Transactional(readOnly = true)
	public User findCurrentUser() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth == null)
			throw new ResourceNotFoundException("Nobody authenticated!");
		else
			return userRepository.findByUsername(auth.getName())
					.orElseThrow(() -> new ResourceNotFoundException("User", "Username", auth.getName()));
	}

	public Boolean existsUser(String username) {
		return userRepository.existsByUsername(username);
	}

	@Transactional(readOnly = true)
	public Iterable<User> findAll() {
		return userRepository.findAll();
	}

	public Iterable<User> findAllByAuthority(String auth) {
		return userRepository.findAllByAuthority(auth);
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
