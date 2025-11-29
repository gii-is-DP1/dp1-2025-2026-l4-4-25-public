import React from "react";
import { Route, Routes } from "react-router-dom";
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
import Lobby from "./lobbies/lobby"; 
import CreateGame from "./lobbies/games/CreateGame";
import ListGames from "./lobbies/games/ListGames";
import Board from "./game/board";
import Info from "./lobbies/info";
import GamesPlayed from "./lobbies/profiles/GamesPlayed";
import Achievements from "./lobbies/profiles/Achievements";
import EditAchievements from "./admin/achievements/EditAchievements";
import Ranking from "./lobbies/ranking/Ranking";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Algo fue mal:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Intentar de nuevo</button>
    </div>
  );
}

function App() {
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
  let publicRoutes = <></>;

  roles.forEach((role) => {
    if (role === "ADMIN") {
      adminRoutes = (
        <>
          <Route path="/users" exact={true} element={<PrivateRoute><UserListAdmin /></PrivateRoute>} />
          <Route path="/users/:id" exact={true} element={<PrivateRoute><UserEditAdmin /></PrivateRoute>} />    
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
          {/*<Route path="/register" element={<Register />} />*/}
          <Route path="/info" element={<Info />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/editProfile" element={<EditProfile />} />
          <Route path="/GamesPlayed" element={<GamesPlayed />} />
          <Route path="/Achievement" element={<Achievements />} />

        </>)
    }    
  })
  if (!jwt) {
    publicRoutes = (
      <>        
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </>
    )
  } else {
    userRoutes = (
      <>
        {/* <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} /> */}  
        <Route path="/lobby" element={<PrivateRoute><Lobby /></PrivateRoute>} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/login" element={<Login />} />
        <Route path="/CreateGame/:id" element={<PrivateRoute><CreateGame /></PrivateRoute>} />
        <Route path="/CreateGame" element={<PrivateRoute><CreateGame /></PrivateRoute>} />
        <Route path="/board/:id" element={<PrivateRoute><Board/></PrivateRoute>} />
        <Route path="/ListGames" element={<PrivateRoute><ListGames /></PrivateRoute>} />
        <Route path="/ranking" element={<PrivateRoute><Ranking /></PrivateRoute>} />
      </>
    )
  }

  return (
    <div>
      <ErrorBoundary FallbackComponent={ErrorFallback} >
        <AppNavbar />
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <Routes>
          <Route path="/" exact={true} element={<Home />} />
          {publicRoutes}
          {userRoutes}
          {adminRoutes}
          {ownerRoutes}
          {vetRoutes}
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;