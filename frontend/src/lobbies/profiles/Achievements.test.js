import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import useAchievementsData from './hooks/useAchievementsData';
import Achievements from './Achievements';

// Mocks
jest.mock('./hooks/useAchievementsData');

jest.mock('./components/ProfileLogo', () => {
  return function ProfileLogo() { return <div data-testid="profile-logo">Logo</div>; };
});

jest.mock('./components/TopButtons', () => {
  return function TopButtons({ returnTo }) {
    return (
      <div data-testid="top-buttons">
        <a href={returnTo} data-testid="return-link">Return</a>
      </div>
    );
  };
});

jest.mock('./components/AchievementsList', () => {
  return function AchievementsList({ achievements, username, profileImage }) {
    return (
      <div data-testid="achievements-list">
        <span data-testid="username">{username}</span>
        {achievements.map(ach => (
          <div key={ach.id} data-testid={`achievement-${ach.id}`}>
            <span>{ach.tittle}</span>
            <span>{ach.unlocked ? 'Unlocked' : 'Locked'}</span>
          </div>
        ))}
      </div>
    );
  };
});

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Achievements Component', () => {
  const mockAchievements = [
    { id: 1, tittle: 'First Win', description: 'Win your first game', unlocked: true, progress: '1/1' },
    { id: 2, tittle: 'Veteran', description: 'Play 10 games', unlocked: false, progress: '5/10' },
    { id: 3, tittle: 'Gold Digger', description: 'Find 50 gold nuggets', unlocked: true, progress: '50/50' }
  ];

  const mockProfile = {
    id: 1,
    username: 'TestUser',
    image: '/test-image.png'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    useAchievementsData.mockReturnValue({
      achievements: mockAchievements,
      profile: mockProfile,
      loading: false,
      error: null,
      isAdmin: false
    });
  });

  const renderAchievements = () => {
    return render(
      <BrowserRouter>
        <Achievements />
      </BrowserRouter>
    );
  };

  // Tests de renderizado básico
  describe('Basic Rendering', () => {
    test('should render loading state when loading and no profile', () => {
      useAchievementsData.mockReturnValue({
        achievements: [],
        profile: null,
        loading: true,
        error: null,
        isAdmin: false
      });

      renderAchievements();
      expect(screen.getByText(/Loading profile.../i)).toBeInTheDocument();
    });

    test('should render error state when there is an error', () => {
      useAchievementsData.mockReturnValue({
        achievements: [],
        profile: mockProfile,
        loading: false,
        error: 'Network error',
        isAdmin: false
      });

      renderAchievements();
      expect(screen.getByText(/Error loading data: Network error/i)).toBeInTheDocument();
    });

    test('should render achievements list when data is loaded', () => {
      renderAchievements();
      expect(screen.getByTestId('achievements-list')).toBeInTheDocument();
    });

    test('should render profile logo', () => {
      renderAchievements();
      expect(screen.getByTestId('profile-logo')).toBeInTheDocument();
    });

    test('should render top buttons', () => {
      renderAchievements();
      expect(screen.getByTestId('top-buttons')).toBeInTheDocument();
    });
  });

  // Tests de achievements
  describe('Achievements Display', () => {
    test('should display first achievement', () => {
      renderAchievements();
      expect(screen.getByTestId('achievement-1')).toBeInTheDocument();
    });

    test('should display second achievement', () => {
      renderAchievements();
      expect(screen.getByTestId('achievement-2')).toBeInTheDocument();
    });

    test('should display third achievement', () => {
      renderAchievements();
      expect(screen.getByTestId('achievement-3')).toBeInTheDocument();
    });

    test('should display username', () => {
      renderAchievements();
      expect(screen.getByTestId('username')).toHaveTextContent('TestUser');
    });

    test('should show unlocked status for unlocked achievements', () => {
      renderAchievements();
      
      const firstWin = screen.getByTestId('achievement-1');
      expect(firstWin).toHaveTextContent('Unlocked');
    });

    test('should show locked status for locked achievements', () => {
      renderAchievements();
      
      const veteran = screen.getByTestId('achievement-2');
      expect(veteran).toHaveTextContent('Locked');
    });
  });

  // Tests para admin
  describe('Admin View', () => {
    beforeEach(() => {
      useAchievementsData.mockReturnValue({
        achievements: mockAchievements,
        profile: mockProfile,
        loading: false,
        error: null,
        isAdmin: true
      });
    });

    test('should show admin badge for admin users', () => {
      renderAchievements();
      expect(screen.getByText(/ADMIN/i)).toBeInTheDocument();
    });

    test('should show edit achievements button for admin', () => {
      renderAchievements();
      expect(screen.getByText(/EDIT ACHIEVEMENTS/i)).toBeInTheDocument();
    });

    test('should navigate to edit achievements when button clicked', () => {
      renderAchievements();
      
      const editButton = screen.getByText(/EDIT ACHIEVEMENTS/i);
      fireEvent.click(editButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/achievements/admin', { state: { from: '/achievements' } });
    });

    test('should return to lobby for admin users', () => {
      renderAchievements();
      
      const returnLink = screen.getByTestId('return-link');
      expect(returnLink).toHaveAttribute('href', '/lobby');
    });
  });

  // Tests para player
  describe('Player View', () => {
    test('should not show admin badge for player users', () => {
      renderAchievements();
      expect(screen.queryByText(/⭐ ADMIN/i)).not.toBeInTheDocument();
    });

    test('should not show edit achievements button for player', () => {
      renderAchievements();
      expect(screen.queryByText(/EDIT ACHIEVEMENTS/i)).not.toBeInTheDocument();
    });

    test('should return to profile for player users', () => {
      renderAchievements();
      
      const returnLink = screen.getByTestId('return-link');
      expect(returnLink).toHaveAttribute('href', '/profile');
    });
  });
});
