import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, ButtonGroup, Table } from "reactstrap";
import tokenService from "../../services/token.service";
import "../../static/css/admin/adminPage.css";
import "../../static/css/admin/AdminModals.css";
import deleteFromList from "../../util/deleteFromList";
import getErrorModal from "../../util/getErrorModal";
import useFetchState from "../../util/useFetchState";
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png"

// Helper function to get JWT dynamically (prevents stale token issues)
const getJwt = () => tokenService.getLocalAccessToken();
const loggedInUser = tokenService.getUser(); 

export default function UserListAdmin() {
  const navigate = useNavigate();
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);
  const [users, setUsers] = useFetchState(
    [],
    `/api/v1/users`,
    getJwt(), 
    setMessage,
    setVisible
  );
  const [alerts, setAlerts] = useState([]);
  const [showActiveGameModal, setShowActiveGameModal] = useState(false);
  const [userInActiveGame, setUserInActiveGame] = useState(null);
  const [modalAction, setModalAction] = useState("delete"); // "delete" o "edit"

  async function handleEdit(user) {
    try {
      const response = await fetch(`/api/v1/users/${user.id}/inActiveGame`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${jwt}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const isInActiveGame = await response.json();
        if (isInActiveGame) {
          setUserInActiveGame(user);
          setModalAction("edit");
          setShowActiveGameModal(true);
          return;
        }
      }
      
      // Si no está en una partida activa, navegar al formulario de edición
      navigate(`/users/${user.id}`);
    } catch (error) {
      console.error("Error checking user game status:", error);
      setMessage("Error checking user status. Please try again.");
      setVisible(true);
    }
  }

  async function handleDelete(user) {
    try {
      const response = await fetch(`/api/v1/users/${user.id}/inActiveGame`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${getJwt()}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      
      if (response.ok) {
        const isInActiveGame = await response.json();
        if (isInActiveGame) {
          setUserInActiveGame(user);
          setModalAction("delete");
          setShowActiveGameModal(true);
          return;
        }
      }
      
      deleteFromList(
        `/api/v1/users/${user.id}`,
        user.id,
        [users, setUsers],
        [alerts, setAlerts],
        setMessage,
        setVisible
      );
    } catch (error) {
      console.error("Error checking user game status:", error);
      setMessage("Error checking user status. Please try again.");
      setVisible(true);
    }
  }

  const ActiveGameModal = () => {
    if (!showActiveGameModal || !userInActiveGame) return null;
    
    const actionText = modalAction === "edit" ? "Edit" : "Delete";
    const actionTextLower = modalAction === "edit" ? "edited" : "deleted";
    const actionVerb = modalAction === "edit" ? "edit" : "delete";
    
    return (
      <div className="modal-overlay" onClick={() => setShowActiveGameModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>⚠️ Cannot {actionText} User ⚠️</h2>
            <button className="modal-close-btn" onClick={() => setShowActiveGameModal(false)}>✕</button>
          </div>
          
          <div className="modal-body">
            <div className="modal-info">
              <p><strong>· Username:</strong> {userInActiveGame.username}</p>
              <p><strong>· Role:</strong> {typeof userInActiveGame.authority === 'string' ? userInActiveGame.authority : userInActiveGame.authority?.authority}</p>
            </div>

            <div className="modal-warning">
              <p>🚫 This user cannot be {actionTextLower} because they are currently participating in an active game with status CREATED or ONGOING.</p>
            </div>

            <div className="modal-info">
              <p>Please wait until the game is finished or ask the user to leave the game before attempting to {actionVerb} their account.</p>
            </div>
          </div>

          <div className="modal-footer">
            <button 
              className="btn-modal-cancel" 
              onClick={() => setShowActiveGameModal(false)}>
              Understood
            </button>
          </div>
        </div>
      </div>
    );
  };

  const userList = users.map((user) => {
    console.log("Renderizando usuario:", user);
    return(
    <tr key={user.id} className="user-row">
      <td data-label="Avatar">
        <div className="user-table-cell">
          <img
            src={
              user.image 
                ? user.image  
                : defaultProfileAvatar 
            }
            alt={`${user.username} avatar`}
            className="user-avatar"
          />
        </div>
      </td>
      <td data-label="Username">
        <div className="user-table-cell">
          <span className="cell-value">{user.username}</span>
        </div>
      </td>
      <td data-label="Rol">
        <div className="user-table-cell">
          <span
            className={`user-role ${
              (typeof user.authority === 'string' ? user.authority : user.authority?.authority) === "ADMIN" ? "role-admin" : "role-user"
            }`}
          >
            {typeof user.authority === 'string' ? user.authority : (user.authority?.authority)}
          </span>
        </div>
      </td>
      <td data-label="Actions">
        <div className="user-table-cell">
          <ButtonGroup className="user-actions">
            <Button
              size="sm"
              color="primary"
              aria-label={"edit-" + user.id}
              onClick={() => handleEdit(user)}
              className="action-btn action-edit"
            >
              ✏️ Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              aria-label={"delete-" + user.id}
              onClick={() => handleDelete(user)}
              disabled = {loggedInUser?.id === user.id}
              className="action-btn action-delete"
            >
              🗑️ Delete
            </Button>
          </ButtonGroup>
        </div>
      </td>
    </tr>
  )});

  const modal = getErrorModal(setVisible, visible, message);

  return (
    <div className="admin-page-container">
      <div className="admin-header-unified">
        <div className="header-content">
          <h1>👥 User Management Dashboard</h1>
          <p className="header-subtitle">Manage Saboteur Users and Permissions</p>
        </div>
        <div className="header-actions">
          <Button color="success" tag={Link} to="/users/new" className="add-user-btn">
            Add User
          </Button>
          <Link to="/lobby">
            <button className="btn-back-unified">➡️</button>
          </Link>
        </div>
      </div>

      {alerts.map((a) => a.alert)}
      {modal}

      <div className="user-content-wrapper">
        <div className="user-table-container">
          <Table responsive bordered hover className="user-table">
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Username</th>
                <th>Rol</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{userList}</tbody>
          </Table>
        </div>
      </div>

      <ActiveGameModal />
    </div>
  );
}