package es.us.dp1.l4_04_24_25.saboteur.user;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserDTO{

    private Integer id;
    private String username;
    private String name;
    private String birthDate;
    private LocalDateTime joined;
    private String image;
    private String email;
    private String authority;

    public UserDTO() {
    }

    public UserDTO(Integer id, String username, String name, String birthDate, LocalDateTime joined, String image, String email, String authority) {
        this.id = id;
        this.username = username;
        this.name = name;
        this.birthDate = birthDate;
        this.joined = joined;
        this.image = image;
        this.email = email;
        this.authority = authority;
    }
}