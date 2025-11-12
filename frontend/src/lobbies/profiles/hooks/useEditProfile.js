import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import tokenService from '../../../services/token.service';
import defaultProfileAvatar from '../../../static/images/icons/default_profile_avatar.png';
import { editProfileFormPlayer } from '../form/editProfileFormPlayer';
import { prepareFormInputs, buildUpdateProfileRequest } from '../utils/profileHelpers';

/**
 * Custom hook para manejar la lógica de edición de perfil
 */
const useEditProfile = () => {
  const [profileData, setProfileData] = useState({});
  const [profileImage, setProfileImage] = useState(defaultProfileAvatar);
  const [formInputs, setFormInputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch del perfil del usuario
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const jwt = tokenService.getUser();
        if (!jwt || !jwt.id) {
          throw new Error("User ID not found");
        }

        const userId = jwt.id;
        const token = tokenService.getLocalAccessToken();
        
        const response = await fetch(`/api/v1/users/${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfileData(data);
        setProfileImage(data.image || defaultProfileAvatar);

        // Preparar inputs del formulario con valores iniciales
        const inputsWithInitialValues = prepareFormInputs(editProfileFormPlayer, data);
        setFormInputs(inputsWithInitialValues);

        console.log("Profile data loaded:", data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Función para actualizar el perfil
  const updateProfile = async (values, formRef) => {
    // Validar formulario
    if (!formRef.current.validate()) {
      return false;
    }

    try {
      const jwt = tokenService.getUser();
      if (!jwt || !jwt.id) {
        throw new Error("User ID not found");
      }

      const userId = jwt.id;
      const token = tokenService.getLocalAccessToken();
      
      const request = buildUpdateProfileRequest(values, profileImage);

      const response = await fetch(`/api/v1/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (response.ok) {
        tokenService.setUser(data);
        toast.success("Profile updated successfully!");
        navigate('/profile');
        return true;
      } else {
        toast.warn(data.message || "Could not update profile");
        return false;
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile");
      return false;
    }
  };

  return {
    profileData,
    profileImage,
    setProfileImage,
    formInputs,
    loading,
    updateProfile
  };
};

export default useEditProfile;
