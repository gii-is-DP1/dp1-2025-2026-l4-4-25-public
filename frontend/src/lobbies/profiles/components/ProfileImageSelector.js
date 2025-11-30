import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import getIconImage from '../../../util/getIconImage';

const ProfileImageSelector = ({ 
  profileImage, 
  onImageChange, 
  dropdownOpen, 
  toggleDropdown 
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePredefinedImage = (imageNumber) => {
    onImageChange(getIconImage(imageNumber));
  };

  return (
    <div style={{ marginBottom: '1rem' }} className="edit-profile-left">
      <label>Change profile image:</label>
      <div className="profile-image-options">
        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle caret>
            Choose pre-defined images
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => handlePredefinedImage(1)}>
              Miner 1
            </DropdownItem>
            <DropdownItem onClick={() => handlePredefinedImage(2)}>
              Miner 2
            </DropdownItem>
            <DropdownItem onClick={() => handlePredefinedImage(3)}>
              Miner 3
            </DropdownItem>
            <DropdownItem onClick={() => handlePredefinedImage(4)}>
              Miner 4
            </DropdownItem>
            <DropdownItem onClick={() => handlePredefinedImage(5)}>
              Miner 5
            </DropdownItem>
            <DropdownItem onClick={() => handlePredefinedImage(6)}>
              Miner 6
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        {/* Previsualización */}
        <img 
          src={profileImage} 
          alt="Avatar" 
          className="profile-image-preview"
        />
      </div>
    </div>
  );
};

export default ProfileImageSelector;
