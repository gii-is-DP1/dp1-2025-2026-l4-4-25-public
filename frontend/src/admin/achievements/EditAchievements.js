import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import tokenService from '../../services/token.service';
import ProfileLogo from '../../lobbies/profiles/components/ProfileLogo';
import BadgeImageSelector from './components/BadgeImageSelector';
import '../../static/css/lobbies/profile.css';
import '../../static/css/lobbies/achievements.css';
import '../../static/css/admin/editAchievements.css';

export default function EditAchievements() {
  const [achievements, setAchievements] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);
  const [editDropdownOpen, setEditDropdownOpen] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    tittle: '',
    description: '',
    badgeImage: '',
    threshold: 0,
    metric: 'GAMES_PLAYED'
  });

  const jwt = tokenService.getLocalAccessToken();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    try {
      const payload = JSON.parse(atob(jwt.split('.')[1]));
      const admin = payload.authorities?.includes("ADMIN") || false;
      setIsAdmin(admin);
      if (!admin) {
        navigate('/lobby');
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate('/lobby');
    }
  }, [jwt, navigate]);

  useEffect(() => {
    fetchAchievements();
  }, [jwt]);

  const fetchAchievements = async () => {
    try {
      const res = await fetch('/api/v1/achievements', { 
        headers: { Authorization: `Bearer ${jwt}` } 
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error fetching achievements:", errorText);
        throw new Error(`Failed to fetch achievements: ${res.status} ${errorText}`);
      }
      const data = await res.json();
      setAchievements(data);
    } catch (err) {
      console.error("Error in fetchAchievements:", err);
      setMessage({ type: 'error', text: `Error loading achievements: ${err.message}` });
    }
  };

  const handleEdit = (id) => {
    setEditingId(editingId === id ? null : id);
  };

  const handleChange = (id, field, value) => {
    setAchievements(achievements.map(ach => 
      ach.id === id ? { ...ach, [field]: value } : ach
    ));
  };

  const handleUpdate = async (ach) => {
    try {
      const res = await fetch(`/api/v1/achievements/${ach.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}` 
        },
        body: JSON.stringify(ach),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error updating achievement:", errorText);
        throw new Error(`Failed to update achievement: ${errorText}`);
      }
      
      setMessage({ type: 'success', text: 'Achievement updated successfully!' });
      setEditingId(null);
      fetchAchievements();
    } catch (err) {
      console.error("Error in handleUpdate:", err);
      setMessage({ type: 'error', text: `Error updating achievement: ${err.message}` });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;
    
    try {
      const res = await fetch(`/api/v1/achievements/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${jwt}` }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error deleting achievement:", errorText);
        throw new Error(`Failed to delete achievement: ${errorText}`);
      }
      
      setMessage({ type: 'success', text: 'Achievement deleted successfully!' });
      fetchAchievements();
    } catch (err) {
      console.error("Error in handleDelete:", err);
      setMessage({ type: 'error', text: `Error deleting achievement: ${err.message}` });
    }
  };

  const handleCreateChange = (field, value) => {
    setNewAchievement({ ...newAchievement, [field]: value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const user = tokenService.getUser();
      
      const achievementData = {
        tittle: newAchievement.tittle.trim(),
        description: newAchievement.description.trim(),
        badgeImage: newAchievement.badgeImage.trim() || null,
        threshold: parseInt(newAchievement.threshold, 10),
        metric: newAchievement.metric,
        creator: user.username 
      };
      
      const res = await fetch('/api/v1/achievements', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwt}` 
        },
        body: JSON.stringify(achievementData),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", res.status, errorText);
        throw new Error(`Failed to create achievement (${res.status}): ${errorText}`);
      }
      
      const result = await res.json();
      
      setMessage({ type: 'success', text: 'Achievement created successfully!' });
      setShowCreateForm(false);
      setNewAchievement({
        tittle: '',
        description: '',
        badgeImage: '',
        threshold: 0,
        metric: 'GAMES_PLAYED'
      });
      
      fetchAchievements();
    } catch (err) {
      console.error("Error creating achievement:", err);
      setMessage({ type: 'error', text: err.message || 'Error creating achievement' });
    }
  };

  const metrics = [
    'GAMES_PLAYED',
    'VICTORIES',
    'BUILDED_PATHS',
    'DESTROYED_PATHS',
    'GOLD_NUGGETS',
    'TOOLS_DAMAGED',
    'TOOLS_REPAIRED'
  ];

  if (!isAdmin) return null;

  const handleBack = () => {
    if (location.state?.from === '/achievements' || document.referrer.includes('/Achievement')) {
      navigate('/Achievement');
    } else if (isAdmin) {
      navigate('/lobby');
    } else {
      navigate('/profile');
    }
  };

  return (
    <div className="admin-achievements-page">
      <div className="admin-header-unified">
        <div className="header-content">
          <h1>🏆 Achievement Management Dashboard</h1>
          <p className="header-subtitle">Create and manage Achievements for Saboteurs players</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn-create-achievement"
            onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? '❌ Cancel' : 'Create Achievement'}
          </button>
          <button className="btn-back-unified" onClick={handleBack}>
            ➡️ 
          </button>
        </div>
      </div>

      {message && (
        <div className={`admin-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="achievement-content-wrapper">
        {showCreateForm && (
          <form className="achievement-form" onSubmit={handleCreate}>
            <h3>Create New Achievement</h3>
            <div className="form-row">
              <label>Title:</label>
              <input
                type="text"
                value={newAchievement.tittle}
                onChange={(e) => handleCreateChange('tittle', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <label>Description:</label>
              <textarea
                value={newAchievement.description}
                onChange={(e) => handleCreateChange('description', e.target.value)}
                required
              />
            </div>
            <div className="form-row">
              <BadgeImageSelector
                badgeImage={newAchievement.badgeImage}
                onImageChange={(image) => handleCreateChange('badgeImage', image)}
                dropdownOpen={createDropdownOpen}
                toggleDropdown={() => setCreateDropdownOpen(!createDropdownOpen)}
                label="Badge Image:"
              />
            </div>
            <div className="form-row">
              <label>Threshold:</label>
              <input
                type="number"
                value={newAchievement.threshold}
                onChange={(e) => handleCreateChange('threshold', parseInt(e.target.value))}
                min="0"
                required
              />
            </div>
            <div className="form-row">
              <label>Metric:</label>
              <select
                value={newAchievement.metric}
                onChange={(e) => handleCreateChange('metric', e.target.value)}
              >
                {metrics.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button type="submit" className="button-small save-btn">💾 Create Achievement</button>
          </form>
        )}

        <div className="achievements-list-admin">
          {achievements.map((ach) => (
            <div key={ach.id} className="achievement-card-admin">
              {editingId === ach.id ? (
                <div className="achievement-edit-form">
                  <div className="form-row">
                    <label>Title:</label>
                    <input
                      type="text"
                      value={ach.tittle}
                      onChange={(e) => handleChange(ach.id, 'tittle', e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <label>Description:</label>
                    <textarea
                      value={ach.description}
                      onChange={(e) => handleChange(ach.id, 'description', e.target.value)}
                    />
                  </div>
                  <div className="form-row">
                    <BadgeImageSelector
                      badgeImage={ach.badgeImage || ''}
                      onImageChange={(image) => handleChange(ach.id, 'badgeImage', image)}
                      dropdownOpen={editDropdownOpen}
                      toggleDropdown={() => setEditDropdownOpen(!editDropdownOpen)}
                      label="Badge Image:"
                    />
                  </div>
                  <div className="form-row">
                    <label>Threshold:</label>
                    <input
                      type="number"
                      value={ach.threshold}
                      onChange={(e) => handleChange(ach.id, 'threshold', parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                  <div className="form-row">
                    <label>Metric:</label>
                    <select
                      value={ach.metric}
                      onChange={(e) => handleChange(ach.id, 'metric', e.target.value)}
                    >
                      {metrics.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="button-group">
                    <button className="button-small save-btn" onClick={() => handleUpdate(ach)}>
                      💾 Save
                    </button>
                    <button className="button-small cancel-btn" onClick={() => handleEdit(null)}>
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="achievement-view">
                  <div className="achievement-info-admin">
                    <img 
                      src={ach.badgeImage || '/default-badge.png'} 
                      alt={ach.tittle}
                      className="achievement-badge-small"
                    />
                    <div>
                      <h4>{ach.tittle}</h4>
                      <p>{ach.description}</p>
                      <p><strong>Metric:</strong> {ach.metric} | <strong>Threshold:</strong> {ach.threshold}</p>
                    </div>
                  </div>
                  <div className="button-group">
                    <button className="button-small edit-btn" onClick={() => handleEdit(ach.id)}>
                      ✏️ Edit
                    </button>
                    <button className="button-small delete-btn" onClick={() => handleDelete(ach.id)}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
