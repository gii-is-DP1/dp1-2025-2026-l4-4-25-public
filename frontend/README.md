# Saboteur Game - Frontend

This is the React frontend for the Saboteur card game application, developed as part of the DP1 (Design and Software Testing I) course at the University of Seville.

## About the Game

Saboteur is a strategic card game where players take on roles as either gold-diggers or saboteurs. Gold-diggers work together to build tunnels to reach gold, while saboteurs secretly try to prevent them from succeeding. This digital implementation includes multiplayer lobbies, real-time gameplay, user profiles, achievements, and statistics tracking.

## Technologies Used

- **React 18**: Modern UI library with hooks
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **JWT Authentication**: Secure user authentication
- **CSS3**: Custom styling with responsive design
- **Jest & React Testing Library**: Component testing

## Project Structure

```
frontend/
├── public/           # Static assets
├── src/
│   ├── admin/       # Admin panel components
│   ├── auth/        # Authentication components
│   ├── components/  # Reusable UI components
│   ├── game/        # Game board and gameplay logic
│   ├── home/        # Landing page
│   ├── lobbies/     # Lobby system and profiles
│   ├── services/    # API service layer
│   ├── static/      # CSS and images
│   ├── util/        # Utility functions
│   └── App.js       # Main application component
└── package.json
```

## Prerequisites

- Node.js 18 or newer
- npm or yarn package manager
- Backend server running on `http://localhost:8080`

## Installation

1. Clone the repository and navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

## Initial Users

For testing purposes, the application comes with pre-configured users:

### Administrator Account:
- **Username**: `admin1`
- **Password**: `4dm1n`
- **Permissions**: Full system access, user management, achievement editing

### Player Accounts:
- **Username**: `player1` | **Password**: `saboteur123`
- **Username**: `player2` | **Password**: `saboteur123`
- **Username**: `player3` | **Password**: `saboteur123`

- **Username**: `player4` | **Password**: `saboteur123`
- **Username**: `player5` | **Password**: `saboteur123`

These five accounts (`player1`–`player5`) are the preferred test accounts and include preconfigured Achievements and Statistics for convenience during testing.

Additional preferred test accounts (no preconfigured Achievements or Statistics):
 
- **Username**: `RHQ7780` | **Password**: `saboteur123`
- **Username**: `GBK4935` | **Password**: `saboteur123`
- **Username**: `HKP3295` | **Password**: `saboteur123`
- **Username**: `JGR9196` | **Password**: `saboteur123`
- **Username**: `WRG8176` | **Password**: `saboteur123`
- **Username**: `FQY7185` | **Password**: `saboteur123`

These additional accounts are available for playing and testing, but unlike the main `player1`–`player5` accounts they do not include pre-filled Achievements or Statistics.

## Running the Application

**Important**: Make sure the backend server is running on `http://localhost:8080` before starting the frontend.

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
For coverage report, run: `npm test -- --coverage`

See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Key Features

### 🎮 Game Features
- **Real-time Multiplayer**: Create and join game lobbies with 3-10 players
- **Turn-based Gameplay**: Strategic card placement and tunnel building
- **Role Assignment**: Random assignment of gold-digger and saboteur roles
- **Card System**: Path cards, action cards, and gold cards with unique abilities

### 👤 User Management
- **JWT Authentication**: Secure login and registration system
- **User Profiles**: Customizable avatars and personal information
- **Statistics Tracking**: Win/loss records, games played, and performance metrics

### 🏆 Achievement System
- **Progressive Achievements**: Unlock badges by completing challenges
- **Multiple Categories**: Beginner, Intermediate, and Advanced achievements
- **Admin Management**: Create and edit custom achievements

### 📊 Admin Dashboard
- **User Administration**: View, edit, and manage user accounts
- **Game Monitoring**: Track active games and player statistics
- **Achievement Control**: Create and modify achievement definitions

---

> ### 🔐 SECRET TIP
>
> **There is a branch named `dev/skip-round-button` that implements a special testing feature:** a button available only to the game creator that reveals the gold and forces the round to end (i.e., it skips the round). This was added as a convenience to speed up testing and has proven very useful for quicker manual testing of round flows.
>
> This branch exists purely for testing purposes and is not merged into `main`. **This feature is intended for quick testing and has not been perfected; we are not responsible for any random errors you may encounter when using it, as forcing rounds quickly can trigger timing/load related issues in certain environments.**
>
> If you want to try the faster flow for debugging or QA, you may check out `dev/skip-round-button`. Otherwise, stick to the `main` branch for the stable experience.
>
> ---

## API Integration

The frontend communicates with the backend through RESTful APIs:

- **Authentication**: `/api/v1/auth/*`
- **Users**: `/api/v1/users/*`
- **Games**: `/api/v1/games/*`
- **Achievements**: `/api/v1/achievements/*`
- **Statistics**: `/api/v1/stats/*`

All authenticated requests include JWT tokens in the Authorization header.

## Troubleshooting

### Backend Connection Issues
- Verify the backend is running on `http://localhost:8080`
- Check CORS configuration in the backend
- Ensure JWT tokens are valid and not expired

### Port Already in Use
If port 3000 is busy, you can specify a different port:
```bash
PORT=3001 npm start
```

### Build Failures
Clear the cache and reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## ⚠️ Potential Issues & Fixes

This project includes a list of known or possible runtime issues and recommended workarounds. These are generally minor but can affect the user experience when testing multiplayer scenarios or using multiple browsers. For a Spanish version, see the repository file: [docs/POTENTIAL_ISSUES_ES.md](../docs/POTENTIAL_ISSUES_ES.md).
### **Top Issues & Fixes — Quick Summary**

These are the most important issues you may encounter during multiplayer testing. They can occur under load but should not normally appear.

- **Recommendation — Use Firefox:** Prefer Firefox or Firefox Developer Edition for best rendering and performance; other browsers (Edge, Chrome, Opera) work but may be slower.
- **Timer freeze after refresh (Problem):** If a player's in-game timers freeze after a browser reload, **Solution:** refresh the browser of the player who started the match — their timer re-activates. If you don't know who that is, refresh all players' browsers.
- **Loading screens are slow (Recommendation):** Be patient during loading screens when entering matches or advancing rounds — some browsers (Edge/Chrome) can be slower loading game data, and all players must reach the ready state before the match continues.
- **Player joins too early in a second match (Problem):** If a player joins the second game before the rest and the match is out-of-sync, **Solution:** refresh all players' browsers to re-synchronize and start correctly.

These items are highlighted because they are the most common/resurfacing issues during multiplayer testing. They "may" happen under stress or heavy load but are not expected in normal usage.

 - **Performance** may decrease with many simultaneous browser instances and players — expect higher CPU/memory usage.
 - If the UI shows missing cards or inconsistent state, try **refreshing** the browser; many display/sync problems recover after **reload**.
 - Prefer **Firefox/Firefox Developer Edition** for best rendering and performance; Edge/Chrome/Opera also work but may be slightly slower.
 - If layout elements are clipped, reduce browser **zoom** or test on a single display before multi-window testing.
 - **Background music** can play in several browser windows at once; mute other windows or use the in-app audio controls to avoid overlapping audio.
 - Loading screens may take longer while waiting for all players to join; **be patient** and watch each player's loading bar reach 100%.
 - If the in-game **timer freezes** after a reload, refresh the browser of the **player who started the match** (their timer is the one that activates). If unsure who that was, refresh all browsers.

## Development Guidelines

### Code Style
- Use functional components with hooks
- Follow ESLint rules configured in the project
- Use meaningful component and variable names
- Keep components small and focused

### Testing
- Write unit tests for utility functions
- Create integration tests for critical user flows
- Maintain minimum 80% code coverage

## Deployment

### Option 1: Static Hosting (Netlify, Vercel)
1. Build the production version: `npm run build`
2. Deploy the `build/` folder to your hosting provider

### Option 2: Docker
A Dockerfile is provided in the root directory for containerized deployment.

### Option 3: Traditional Server
Configure your web server (nginx, Apache) to serve the `build/` folder and redirect all routes to `index.html`.

## Learn More

- [Create React App Documentation](https://facebook.github.io/create-react-app/docs/getting-started)
- [React Documentation](https://reactjs.org/)
- [React Router Documentation](https://reactrouter.com/)
- [JWT Authentication Guide](https://jwt.io/introduction)

### Additional Resources

- **Code Splitting**: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)
- **Bundle Analysis**: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)
- **Progressive Web App**: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)
- **Advanced Configuration**: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)
- **Troubleshooting Build Issues**: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Contributing

This project is part of an academic course. For contributions:
1. Fork the repository
2. Create a feature branch
3. Commit your changes with clear messages
4. Push to your fork
5. Submit a pull request

## License

This project is developed for educational purposes as part of the DP1 course at the University of Seville.

## Support

For questions or issues:
- Check the documentation in the `docs/` folder
- Review existing GitHub issues
- Contact the development team

---

**Course**: Design and Testing I (DP1)  
**Institution**: University of Seville  
**Academic Year**: 2025-2026
