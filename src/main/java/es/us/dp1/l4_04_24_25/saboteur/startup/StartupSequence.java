package es.us.dp1.l4_04_24_25.saboteur.startup;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@Order(1)
public class StartupSequence implements CommandLineRunner {

    @Autowired
    private Environment env;

    private static final String RESET = "\u001B[0m";
    private static final String RED = "\u001B[31m";
    private static final String GREEN = "\u001B[32m";
    private static final String YELLOW = "\u001B[33m";
    private static final String BLUE = "\u001B[34m";
    private static final String MAGENTA = "\u001B[35m";
    private static final String CYAN = "\u001B[36m";
    private static final String BRIGHT_RED = "\u001B[91m";
    private static final String BRIGHT_GREEN = "\u001B[92m";
    private static final String BRIGHT_YELLOW = "\u001B[93m";
    private static final String BRIGHT_MAGENTA = "\u001B[95m";
    private static final String BRIGHT_BLUE_STRING = "\u001B[94m";
    private static final String BRIGHT = "\u001B[1m";   

    @Override
    public void run(String... args) {
        String profile = env.getProperty("spring.profiles.active", "dev");
        boolean isProd = "prod".equals(profile);

        System.out.println();
        printSaboteurBanner();
        System.out.println();

        if (isProd) {
            System.out.println(YELLOW + "[ SABOTEUR ] >> Production Mode - Silent Boot" + RESET);
            System.out.println();
            return;
        }

        try {
            System.out.println(BRIGHT_YELLOW + "╔══════════════════════════════════════════════════════════╗" + RESET);
            System.out.println(BRIGHT_YELLOW + "║          - SABOTEUR CORE INITIALIZATION -                ║" + RESET);
            System.out.println(BRIGHT_YELLOW + "╚══════════════════════════════════════════════════════════╝" + RESET);
            System.out.println();
            System.out.println(BRIGHT_BLUE_STRING + "╔══════════════════════════════════════════════════════════╗" + RESET);
            System.out.println(BRIGHT_BLUE_STRING + "║          - A PROYECT OF L4-4 GROUP OF US -               ║" + RESET);
            System.out.println(BRIGHT_BLUE_STRING + "╚══════════════════════════════════════════════════════════╝" + RESET);
            System.out.println();

            step("[*] Dug the caves", BLUE);
            loadingBar("ENGINE", BRIGHT_BLUE_STRING);
            
            step("[+] Loading the dinamited", CYAN);
            loadingBar("DATABASE", BRIGHT_GREEN);
            
            step("[#] Initializing the mine", GREEN);
            Thread.sleep(400);
            
            step("[@] Security Layers", YELLOW);
            Thread.sleep(400);
            
            step("[~] WebSocket Engine", CYAN);
            Thread.sleep(400);
            
            step("[!] Enabling Collapse Mode", BRIGHT_RED);
            loadingBar("BOOM!", RED);

            System.out.println();
            System.out.println(BRIGHT_GREEN + "[ ✓ ] SYSTEM READY" + RESET);
            System.out.println();

            // Mensaje final épico
            System.out.println(BRIGHT_YELLOW + "══════════════════════════════════════════════════════════" + RESET);
            System.out.println(BRIGHT_GREEN + "         >> SABOTEUR GAME READY - PRESS START <<" + RESET);
            System.out.println(BRIGHT_YELLOW + "══════════════════════════════════════════════════════════" + RESET);
            System.out.println();
            System.out.println(CYAN + "   [>] Players: Ready to join" + RESET);
            System.out.println(CYAN + "   [>] Game Mode: Sabotage & Survive" + RESET);
            System.out.println(CYAN + "   [>] Gold Target: 3 nuggets to win" + RESET);
            System.out.println(RED + "   [>] NEED TO START FRONTEND" + RESET);
            System.out.println();
            System.out.println(MAGENTA + "   [i] Tip: Check http://localhost:8080 to start playing!" + RESET);
            System.out.println();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void step(String message, String color) throws InterruptedException {
        System.out.print(color + "[ SABOTEUR ] " + message + "..." + RESET);
        Thread.sleep(500);
        System.out.println(GREEN + " ✓" + RESET);
    }

    private void loadingBar(String label, String color) throws InterruptedException {
        System.out.print(color + "   [ " + label + " ] " + RESET);
        for (int i = 0; i <= 20; i++) {
            System.out.print(color + "▓" + RESET);
            Thread.sleep(60);
        }
        System.out.println(BRIGHT_GREEN + " ✓ 100%" + RESET);
    }

    private void printSaboteurBanner() {
        System.out.println(BRIGHT_BLUE_STRING + "  ███████╗ █████╗ ██████╗  ██████╗ ████████╗███████╗██╗   ██╗██████╗ " + RESET);
        System.out.println(BRIGHT_BLUE_STRING + "  ██╔════╝██╔══██╗██╔══██╗██╔═══██╗╚══██╔══╝██╔════╝██║   ██║██╔══██╗" + RESET);
        System.out.println(BRIGHT_BLUE_STRING + "  ███████╗███████║██████╔╝██║   ██║   ██║   █████╗  ██║   ██║██████╔╝" + RESET);
        System.out.println(BRIGHT_BLUE_STRING + "  ╚════██║██╔══██║██╔══██╗██║   ██║   ██║   ██╔══╝  ██║   ██║██╔══██╗" + RESET);
        System.out.println(BRIGHT_BLUE_STRING + "  ███████║██║  ██║██████╔╝╚██████╔╝   ██║   ███████╗╚██████╔╝██║  ██║" + RESET);
        System.out.println(BRIGHT_BLUE_STRING + "  ╚══════╝╚═╝  ╚═╝╚═════╝  ╚═════╝    ╚═╝   ╚══════╝ ╚═════╝ ╚═╝  ╚═╝" + RESET);
        System.out.println();
        System.out.println(YELLOW + "            > Dig for Gold or Sabotage the Miners <" + RESET);
    }
}
