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
