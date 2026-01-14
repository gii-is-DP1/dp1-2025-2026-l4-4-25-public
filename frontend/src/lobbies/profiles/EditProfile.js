import React, { useState, useRef } from 'react';
import useEditProfile from './hooks/useEditProfile';

import ProfileLogo from './components/ProfileLogo';
import TopButtons from './components/TopButtons';
import ProfileImageSelector from './components/ProfileImageSelector';
import EditProfileFormSection from './components/EditProfileFormSection';

import '../../App.css';

export default function EditProfile() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const editProfileFormRef = useRef();

  const {
    profileImage,
    setProfileImage,
    formInputs,
    loading,
    updateProfile
  } = useEditProfile();

  const toggleDropdown = () => setDropdownOpen(prev => !prev);

  const handleSubmit = async ({ values }) => {
    await updateProfile(values, editProfileFormRef);
  };

  if (loading) {
    return (
      <div className="home-page-container">
        <ProfileLogo />
        <TopButtons showLogout={false} returnTo="/profile" />
        <div>Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="home-page-container">
      <ProfileLogo />
      <TopButtons showLogout={false} returnTo="/profile" />

      <div className="edit-profile-container">
        <ProfileImageSelector
          profileImage={profileImage}
          onImageChange={setProfileImage}
          dropdownOpen={dropdownOpen}
          toggleDropdown={toggleDropdown}
        />

        <EditProfileFormSection
          formInputs={formInputs}
          formRef={editProfileFormRef}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}