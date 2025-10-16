import React, { useState, useEffect, useRef } from 'react';
import '../../App.css';
import '../../static/css/lobbies/profile.css';
import { Link } from 'react-router-dom';
import tokenService from '../../services/token.service.js';
import FormGenerator from "../../components/formGenerator/formGenerator";
import { editProfileFormPlayer } from "./form/editProfileFormPlayer";
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png"
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import getIconImage from "../../util/getIconImage"; 
// import { IoMdArrowDropdown} from "react-icons/io";
import { useNavigate } from 'react-router-dom';

const jwt = tokenService.getLocalAccessToken();

export default function EditProfile() {
    let [authority, setAuthority] = useState(null);
    const [profileData, setProfileData] = useState({}); 
    const [profileImage, setProfileImage] = useState(defaultProfileAvatar);
    const [dropdownOpen, setDropdownOpen] = useState(false); 
    const toggleDropdown = () => setDropdownOpen(prev => !prev)
    const [formInputs, setFormInputs] = useState([]);
    const editProfileFormRef = useRef();
    const navigate = useNavigate();


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const jwt = tokenService.getUser();
                if (!jwt || !jwt.id){
                    throw new Error("User ID not found")
                }
                
                const userId = jwt.id;
                const response = await fetch(`/api/v1/users/${userId}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${jwt}`,
                    },
                });
                const data = await response.json();
                setProfileData(data);
                setProfileImage(data.image || defaultProfileAvatar);
                const inputsWithInitialValues = editProfileFormPlayer.map(input => {
                    let defaultValue = data[input.name] ?? "";

                    if (input.name === 'password'){
                        defaultValue = ""; // Se muestra el campo inicial vacío y no el "hash" que se extrae del backend
                    }
                    return {
                        ...input, 
                        defaultValue: defaultValue
                    };
        
                }); 
                setFormInputs(inputsWithInitialValues);
                console.log(data);
                //setOriginalUsername(data.username);
                //setOriginalPassword(data.password);

            } catch(error){
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, []); 

    const handleFileChange = (event) => {
        const file= event.target.files[0];
        if(file) {
            const imageUrl = URL.createObjectURL(file); 
            setProfileImage(imageUrl);
        }
    }
    
    async function handleSubmit({ values }) {

        if(!editProfileFormRef.current.validate()) return;

        try{
            const request = {
                username: values.username,
                password: values.password, // OJO! --> Si esto no se modifica en el backend estaremos mandando una contraseña vacía
                name: values.name,
                email: values.email,
                birthDate: values.birthDate, 
                image: profileImage
        };
            const jwt = tokenService.getUser();
            if (!jwt || !jwt.id){
                throw new Error("User ID not found")
            }
            const userId = jwt.id;
            const response = await fetch(`/api/v1/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${jwt}`,
                },
                body: JSON.stringify(request),
            });
            const data = await response.json();

            if (response.ok){
                tokenService.setUser(data);
                alert("Profile updated successfully!");
                navigate('/profile');
            } else {
                alert(data.message || "Could not update profile");
            }
        }catch(error){
            console.error(error);
            alert("An error occurred while updating profile");
        }
  }  

    return (
        <div className="home-page-container">

            <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', zIndex: 10 }}>
                <img src="/logo1-recortado.png" alt="logo" style={{ height: 95, width: 95 }} />
            </div>
            <div className="top-right-lobby-buttons">
                <Link to="/profile">
                    <button className="button-logOut"> ➡️</button>
                </Link>
            </div>
            <div className= "edit-profile-container">
                <div style={{marginBottom: '1rem'}} className="edit-profile-left">
                <label>Change profile image:</label>
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
            <div className="edit-profile-right">
                {formInputs.length > 0 ? (
                    <FormGenerator
                    ref={editProfileFormRef}
                    inputs={formInputs}
                    onSubmit={handleSubmit}
                    numberOfColumns={1}
                    listenEnterKey
                    buttonText="Save"
                    buttonClassName="auth-button"
                    />
                ) : (
                    <p>Loading form...</p>
                     )}
            </div>
          </div>
            
        </div>
    );
}