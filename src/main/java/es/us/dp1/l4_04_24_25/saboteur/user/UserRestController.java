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
import java.util.Map;
import java.util.Objects;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import es.us.dp1.l4_04_24_25.saboteur.achievements.Achievement;
import es.us.dp1.l4_04_24_25.saboteur.achievements.AchievementService;
import es.us.dp1.l4_04_24_25.saboteur.auth.payload.response.MessageResponse;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.AccessDeniedException;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DeniedPasswordChangeException;
import es.us.dp1.l4_04_24_25.saboteur.exceptions.DuplicatedUserException;
import es.us.dp1.l4_04_24_25.saboteur.util.RestPreconditions;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/users")
@SecurityRequirement(name = "bearerAuth")
class UserRestController {

	private final UserService userService;
	private final AuthoritiesService authService;
	private final PasswordEncoder encoder;
	private final AchievementService achievementService;
	private final ObjectMapper objectMapper;

	@Autowired
	public UserRestController(UserService userService, AuthoritiesService authService, PasswordEncoder encoder, AchievementService achievementService, ObjectMapper objectMapper) {
		this.userService = userService;
		this.authService = authService;
		this.encoder = encoder;
		this.achievementService = achievementService;
		this.objectMapper = objectMapper;
	}

	@GetMapping
	public ResponseEntity<List<UserDTO>> findAll(@RequestParam(required = false) String auth) {
		List<UserDTO> res;
		if (auth != null) {
			res = (List<UserDTO>) userService.findAllByAuthority(auth);
		} else
			res = (List<UserDTO>) userService.findAll();
		return new ResponseEntity<>(res, HttpStatus.OK);
	}

	@GetMapping("authorities")
	public ResponseEntity<List<Authorities>> findAllAuths() {
		List<Authorities> res = (List<Authorities>) authService.findAll();
		return new ResponseEntity<>(res, HttpStatus.OK);
	}

	@GetMapping(value = "{id}")
	public ResponseEntity<UserDTO> findById(@PathVariable("id") Integer id) {
		return new ResponseEntity<>(userService.findUserDTO(id), HttpStatus.OK);
	}

	@GetMapping("byUsername")
	public ResponseEntity<UserDTO> findByUsername(@RequestParam String username) {
		return new ResponseEntity<>(userService.findByUsernameDTO(username), HttpStatus.OK);
	}

@PostMapping
@ResponseStatus(HttpStatus.CREATED)
public ResponseEntity<User> create(@RequestBody @Valid User user)
        throws DataAccessException, DuplicatedUserException {

    if (userService.existsUser(user.getUsername())) {
        throw new DuplicatedUserException("A user with username '" + user.getUsername() + "' already exists");
    }

    List<UserDTO> existingUsers = userService.findAll();
    boolean emailExists = existingUsers.stream()
            .anyMatch(u -> u.getEmail().equalsIgnoreCase(user.getEmail()));

    if (emailExists) {
        throw new DuplicatedUserException("A user with email '" + user.getEmail() + "' already exists");
    }

    User newUser = new User();
    BeanUtils.copyProperties(user, newUser, "id");
   	newUser.setPassword(encoder.encode(user.getPassword()));
    User savedUser = this.userService.saveUser(newUser);
    return new ResponseEntity<>(savedUser, HttpStatus.CREATED);
}

	@PutMapping(value = "{userId}")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<User> update(@PathVariable("userId") Integer id, @RequestBody @Valid User user) {
		RestPreconditions.checkNotNull(userService.findUser(id), "User", "ID", id);
		return new ResponseEntity<>(this.userService.updateUser(user, id), HttpStatus.OK);
	}

	@PatchMapping(value = "{userId}")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<User> patch(@PathVariable("userId") Integer id, @RequestBody Map<String,Object> updates) throws JsonMappingException, DeniedPasswordChangeException{
		RestPreconditions.checkNotNull(userService.findUser(id), "User", "ID", id);
		User user = userService.findUser(id);
		User newUser = new User();
		BeanUtils.copyProperties(user, newUser, "id", "joined");
		List<Achievement> newAchievements = new ArrayList<>();
		if (updates.containsKey("createdAchievements")){

			if (updates.get("createdAchievements")!=null) {
				List<Integer> achievementsIds = (List<Integer>) updates.get("createdAchievements");
				List<Achievement> oldAchievements = user.getCreatedAchievements();

				if (!achievementsIds.isEmpty()){
					for(Achievement oldAchievement:oldAchievements){
						if(!achievementsIds.contains(oldAchievement.getId())) {
							oldAchievement.setCreator(null);
							achievementService.saveAchievement(oldAchievement);
							user.getCreatedAchievements().remove(oldAchievement);
						}
					}

					for (Integer achievementId:achievementsIds){
						RestPreconditions.checkNotNull(achievementService.findAchievement(achievementId), "Achievement", "ID", achievementId);
						Achievement patchedAchievement = achievementService.patch(achievementId, Map.of("creator",user.getId()));
						newAchievements.add(patchedAchievement);
					}
				}
			}
			if(updates.containsKey("password")){
				User currentUser = userService.findCurrentUser();
				if (!Objects.equals(currentUser.getId(), user.getId())){
					throw new DeniedPasswordChangeException();
				}
			}
			newUser.setCreatedAchievements(newAchievements);
		}
		User userPatched = objectMapper.updateValue(newUser, updates);
		User userSaved = userService.updateUser(userPatched, id);
		return new ResponseEntity<>(userSaved, HttpStatus.OK);
	}


	@DeleteMapping(value = "{userId}")
	@ResponseStatus(HttpStatus.OK)
	public ResponseEntity<MessageResponse> delete(@PathVariable("userId") int id) {
		RestPreconditions.checkNotNull(userService.findUser(id), "User", "ID", id);
		if (userService.findCurrentUser().getId() != id) {
			userService.deleteUser(id);
			return new ResponseEntity<>(new MessageResponse("User deleted!"), HttpStatus.OK);
		} else
			throw new AccessDeniedException("You can't delete yourself!");
	}

}
