import "../../static/css/auth/authButton.css";
import "../../static/css/auth/authPage.css";
import tokenService from "../../services/token.service";
import FormGenerator from "../../components/formGenerator/formGenerator";
import { registerFormPlayer } from "./form/registerFormPlayer";
import { useRef, useState } from "react";
import { Link } from 'react-router-dom';
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png"
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import getIconImage from "../../util/getIconImage";
import WelcomeScreen from "../../components/WelcomeScreen";

export default function Register() {
  const [profileImage, setProfileImage] = useState(defaultProfileAvatar);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [username, setUsername] = useState("");
  const registerFormRef = useRef();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if(file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit({ values }) {
    if(!registerFormRef.current.validate()) return;
    
    const request = {
      ...values,
      image: profileImage,
      authority: 2
    };

    fetch("/api/v1/auth/signup", {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify(request),
    })
      .then(function (response) {
        if (response.status === 200) {
          return response.json();
        } else {
          return response.json().then(data => {
            const raw = data.message || "Registration failed";
            const isUniqueViolation = /unique|constraint|duplicate|23505|unique index|primary key violation|violación de indice|clave primaria/i.test(raw);
            const friendly = isUniqueViolation
              ? "This email is already registered. Try logging in or use a different email."
              : (data.message || "Registration failed. Please try again.");

            try {
              if (registerFormRef.current && registerFormRef.current.setFieldErrors) {
                registerFormRef.current.setFieldErrors('email', friendly);
                const emailInput = document.querySelector('input[name="email"], select[name="email"], textarea[name="email"]');
                if (emailInput && typeof emailInput.focus === 'function') emailInput.focus();
              } else {
                alert(friendly);
              }
            } catch (e) {
              console.error('Error setting field error:', e);
              alert(friendly);
            }
            throw new Error(friendly);
          });
        }
      })
      .then(function (data) {
        const loginRequest = {
          username: request.username,
          password: request.password,
        };

        return fetch("/api/v1/auth/signin", {
          headers: { "Content-Type": "application/json" },
          method: "POST",
          body: JSON.stringify(loginRequest),
        });
      })
      .then(function (response) {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error("Login failed after registration");
        }
      })
      .then(function (data) {
        tokenService.setUser(data);
        tokenService.updateLocalAccessToken(data.token);
        setUsername(data.username);
        setShowWelcome(true);
      })
      .catch((error) => {
        console.error("Registration error:", error);
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
      <Link to="/login">
        <button className="auth-returnLogin-button"> Return to Login ➡️</button>
      </Link>
      <h1>Register</h1>
      <div className="auth-form-container">
        <div style={{marginBottom: '1rem'}} className="profile-image-selector">
          <label>Select profile image:</label>
          <div className="profile-image-options">
            <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
              <DropdownToggle caret>
                Choose pre-defined images
              </DropdownToggle>
              <DropdownMenu>
                <DropdownItem onClick={() => setProfileImage(getIconImage(1))}>Miner 1</DropdownItem>
                <DropdownItem onClick={() => setProfileImage(getIconImage(2))}>Miner 2</DropdownItem>
                <DropdownItem onClick={() => setProfileImage(getIconImage(3))}>Miner 3</DropdownItem>
                <DropdownItem onClick={() => setProfileImage(getIconImage(4))}>Miner 4</DropdownItem>
                <DropdownItem onClick={() => setProfileImage(getIconImage(5))}>Miner 5</DropdownItem>
                <DropdownItem onClick={() => setProfileImage(getIconImage(6))}>Miner 6</DropdownItem>
              </DropdownMenu>
            </Dropdown>
            <input type="file" accept="image/*" onChange={handleFileChange}/>
            <img src={profileImage} alt="Avatar" className="profile-image-preview"/>
          </div>
        </div>
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