import React from "react";
import { Link } from "react-router-dom";
import "../../static/css/auth/authButton.css";
import "../../static/css/auth/authPage.css";
import tokenService from "../../services/token.service";

const Logout = () => {
  function sendLogoutRequest() {
    const jwt = window.localStorage.getItem("jwt");
    if (jwt || typeof jwt === "undefined") {
      tokenService.removeUser();
      window.location.href = "/";
    } else {
      alert("There is no user logged in");
    }
  }

  return (
    <div className="auth-page-logout-container">
      <div className="auth-form-logout-container">
        <h2 className="text-center text-md logout-title">
          Are you sure you want to log out?
        </h2>
        <div className="options-row-logout">
          <Link className="auth-logout-button" to="/lobby" style={{textDecoration: "none"}}>
            No
          </Link>
          <button className="auth-logout-button" onClick={() => sendLogoutRequest()}>
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Logout;
