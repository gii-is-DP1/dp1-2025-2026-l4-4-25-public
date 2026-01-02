package es.us.dp1.l4_04_24_25.saboteur.admin;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AdminActionMessage {
    private String action;
    private String reason;
    private String affectedPlayer;

    public AdminActionMessage(String action, String reason) {
        this.action = action;
        this.reason = reason;
        this.affectedPlayer = null;
    }
}
