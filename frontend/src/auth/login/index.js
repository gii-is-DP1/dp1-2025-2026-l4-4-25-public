import React, { useState } from "react";
import { Alert } from "reactstrap";
import { Link } from 'react-router-dom';
import FormGenerator from "../../components/formGenerator/formGenerator";
import tokenService from "../../services/token.service";
import WelcomeScreen from "../../components/WelcomeScreen";
import "../../static/css/auth/authButton.css";
import { loginFormInputs } from "./form/loginFormInputs";

export default function Login() {
  const [message, setMessage] = useState(null)
  const [showWelcome, setShowWelcome] = useState(false);
  const [username, setUsername] = useState("");
  const loginFormRef = React.createRef();      
  

  async function handleSubmit({ values }) {

    const reqBody = values;
    setMessage(null);
    await fetch("/api/v1/auth/signin", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(reqBody),
    })
      .then(function (response) {
        if (response.status === 200) return response.json();
        else return Promise.reject("Invalid login attempt");
      })
      .then(function (data) {
        tokenService.setUser(data);
        tokenService.updateLocalAccessToken(data.token);
        setUsername(data.username);
        setShowWelcome(true);
      })
      .catch((error) => {         
        setMessage(error);
      });            
  }

  const handleWelcomeComplete = () => {
    window.location.href = "/lobby";
  };

  if (showWelcome) {
    return <WelcomeScreen username={username} onComplete={handleWelcomeComplete} />;
  }
  
    return (
      <div className="auth-page-container">
        {message ? (
          <Alert color="primary">{message}</Alert>
        ) : (
          <></>
        )}
      
        <h1>Login</h1>

        <div className="auth-form-container">
          <FormGenerator
            ref={loginFormRef}
            inputs={loginFormInputs}
            onSubmit={handleSubmit}
            numberOfColumns={1}
            listenEnterKey
            buttonText="Log in"
            buttonClassName="auth-button"
          />
         </div>
          <div className="register-redirect">
            <p>Not registered yet? {" "}
               <Link to="/register" className="register-link">
                Sign up here
              </Link>
            </p>
         </div>
        </div>
    );  
}