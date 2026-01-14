# ⛏️🎮 Saboteur - The Game 🎮⛏️

A full-stack web application implementation of the popular strategy card game **Saboteur**, developed as part of the Design and Testing I (DP1) Group L4-4 at the University of Seville.

## 📖 About the Game

Saboteur is a strategic multiplayer card game where players are secretly assigned roles as either **Miners** or **Saboteurs**. Miners works together to build tunnels through a mine to reach the gold, while saboteurs secretly try to prevent them from succeeding. This digital implementation provides a complete online multiplayer experience with user management, statistics tracking, and an achievement system.

### Game Features
- 🎯 **3-12 Players**: Support for multiplayer lobbies
- 🎭 **Secret Roles**: Random role assignment creates mystery and deduction gameplay
- 🃏 **Card System**: Path cards, action cards, and special gold cards
- 🏆 **Achievement System**: Unlock badges and track progress
- 📊 **Statistics Tracking**: Win/loss records, games played, and performance metrics
- 👤 **User Profiles**: Customizable avatars and personal information
- 🔐 **JWT Authentication**: Secure user authentication and authorization

## 🛠️ Technology Stack

### Backend
- **Java 21**: Modern Java development
- **Spring Boot 3.5.5**: Application framework
- **Spring Security**: JWT-based authentication
- **Spring Data JPA**: Database access layer
- **H2 Database**: In-memory database for development
- **Maven**: Build and dependency management
- **Lombok**: Reduce boilerplate code
- **MapStruct**: Object mapping

### Frontend
- **React 18**: Modern UI library with hooks
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS3**: Custom responsive styling
- **Jest & React Testing Library**: Testing framework

### Testing & Quality
- **JUnit 5**: Unit testing
- **JaCoCo**: Code coverage reporting
- **Allure**: Test reporting
- **Spring Boot Test**: Integration testing

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/gii-is-DP1/dp1-2025-2026-l4-4-25.git
cd dp1-2025-2026-l4-4-25
```

### 2. Running the Backend

The backend is a Spring Boot application built with Maven.

#### Option A: Using Maven Wrapper (Recommended)

```bash
./mvnw spring-boot:run
```

On Windows:
```bash
mvnw.cmd spring-boot:run
```

#### Option B: Build and Run JAR

```bash
./mvnw clean package
java -jar target/*.jar
```

The backend will start on [http://localhost:8080](http://localhost:8080)

**API Documentation**: Access Swagger UI at [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

### 3. Running the Frontend

Navigate to the frontend directory and start the development server:

```bash
cd frontend
npm install
npm start
```

The frontend will open automatically at [http://localhost:3000](http://localhost:3000)


## 🗃️ Database Configuration

The application uses an **H2 in-memory database** by default, which is automatically populated with initial data at startup.

- **Console Access**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
- **JDBC URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`
- **Password**: _(empty)_

Initial data is loaded from `src/main/resources/data.sql`

## 👥 Initial Users

For testing and development, the following users are pre-configured:

### Administrator
- **Username**: `admin1`
- **Password**: `4dm1n`
- **Permissions**: Full system access, user management, achievement editing

### Players
- 1️⃣**Username**: `player1` | **Password**: `saboteur123`
- 2️⃣**Username**: `player2` | **Password**: `saboteur123`
- 3️⃣**Username**: `player3` | **Password**: `saboteur123`

## 🏗️ Project Structure

```
dp1-2025-2026-l4-4-25/
├── frontend/                # React frontend application
│   ├── public/             # Static assets
│   └── src/
│       ├── admin/          # Admin panel components
│       ├── auth/           # Authentication
│       ├── game/           # Game logic and board
│       ├── lobbies/        # Lobby system
│       ├── services/       # API services
│       └── static/         # CSS and images
├── src/
│   ├── main/
│   │   ├── java/           # Java source code
│   │   │   └── es/us/dp1/l4_04_24_25/
│   │   │       ├── achievement/    # Achievement system
│   │   │       ├── auth/           # Authentication & JWT
│   │   │       ├── card/           # Card entities and logic
│   │   │       ├── game/           # Game management
│   │   │       ├── lobby/          # Lobby system
│   │   │       ├── player/         # Player management
│   │   │       ├── statistics/     # Stats tracking
│   │   │       └── user/           # User management
│   │   └── resources/
│   │       ├── application.properties  # Configuration
│   │       └── data.sql                # Initial data
│   └── test/               # Test files
├── docs/                   # Documentation
├── pom.xml                 # Maven configuration
├── docker-compose.yml      # Docker setup
└── README.md              # This file
```

## 🧪 Running Tests

### Backend Tests

Run all tests:
```bash
./mvnw test
```

Generate coverage report with JaCoCo:
```bash
./mvnw clean test jacoco:report
```

Coverage report will be available at: `target/site/jacoco/index.html`

Generate Allure report:
```bash
./mvnw clean test allure:report
```

### Frontend Tests

```bash
cd frontend
npm test -a
```

## 🎮 How to Play

1. **Create an Account**: Register a new user or use one of the pre-configured accounts
2. **Join or Create a Lobby**: Navigate to the lobby system
3. **Wait for Players**: The game requires 3-12 players to start
4. **Receive Your Role**: Roles are assigned secretly at the start of each round
5. **Play Your Cards**: Build paths to the gold (miners) or sabotage the efforts (saboteurs)
6. **Win Gold**: Complete your objective to earn gold nuggets
7. **Play 3 Rounds**: The player with the most gold after 3 rounds wins!

---

> ### 🔐 SECRET TIP
>
> **There is a branch named `dev/skip-round-button` that implements a special testing feature:** a button available only to the game creator that reveals the gold and forces the round to end (i.e., it skips the round). This was added as a convenience to speed up testing and has proven very useful for quicker manual testing of round flows.
>
> This branch exists purely for testing purposes and is not merged into `main`. **This feature is intended for quick testing and has not been perfected; we are not responsible for any random errors you may encounter when using it, as forcing rounds quickly can trigger timing/load related issues in certain environments.**
>
> If you want to try the faster flow for debugging or QA, you may check out `dev/skip-round-button`. Otherwise, stick to the `main` branch for the stable experience.
>
---

## ⚠️ Potential Issues & Fixes

Below are known or potential issues that may affect gameplay, with suggested workarounds. Most are uncommon but important to be aware of for a smooth experience. A Spanish version of this guidance is available at [docs/POTENTIAL_ISSUES_ES.md](docs/POTENTIAL_ISSUES_ES.md).

 - **Performance** and resource usage increase as more browsers and players are connected simultaneously.
 - If an error occurs during a match (rare), **refresh** the page — most issues resolve after a **reload**.
 - When using multiple browsers or screens at once, some **CSS** layouts may not adapt perfectly. For testing, prefer using a single display and, if needed, reduce browser **zoom** (Ctrl + '-') to ensure the board fits correctly.
 - Recommended browsers: **Firefox** and **Firefox Developer Edition** (best). Edge, Chrome and Opera also work but may render slightly slower.
 - If visual elements appear 'cut off', try reducing browser **zoom** — this is usually a compatibility/layout issue, not a game bug.
 - The **draw pile** size is calculated based on the number of players by game rules — this is expected behavior, not a bug.
 - On **Firefox**, disabling sidebars or toolbars can give a fuller view, but reducing **zoom** also works; the game functions correctly without disabling UI elements.
 - If a card placed in another browser does not appear after **refreshing**, try refreshing again — the client is designed to recover on **reload**.
- Loading screens may take longer while waiting for all players to join; **be patient** and watch each player's loading bar reach 100% (this ensures rounds render correctly for everyone).
- If a player advances to the next screen before others, refresh all browsers to re-synchronize.
- If the in-game **timer freezes** after a reload, refresh the browser of the **player who started the match** (their timer is the one that activates). If unsure who that was, refresh all browsers.
 - If you change a player's **username**, log in again to avoid inconsistencies during a live match.
 - On the **CreateGame** screen, if you see a "Connect with The server" error, refresh the page (very rare but harmless to retry).
 - **Background music** may play simultaneously in multiple browsers — this is expected when testing with several clients; mute individual browsers or use the music controls to disable audio if needed. If **autoplay** issues occur, the music can always be toggled manually.

## 🔧 Configuration

Key configuration files:

- **Backend**: `src/main/resources/application.properties`
- **Frontend**: `frontend/src/services/` (API endpoints)

### Environment Variables

You can configure the following environment variables:

```properties
# Database
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=

# JWT
jwt.secret=your-secret-key
jwt.expiration=86400000

# Server
server.port=8080
```


This will start both the backend and frontend in containers.

## 📚 API Documentation

Once the backend is running, access the complete API documentation:

- **Swagger UI**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

### Main API Endpoints

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/games` - List all games
- `POST /api/v1/games` - Create a new game
- `GET /api/v1/users/{id}` - Get user profile
- `GET /api/v1/achievements` - List achievements
- `GET /api/v1/stats/{userId}` - Get user statistics

## 📄 License

This project is developed for educational purposes as part of the DP1 course at the University of Seville.

## 👨‍💻 Development Team

**Course**: Design and Testing I (DP1)  
**Institution**: University of Seville - Software Engineering Degree  
**Academic Year**: 2025-2026  
**Group**: L4-04

## 📞 Support

For questions or issues:
- Check the documentation in the `docs/` folder
- Review the [frontend README](frontend/README.md) for frontend-specific info
- Open an issue on GitHub
- Contact the development team

## 🔗 Additional Resources

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [React Documentation](https://reactjs.org/)
- [Spring Security & JWT Guide](https://spring.io/guides/tutorials/spring-boot-oauth2/)
- [Maven Documentation](https://maven.apache.org/guides/)
- [H2 Database Documentation](https://www.h2database.com/)

---

DP1 | L4 Group 04 - University of Seville
