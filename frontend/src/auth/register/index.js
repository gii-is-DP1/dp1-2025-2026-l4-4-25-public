import "../../static/css/auth/authButton.css";
import "../../static/css/auth/authPage.css";
import tokenService from "../../services/token.service";
import FormGenerator from "../../components/formGenerator/formGenerator";
import { registerFormPlayer } from "./form/registerFormPlayer";
import { useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import defaultProfileImage from "../../static/images/default_profile.png"


export default function Register() {
  let [authority, setAuthority] = useState(null);

  const registerFormRef = useRef();

  function handleButtonClick(event) {
    const target = event.target;
    let value = target.value;
    if (value === "Back") value = null;
    else setAuthority(value);
  }

  function handleSubmit({ values }) {

    if(!registerFormRef.current.validate()) return;
    const profileImage = values.image?.[0] || defaultProfileImage;
    const request = {
      ...values,
      authority,
      image: profileImage
    };

    // request["authority"] = authority; // No hace falta unirlo si se añade a la construcción del objeto
    let state = "";

    fetch("/api/v1/auth/signup", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(request),
    })
      .then(function (response) {
        if (response.status === 200) {
          const loginRequest = {
            username: request.username,
            password: request.password,
          };

          fetch("/api/v1/auth/signin", {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify(loginRequest),
          })
            .then(function (response) {
              if (response.status === 200) {
                state = "200";
                return response.json();
              } else {
                state = "";
                return response.json();
              }
            })
            .then(function (data) {
              if (state !== "200") alert(data.message);
              else {
                tokenService.setUser(data);
                tokenService.updateLocalAccessToken(data.token);
                window.location.href = "/";
              }
            })
            .catch((message) => {
              alert(message);
            });
        }
      })
      .catch((message) => {
        alert(message);
      });
  }  
    return (
      <div className="auth-page-container">
        <Link to="/login">
            <button className="auth-returnLogin-button"> Return to Login ➡️</button>
        </Link>
        <h1>Register</h1>
        <div className="auth-form-container">
          <FormGenerator
            ref={registerFormRef}
            inputs={registerFormPlayer}
            onSubmit={handleSubmit}
            numberOfColumns={1}
            listenEnterKey
            buttonText="Save"
            buttonClassName="auth-button"
          />
        </div>
      </div>
    );

  }

