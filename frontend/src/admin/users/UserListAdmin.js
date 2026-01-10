import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, ButtonGroup, Table } from "reactstrap";
import tokenService from "../../services/token.service";
import "../../static/css/admin/adminPage.css";
import deleteFromList from "../../util/deleteFromList";
import getErrorModal from "../../util/getErrorModal";
import useFetchState from "../../util/useFetchState";
import defaultProfileAvatar from "../../static/images/icons/default_profile_avatar.png"

const jwt = tokenService.getLocalAccessToken(); 
const loggedInUser = tokenService.getUser(); 

export default function UserListAdmin() {
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);
  const [users, setUsers] = useFetchState(
    [],
    `/api/v1/users`,
    jwt, 
    setMessage,
    setVisible
  );
  const [alerts, setAlerts] = useState([]);

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
              tag={Link}
              to={"/users/" + user.id}
              className="action-btn action-edit"
            >
              ✏️ Edit
            </Button>
            <Button
              size="sm"
              color="danger"
              aria-label={"delete-" + user.id}
              onClick={() =>
                deleteFromList(
                  `/api/v1/users/${user.id}`,
                  user.id,
                  [users, setUsers],
                  [alerts, setAlerts],
                  setMessage,
                  setVisible
                )
              }
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
    </div>
  );
}