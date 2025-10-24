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

export default function UserListAdmin() {
  const [message, setMessage] = useState(null);
  const [visible, setVisible] = useState(false);
  // const [profileImage, setProfileImage] = useState(defaultProfileAvatar);
  const [users, setUsers] = useFetchState(
    [],
    `/api/v1/users`,
    jwt,
    setMessage,
    setVisible
  );
  const [alerts, setAlerts] = useState([]);

  const userList = users.map((user) => (
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
              user.authority === "ADMIN" ? "role-admin" : "role-user"
            }`}
          >
            {user.authority || 'Rol desconocido'}
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
              className="action-btn action-delete"
            >
              🗑️ Delete
            </Button>
          </ButtonGroup>
        </div>
      </td>
    </tr>
  ));

  const modal = getErrorModal(setVisible, visible, message);

  return (
    <div className="admin-page-container">
      <h1 className="admin-page-title">User Management Panel</h1>
      {alerts.map((a) => a.alert)}
      {modal}
      <Button color="success" tag={Link} to="/users/new" className="add-user-btn">
        👤Add User
      </Button>

      <div className="user-table-container">
        <Table responsive bordered hover className="user-table mt-4">
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
    <div className="top-right-lobby-buttons">
        <Link to="/lobby">
          <button className="button-logOut"> ➡️</button>
        </Link>
    </div>
    </div>
  );
}
