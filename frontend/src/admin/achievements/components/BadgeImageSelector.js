import React from 'react';
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';
import getAchievementBadgeImage from '../../../util/getAchievementBadgeImage';

const BadgeImageSelector = ({ 
  badgeImage, 
  onImageChange, 
  dropdownOpen, 
  toggleDropdown,
  label = "Badge Image:"
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
    onImageChange(getAchievementBadgeImage(imageNumber));
  };

  return (
    <div className="badge-image-selector">
      <label>{label}</label>
      <div className="badge-image-options">
        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
          <DropdownToggle caret className="badge-dropdown-toggle">
            Choose pre-defined images
          </DropdownToggle>
          <DropdownMenu>
            <DropdownItem onClick={() => handlePredefinedImage(1)}>
              Badge 1 (Built Paths)
            </DropdownItem>
            <DropdownItem onClick={() => handlePredefinedImage(2)}>
              Badge 2 (Destroyed Paths)
            </DropdownItem>
            <DropdownItem onClick={() => handlePredefinedImage(3)}>
              Badge 3 (Destroyed Tools)
            </DropdownItem>
            <DropdownItem onClick={() => handlePredefinedImage(4)}>
              Badge 4 (Gold Nuggets)
            </DropdownItem>
            <DropdownItem onClick={() => handlePredefinedImage(5)}>
              Badge 5 (Played Games)
            </DropdownItem>
            <DropdownItem onClick={() => handlePredefinedImage(6)}>
              Badge 6 (Repaired Tools)
            </DropdownItem>
            <DropdownItem onClick={() => handlePredefinedImage(7)}>
              Badge 7 (Victories)
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="badge-file-input"
        />
        {badgeImage && (
          <img 
            src={badgeImage} 
            alt="Badge Preview" 
            className="badge-image-preview"
          />
        )}
      </div>
    </div>
  );
};

export default BadgeImageSelector;
