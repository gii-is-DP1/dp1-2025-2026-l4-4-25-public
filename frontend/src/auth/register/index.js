import "../../static/css/auth/authButton.css";
import "../../static/css/auth/authPage.css";
import tokenService from "../../services/token.service";
import FormGenerator from "../../components/formGenerator/formGenerator";
import { registerFormPlayer } from "./form/registerFormPlayer";
import { useEffect, useRef, useState } from "react";
import { Link } from 'react-router-dom';
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png"
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import getIconImage from "../../util/getIconImage"; 
// import { IoMdArrowDropdown} from "react-icons/io"; // Para hacer más vistosa la flecha del dropdown

export default function Register() {
  let [authority, setAuthority] = useState(null);
  const [profileImage, setProfileImage] = useState(defaultProfileAvatar);
  const [dropdownOpen, setDropdownOpen] = useState(false); 
  const toggleDropdown = () => setDropdownOpen(prev => !prev)
  const registerFormRef = useRef();
 /*
  function handleButtonClick(event) {
    const target = event.target;
    let value = target.value;
    if (value === "Back") value = null;
    else setAuthority(value);
  }
  */
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if(file) {
      const imageUrl = URL.createObjectURL(file); 
      setProfileImage(imageUrl);
    }
  }
  function handleSubmit({ values }) {

    if(!registerFormRef.current.validate()) return;
    const request = {
      ...values,
      image: profileImage,
      authority: 2
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
                window.location.href = "/lobby";
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
          <div style={{marginBottom: '1rem'}} className="profile-image-selector">
            <label>Select profile image:</label>
            <div className="profile-image-options">
              <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
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
              {/*Previsualización */}
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

