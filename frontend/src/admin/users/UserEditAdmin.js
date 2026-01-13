import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem, Form, Input, Label } from "reactstrap";
import tokenService from "../../services/token.service";
import "../../static/css/admin/adminPage.css";
import "../../static/css/auth/authPage.css";
import "../../static/css/auth/authButton.css";
import getErrorModal from "../../util/getErrorModal";
import useFetchData from "../../util/useFetchData";
import useFetchState from "../../util/useFetchState";
import getIconImage from "../../util/getIconImage";
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png";
import { useParams } from "react-router-dom";

// Helper function to get JWT dynamically (prevents stale token issues)
const getJwt = () => tokenService.getLocalAccessToken();
const loggedInUser = tokenService.getUser(); 

export default function UserEditAdmin() {
  const emptyItem = {
    id: null,
    username: "",
    password: "",
    name: "",
    birthDate: "",
    email: "",
    image: "",
    authority: { id: 2, authority: "PLAYER" }, // Por defecto, todo usuario que se añada será Player.
  };
  const { id: useIdFromUrl } = useParams();
  const id = useIdFromUrl && useIdFromUrl !== "new" ? parseInt(useIdFromUrl, 10) : null; // El 10 es para base 10*/
  // Comprobamos si el usuario logueado en ese mismo instante (el admin) se edita a sí mismo
  const isEditingSelf = loggedInUser && loggedInUser.id === id; 

  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);
  const [user, setUser] = useFetchState(emptyItem, id ? `/api/v1/users/${id}` : null, getJwt(), setMessage, setVisible, id);

  const [profileImage, setProfileImage] = useState(defaultProfileAvatar);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const auths = useFetchData(`/api/v1/users/authorities`, getJwt()); 

  useEffect(() => {
    if (typeof user.authority === 'string' && auths.length > 0) {
      const matchingAuth = auths.find(a => a.authority === user.authority);
      if (matchingAuth) {
        setUser(prevUser => ({ ...prevUser, authority: matchingAuth }));
      }
    }
  }, [user.authority, auths, setUser]);

  useEffect(() => {
    if (user?.image) setProfileImage(user.image);
    if (user?.password) setUser((prev)=>({...prev,password: "" }));
  }, [user?.id]);

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

  function handleChange(event) {
    const {name,value } = event.target;
    if (name === "authority") {
      const selectedAuth = auths.find((a) => a.id === Number(value)) || null;
      setUser({ ...user, authority: selectedAuth });
    } else {
      setUser({ ...user, [name]: value });}}

 
  function handleSubmit(event) {
    event.preventDefault();
    console.log("Intentando guardar usuario con ID:", user?.id);
    if (!user || (user.id !== null && typeof user.id !== 'number')) { 
      alert("Error: Invalid user ID. Reload the page.");
        return;
    }
    const request = {
      ...user,
      image: profileImage,
    };

    if (!user.password || user.password.trim() === "") {
      delete request.password;}
    
    // Eliminamos de la request el campo authority ya que este nunca se va a editar y va a mantener el que tenía de siempre (PLAYER)

    fetch("/api/v1/users" + (user.id ? "/" + user.id : ""), {
      method: user.id ? "PUT" : "POST",
      headers: {
        Authorization: `Bearer ${getJwt()}`,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })
      .then((response) => response.json())
      .then((json) => {
        if (json.message) {
          setMessage(json.message);
          setVisible(true);
        } else {
          window.location.href = "/users";
        }
      })
      .catch((message) => alert(message));
  }

  const modal = getErrorModal(setVisible, visible, message);
  const authOptions = auths.map((auth) => (
    <option key={auth.id} value={auth.id}>
      {auth.authority} 
    </option>
  ));

  return (
    <div className="auth-page-container">
      <Link to="/users">
        <button className="auth-returnLogin-button">⬅️ Return to Users</button>
      </Link>

      <h1>{user.id ? "Edit User" : "Add User"}</h1>
      {modal}

      <div className="auth-form-container">
        <div style={{ marginBottom: "1rem" }} className="profile-image-selector">
          <label>Select profile image:</label>
          <div className="profile-image-options">
            <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
              <DropdownToggle caret>Choose pre-defined images</DropdownToggle>
              <DropdownMenu>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <DropdownItem key={n} onClick={() => setProfileImage(getIconImage(n))}>
                    Miner {n}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <img src={profileImage} alt="Avatar" className="profile-image-preview" />
          </div>
        </div>

        <Form onSubmit={handleSubmit}>
          <div className="custom-form-input">
            <Label className="custom-form-input-label">Username</Label>
            <Input
              type="text"
              required
              name="username"
              value={user.username || ""}
              onChange={handleChange}
              className="custom-input"
            />
          </div>

          <div className="custom-form-input">
            <Label className="custom-form-input-label">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Enter new password"
              value={user.password || ""}
              onChange={handleChange}
              className="custom-input"/>
            {user.id !== null &&(
              <small style={{ color:"blue"}}>
              ❕Leave blank to keep current password
              </small>
            )}
          </div>

          <div className="custom-form-input">
            <Label className="custom-form-input-label">Complete name</Label>
            <Input
              type="text"
              required
              name="name"
              value={user.name || ""}
              onChange={handleChange}
              className="custom-input"
            />
          </div>

          <div className="custom-form-input">
            <Label className="custom-form-input-label">Date of birth</Label>
            <Input
              type="date"
              required
              name="birthDate"
              value={user.birthDate || ""}
              onChange={handleChange}
              className="custom-input"
            />
          </div>

          <div className="custom-form-input">
            <Label className="custom-form-input-label">Email</Label>
            <Input
              type="email"
              required
              name="email"
              value={user.email || ""}
              onChange={handleChange}
              className="custom-input"
            />
          </div>

          <div className="custom-form-input">
            <Label className="custom-form-input-label">Authority</Label>
            <Input
              type="select"
              name="authority"
              value={String(user.authority?.id || 2)} 
              onChange={handleChange}
              disabled={isEditingSelf}
              className="custom-input"
            >
              {authOptions}
            </Input>
            {isEditingSelf && (
              <small style={{ color: "blue" }}>
                ❕ You can´t change your own role.
              </small>
            )}
          </div>

          <div className="custom-button-row">
            <button type="submit" className="auth-button">
              💾Save
            </button>
            <Link to="/users" className="auth-button" style={{ textDecoration: "none" }}>
              ❌Cancel
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}
