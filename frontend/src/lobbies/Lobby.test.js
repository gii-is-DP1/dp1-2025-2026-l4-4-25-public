import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import useLobbyUser from './hooks/useLobbyUser';
import Lobby from './lobby';

// Mocks
jest.mock('./hooks/useLobbyUser');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
    warn: jest.fn()
  },
  ToastContainer: () => null
}));

jest.mock('./components/Logo', () => {
  return function Logo() { return <div data-testid="logo">Logo</div>; };
});

jest.mock('./components/TopRightButtons', () => {
  return function TopRightButtons({ isAdmin, showFriends, onToggleFriends, friends }) {
    return (
      <div data-testid="top-right-buttons">
        <button onClick={onToggleFriends} data-testid="toggle-friends">
          {showFriends ? 'Hide Friends' : 'Show Friends'}
        </button>
        {showFriends && friends.map(f => <span key={f}>{f}</span>)}
      </div>
    );
  };
});

jest.mock('./components/InfoButton', () => {
  return function InfoButton() { return <button data-testid="info-button">Info</button>; };
});

jest.mock('./components/PlayerActions', () => {
  return function PlayerActions({ onCreateGame }) {
    return (
      <div data-testid="player-actions">
        <button onClick={onCreateGame} data-testid="create-game-button">Create Game</button>
        <a href="/ListGames" data-testid="list-games-link">Join Game</a>
      </div>
    );
  };
});

jest.mock('./components/AdminActions', () => {
  return function AdminActions() {
    return (
      <div data-testid="admin-actions">
        <a href="/users">Manage Users</a>
        <a href="/admin/games">Manage Games</a>
      </div>
    );
  };
});

jest.mock('./components/RankingButton', () => {
  return function RankingButton() { return <a href="/ranking" data-testid="ranking-button">Ranking</a>; };
});

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Lobby Component', () => {
  const mockPlayer = {
    id: 1,
    username: 'TestUser'
  };

  const mockFriends = ['Friend1', 'Friend2'];

  beforeEach(() => {
    jest.clearAllMocks();
    
    useLobbyUser.mockReturnValue({
      isAdmin: false,
      player: mockPlayer,
      friends: mockFriends,
      jwt: 'mock-jwt-token'
    });

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderLobby = () => {
    return render(
      <BrowserRouter>
        <Lobby />
      </BrowserRouter>
    );
  };

  // Tests de renderizado básico
  describe('Basic Rendering', () => {
    test('should render logo', () => {
      renderLobby();
      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    test('should render top right buttons', () => {
      renderLobby();
      expect(screen.getByTestId('top-right-buttons')).toBeInTheDocument();
    });

    test('should render info button', () => {
      renderLobby();
      expect(screen.getByTestId('info-button')).toBeInTheDocument();
    });

    test('should render ranking button', () => {
      renderLobby();
      expect(screen.getByTestId('ranking-button')).toBeInTheDocument();
    });
  });

  // Tests para player
  describe('Player View', () => {
    test('should render player actions for non-admin users', () => {
      renderLobby();
      expect(screen.getByTestId('player-actions')).toBeInTheDocument();
    });

    test('should not render admin actions for non-admin users', () => {
      renderLobby();
      expect(screen.queryByTestId('admin-actions')).not.toBeInTheDocument();
    });

    test('should render create game button', () => {
      renderLobby();
      expect(screen.getByTestId('create-game-button')).toBeInTheDocument();
    });

    test('should render list games link', () => {
      renderLobby();
      expect(screen.getByTestId('list-games-link')).toBeInTheDocument();
    });
  });

  // Tests para admin
  describe('Admin View', () => {
    beforeEach(() => {
      useLobbyUser.mockReturnValue({
        isAdmin: true,
        player: mockPlayer,
        friends: mockFriends,
        jwt: 'mock-jwt-token'
      });
    });

    test('should render admin actions for admin users', () => {
      renderLobby();
      expect(screen.getByTestId('admin-actions')).toBeInTheDocument();
    });

    test('should not render player actions for admin users', () => {
      renderLobby();
      expect(screen.queryByTestId('player-actions')).not.toBeInTheDocument();
    });
  });

  // Tests de creación de partida
  describe('Create Game', () => {
    test('should call fetch when create game button is clicked', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 1, creator: 'TestUser' })
      });

      renderLobby();
      
      const createButton = screen.getByTestId('create-game-button');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/v1/games', expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer mock-jwt-token'
          })
        }));
      });
    });

    test('should show success toast and navigate on successful game creation', async () => {
      const newGame = { id: 123, creator: 'TestUser' };
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(newGame)
      });

      renderLobby();
      
      const createButton = screen.getByTestId('create-game-button');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('¡Partida creada con éxito!');
      });
      expect(mockNavigate).toHaveBeenCalledWith('/CreateGame/123', { state: { game: newGame } });
    });

    test('should show warning toast on failed game creation', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Error creating game' })
      });

      renderLobby();
      
      const createButton = screen.getByTestId('create-game-button');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(toast.warn).toHaveBeenCalledWith('Error al crear la partida: Error creating game');
      });
    });

    test('should show error toast on network error', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderLobby();
      
      const createButton = screen.getByTestId('create-game-button');
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error de red. No se pudo conectar con el servidor.');
      });
    });
  });

  // Tests de amigos
  describe('Friends Toggle', () => {
    test('should toggle friends visibility when button clicked', () => {
      renderLobby();
      
      const toggleButton = screen.getByTestId('toggle-friends');
      expect(toggleButton).toHaveTextContent('Show Friends');
      
      fireEvent.click(toggleButton);
      
      expect(toggleButton).toHaveTextContent('Hide Friends');
    });

    test('should show friends list when toggled', () => {
      renderLobby();
      
      const toggleButton = screen.getByTestId('toggle-friends');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Friend1')).toBeInTheDocument();
    });

    test('should show all friends in list when toggled', () => {
      renderLobby();
      
      const toggleButton = screen.getByTestId('toggle-friends');
      fireEvent.click(toggleButton);
      
      expect(screen.getByText('Friend2')).toBeInTheDocument();
    });
  });

  // Tests de navegación
  describe('Navigation', () => {
    test('should have link to ranking', () => {
      renderLobby();
      
      const rankingLink = screen.getByTestId('ranking-button');
      expect(rankingLink).toHaveAttribute('href', '/ranking');
    });

    test('should have link to list games', () => {
      renderLobby();
      
      const listGamesLink = screen.getByTestId('list-games-link');
      expect(listGamesLink).toHaveAttribute('href', '/ListGames');
    });
  });
});
