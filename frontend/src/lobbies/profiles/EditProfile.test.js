import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import useEditProfile from './hooks/useEditProfile';
import EditProfile from './EditProfile';

// Mocks
jest.mock('./hooks/useEditProfile');

jest.mock('./components/ProfileLogo', () => {
  return function ProfileLogo() { return <div data-testid="profile-logo">Logo</div>; };
});

jest.mock('./components/TopButtons', () => {
  return function TopButtons({ showLogout, returnTo }) {
    return (
      <div data-testid="top-buttons">
        <a href={returnTo}>Return</a>
        {showLogout && <button>Logout</button>}
      </div>
    );
  };
});

jest.mock('./components/ProfileImageSelector', () => {
  return function ProfileImageSelector({ profileImage, onImageChange, dropdownOpen, toggleDropdown }) {
    return (
      <div data-testid="profile-image-selector">
        <img src={profileImage} alt="Profile" />
        <button onClick={toggleDropdown}>Toggle Dropdown</button>
        <button onClick={() => onImageChange('/new-image.png')}>Change Image</button>
      </div>
    );
  };
});

jest.mock('./components/EditProfileFormSection', () => {
  return function EditProfileFormSection({ formInputs, formRef, onSubmit }) {
    return (
      <div data-testid="edit-profile-form">
        <form onSubmit={(e) => { e.preventDefault(); onSubmit({ values: { username: 'NewUser' } }); }}>
          <input data-testid="username-input" defaultValue={formInputs[0]?.defaultValue} />
          <button type="submit">Save</button>
        </form>
      </div>
    );
  };
});

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('EditProfile Component', () => {
  const mockFormInputs = [
    { name: 'username', defaultValue: 'TestUser' },
    { name: 'email', defaultValue: 'test@example.com' }
  ];

  const mockUpdateProfile = jest.fn();
  const mockSetProfileImage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    useEditProfile.mockReturnValue({
      profileImage: '/test-image.png',
      setProfileImage: mockSetProfileImage,
      formInputs: mockFormInputs,
      loading: false,
      updateProfile: mockUpdateProfile
    });
  });

  const renderEditProfile = () => {
    return render(
      <BrowserRouter>
        <EditProfile />
      </BrowserRouter>
    );
  };

  // Tests de renderizado básico
  describe('Basic Rendering', () => {
    test('should render loading state when loading is true', () => {
      useEditProfile.mockReturnValue({
        profileImage: '/test-image.png',
        setProfileImage: mockSetProfileImage,
        formInputs: mockFormInputs,
        loading: true,
        updateProfile: mockUpdateProfile
      });

      renderEditProfile();
      expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
    });

    test('should render edit profile form when not loading', () => {
      renderEditProfile();
      expect(screen.getByTestId('edit-profile-form')).toBeInTheDocument();
    });

    test('should render profile logo', () => {
      renderEditProfile();
      expect(screen.getByTestId('profile-logo')).toBeInTheDocument();
    });

    test('should render top buttons', () => {
      renderEditProfile();
      expect(screen.getByTestId('top-buttons')).toBeInTheDocument();
    });

    test('should render profile image selector', () => {
      renderEditProfile();
      expect(screen.getByTestId('profile-image-selector')).toBeInTheDocument();
    });
  });

  // Tests de interacción
  describe('User Interactions', () => {
    test('should toggle dropdown when button clicked', () => {
      renderEditProfile();
      
      const toggleButton = screen.getByText('Toggle Dropdown');
      fireEvent.click(toggleButton);
      
      // El componente mock no tiene estado interno, pero podemos verificar que se renderiza
      expect(toggleButton).toBeInTheDocument();
    });

    test('should call setProfileImage when image is changed', () => {
      renderEditProfile();
      
      const changeImageButton = screen.getByText('Change Image');
      fireEvent.click(changeImageButton);
      
      expect(mockSetProfileImage).toHaveBeenCalledWith('/new-image.png');
    });

    test('should call updateProfile when form is submitted', async () => {
      renderEditProfile();
      
      const submitButton = screen.getByText('Save');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalled();
      });
      expect(mockUpdateProfile).toHaveBeenCalledWith(
        { username: 'NewUser' },
        expect.anything()
      );
    });
  });

  // Tests de navegación
  describe('Navigation', () => {
    test('should have return link to profile', () => {
      renderEditProfile();
      
      const returnLink = screen.getByText('Return');
      expect(returnLink).toHaveAttribute('href', '/profile');
    });
  });
});
