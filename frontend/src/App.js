import React from "react";
import { Navigate, Route, Routes, matchPath, useLocation } from "react-router-dom";
import jwt_decode from "jwt-decode";
import { ErrorBoundary } from "react-error-boundary";
import AppNavbar from "./AppNavbar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from "./home";
import PrivateRoute from "./privateRoute";
import Register from "./auth/register";
import Profile from "./lobbies/profiles/Profile";
import EditProfile from "./lobbies/profiles/EditProfile"; 
import Login from "./auth/login";
import Logout from "./auth/logout";
import tokenService from "./services/token.service";
import UserListAdmin from "./admin/users/UserListAdmin";
import UserEditAdmin from "./admin/users/UserEditAdmin";
import AdminGames from "./admin/games/AdminGames";
import Lobby from "./lobbies/lobby"; 
import CreateGame from "./lobbies/games/CreateGame";
import ListGames from "./lobbies/games/ListGames";
import Board from "./game/board";
import Info from "./lobbies/info";
import GamesPlayed from "./lobbies/profiles/GamesPlayed";
import Achievements from "./lobbies/profiles/Achievements";
import EditAchievements from "./admin/achievements/EditAchievements";
import Stats from "./lobbies/profiles/Stats";
import GameInvitationListener from "./components/GameInvitationListener";
import Ranking from "./lobbies/ranking/Ranking";
import ReadMe from "./lobbies/ReadMe";
import BackgroundMusic from "./components/BackgroundMusic";
import SaboteurCursor from "./components/SaboteurCursor";

function StrictInGameRedirect({ jwt, children }) {
  const location = useLocation();

  if (!jwt) {
    return children;
  }

  let savedGameData = null;
  try {
    const raw = sessionStorage.getItem('savedGameData');
    savedGameData = raw ? JSON.parse(raw) : null;
  } catch (e) {
    savedGameData = null;
  }

  const activeBoardId = savedGameData?.round?.board?.id ?? savedGameData?.round?.board;

  if (!activeBoardId) {
    return children;
  }

  const boardMatch = matchPath('/board/:boardId', location.pathname);
  if (boardMatch) {
    const currentBoardId = boardMatch.params?.boardId;
    if (currentBoardId && String(currentBoardId) !== String(activeBoardId)) {
      return <Navigate to={`/board/${activeBoardId}`} replace />;
    }
    return children;
  }

  return <Navigate to={`/board/${activeBoardId}`} replace />;
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try Again</button>
    </div>
  );
}

function App() {
  const location = useLocation();
  const jwt = tokenService.getLocalAccessToken();
  let roles = []
  if (jwt) {
    roles = getRolesFromJWT(jwt);
  }

  function getRolesFromJWT(jwt) {
    return jwt_decode(jwt).authorities;
  }


  let adminRoutes = <></>;
  let ownerRoutes = <></>;
  let userRoutes = <></>;
  let vetRoutes = <></>;

  roles.forEach((role) => {
    if (role === "ADMIN") {
      adminRoutes = (
        <>
          <Route path="/users" exact={true} element={<PrivateRoute><UserListAdmin /></PrivateRoute>} />
          <Route path="/users/:id" exact={true} element={<PrivateRoute><UserEditAdmin /></PrivateRoute>} />    
          <Route path="/admin/games" element={<PrivateRoute><AdminGames /></PrivateRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/info" element={<Info />} />
          <Route path="/profile/editProfile" element={<EditProfile />} />  
          <Route path="/EditAchievement" element={<EditAchievements />} />
          <Route path="/achievements/admin" element={<PrivateRoute><EditAchievements /></PrivateRoute>} />
        </>)
    }
    if (role === "PLAYER") {
      ownerRoutes = (
        <>
          <Route path="/info" element={<Info />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/editProfile" element={<EditProfile />} />
          <Route path="/GamesPlayed" element={<GamesPlayed />} />
          <Route path="/Achievement" element={<Achievements />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/ReadMe" element={<ReadMe />} />

        </>)
    }    
  })
  if (jwt) {
    userRoutes = (
      <>
        <Route path="/lobby" element={<PrivateRoute><Lobby /></PrivateRoute>} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/CreateGame/:id" element={<PrivateRoute><CreateGame /></PrivateRoute>} />
        <Route path="/CreateGame" element={<PrivateRoute><CreateGame /></PrivateRoute>} />
        <Route path="/board/:boardId" element={<PrivateRoute><Board/></PrivateRoute>} />
        <Route path="/ListGames" element={<PrivateRoute><ListGames /></PrivateRoute>} />
        <Route path="/ranking" element={<PrivateRoute><Ranking /></PrivateRoute>} />
      </>
    )
  }

  return (
    <div>
      <ErrorBoundary FallbackComponent={ErrorFallback} >
        <SaboteurCursor />
        
        <AppNavbar />
        {jwt && <GameInvitationListener />}
        <BackgroundMusic />
        <ToastContainer 
          position="top-right" 
          autoClose={2500} 
          hideProgressBar={false} 
          newestOnTop={true} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss={false} 
          draggable 
          pauseOnHover={false}
          limit={3}
        />
        <StrictInGameRedirect jwt={jwt}>
          <Routes>
            <Route path="/" exact={true} element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            {userRoutes}
            {adminRoutes}
            {ownerRoutes}
            {vetRoutes}
          </Routes>
        </StrictInGameRedirect>
      </ErrorBoundary>
    </div>
  );
}

export default App;