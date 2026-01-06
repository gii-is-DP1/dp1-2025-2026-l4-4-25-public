import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import tokenService from '../../services/token.service';
import useAchievementsData from './hooks/useAchievementsData';
import Profile from './profile';

// Mocks
jest.mock('../../services/token.service');
jest.mock('./hooks/useAchievementsData');

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Profile Component', () => {
  const mockProfile = {
    id: 1,
    username: 'TestUser',
    email: 'test@example.com',
    birthdate: '1990-01-01',
    image: '/test-image.png',
    status: 'ACTIVE',
    joined: '2024-01-01',
    authority: { authority: 'PLAYER' }
  };

  const mockAchievements = [
    { id: 1, tittle: 'First Win', description: 'Win your first game', unlocked: true, progress: '1/1' },
    { id: 2, tittle: 'Veteran', description: 'Play 10 games', unlocked: false, progress: '5/10' },
    { id: 3, tittle: 'Gold Digger', description: 'Find 50 gold nuggets', unlocked: false, progress: '20/50' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    tokenService.getLocalAccessToken.mockReturnValue('mock-jwt-token');
    tokenService.getUser.mockReturnValue({ id: 1, username: 'TestUser' });
    
    useAchievementsData.mockReturnValue({
      achievements: mockAchievements,
      loading: false
    });

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockProfile)
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderProfile = () => {
    return render(
      <BrowserRouter>
        <Profile />
      </BrowserRouter>
    );
  };

  // Tests de renderizado básico
  describe('Basic Rendering', () => {
    test('should render loading state initially', () => {
      tokenService.getUser.mockReturnValue(null);
      renderProfile();
      expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
    });

    test('should render profile data after fetch', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByText('TestUser')).toBeInTheDocument();
      });
    });

    test('should render logout button', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/Log Out/i)).toBeInTheDocument();
      });
    });

    test('should render edit profile button for players', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/Edit Profile/i)).toBeInTheDocument();
      });
    });
  });

  // Tests de achievements
  describe('Achievements Section', () => {
    test('should render achievements section for players', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/Achievements/i)).toBeInTheDocument();
      });
    });

    test('should display unlocked achievements correctly', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByText('First Win')).toBeInTheDocument();
      });
    });

    test('should show loading achievements message when loading', async () => {
      useAchievementsData.mockReturnValue({
        achievements: [],
        loading: true
      });

      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/Loading achievements.../i)).toBeInTheDocument();
      });
    });
  });

  // Tests para admin
  describe('Admin View', () => {
    beforeEach(() => {
      const adminToken = btoa(JSON.stringify({ authorities: ['ADMIN'] }));
      tokenService.getLocalAccessToken.mockReturnValue(`header.${adminToken}.signature`);
    });

    test('should show admin badge for admin users', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/ADMIN/i)).toBeInTheDocument();
      });
    });

    test('should not show Games Played button for admin', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.queryByText(/Games Played/i)).not.toBeInTheDocument();
      });
    });
  });

  // Tests de navegación
  describe('Navigation', () => {
    test('should have link to edit profile', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Edit Profile/i })).toHaveAttribute('href', '/profile/editProfile');
      });
    });

    test('should have link to logout', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: /Log Out/i })).toHaveAttribute('href', '/logout');
      });
    });

    test('should have link to lobby', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByRole('link', { name: '➡️' })).toHaveAttribute('href', '/lobby');
      });
    });
  });

  // Tests de fetch
  describe('Data Fetching', () => {
    test('should fetch user profile on mount', async () => {
      renderProfile();
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/users/1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json'
          })
        })
      );
    });

    test('should handle fetch error gracefully', async () => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404
        })
      );

      renderProfile();
      
      await waitFor(() => {
        expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
      });
    });
  });
});
