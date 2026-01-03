import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import tokenService from '../../services/token.service';
import useListGames from './hooks/useListGames';
import { toast } from 'react-toastify';
import ListGames from './ListGames';

// Mocks de los correspondientes modulos y hooks //

jest.mock('../../services/token.service');
jest.mock('./hooks/useListGames');
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn()
  },
  ToastContainer: () => null
}));

jest.mock('./components/ListGamesHeader', () => {
  return function ListGamesHeader({ onRefresh }) {
    return (
      <div>
        <div>List Games Header</div>
        <button onClick={onRefresh}>Refresh</button>
      </div>
    );
  };
});

jest.mock('./components/GamesGrid', () => {
  return function GamesGrid({ games, userFriends, onRequestJoin, onRequestSpectator, onSpectate }) {
    return (
      <div>
        <div>Games Grid</div>
        {games.map(game => (
          <div key={game.id}>
            <span>{game.creator}</span>
            <button onClick={() => onRequestJoin(game.id)}>Request Join</button>
            <button onClick={() => onRequestSpectator(game.id)}>Request Spectator</button>
            <button onClick={() => onSpectate(game.id)}>Spectate</button>
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('./components/FiltersPanel', () => {
  return function FiltersPanel({ filters, onFilterChange, onClearFilters, onlyFriend, onToggleFriendFilter }) {
    return (
      <div>
        <div>Filters Panel</div>
        <button onClick={onClearFilters}>Clear Filters</button>
        <button onClick={onToggleFriendFilter}>Toggle Friend Filter</button>
        <input 
          data-testid="filter-input" 
          onChange={(e) => onFilterChange('creator', e.target.value)} 
        />
      </div>
    );
  };
});

const mockNavigate = jest.fn(); // Mock de la función navigate

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('ListGames Component', () => {
  const mockGames = [
    {
      id: 1,
      creator: 'JaviOsuna',
      activePlayers: ['JaviOsuna'],
      maxPlayers: 5,
      private: false,
      gameStatus: 'CREATED',
      chat: 1
    },
    {
      id: 2,
      creator: 'PilarPacheco',
      activePlayers: ['PilarPacheco', 'LauraMartin'],
      maxPlayers: 4,
      private: false,
      gameStatus: 'CREATED',
      chat: 2
    }
  ];

  const mockFriendsList = ['PilarPacheco'];

  const mockUser = {
    username: 'JaviOsuna',
    id: 1
  };

  const mockListGamesData = {
    filteredGames: mockGames,
    friendsList: mockFriendsList,
    filters: { creator: '', maxPlayers: '', gameStatus: 'CREATED' },
    onlyFriend: false,
    loading: false,
    refreshGames: jest.fn(),
    handleSpectator: jest.fn(),
    handleRequestSpectator: jest.fn(),
    handleRequestJoin: jest.fn(),
    handleFilterChange: jest.fn(),
    clearFilters: jest.fn(),
    toggleFriendFilter: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    tokenService.getLocalAccessToken.mockReturnValue('fake-jwt-token');
    tokenService.getUser.mockReturnValue(mockUser);
    useListGames.mockReturnValue(mockListGamesData);
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <ListGames />
      </BrowserRouter>
    );
  };

  test('1. RENDERIZADO: ListGames con todos los componentes', () => {
    renderComponent();
    expect(screen.getByText('List Games Header')).toBeInTheDocument();
    expect(screen.getByText('Games Grid')).toBeInTheDocument();
    expect(screen.getByText('Filters Panel')).toBeInTheDocument();
  });

  test('2. RENDERIZADO: Mostrar estado de carga', () => {
    useListGames.mockReturnValue({
      ...mockListGamesData,
      loading: true
    });

    renderComponent();
    expect(screen.getByText('Loading games...')).toBeInTheDocument();
  });

  test('3. RENDERIZADO: Mostrar lista de juegos', () => {
    renderComponent();
    expect(screen.getByText('JaviOsuna')).toBeInTheDocument();
    expect(screen.getByText('PilarPacheco')).toBeInTheDocument();
  });

  test('4. INTERACCIÓN: Refrescar lista de juegos', () => {
    renderComponent();
    
    const refreshButton = screen.getByText('Refresh');
    fireEvent.click(refreshButton);

    expect(mockListGamesData.refreshGames).toHaveBeenCalled();
  });

  test('5. INTERACCIÓN: Solicitar unirse a un juego', () => {
    renderComponent();
    
    const requestJoinButtons = screen.getAllByText('Request Join');
    fireEvent.click(requestJoinButtons[0]);

    expect(mockListGamesData.handleRequestJoin).toHaveBeenCalledWith(1);
  });

  test('6. INTERACCIÓN: Solicitar ser espectador', () => {
    renderComponent();
    
    const requestSpectatorButtons = screen.getAllByText('Request Spectator');
    fireEvent.click(requestSpectatorButtons[0]);

    expect(mockListGamesData.handleRequestSpectator).toHaveBeenCalledWith(1);
  });

  test('7. INTERACCIÓN: Entrar como espectador', () => {
    renderComponent();
    
    const spectateButtons = screen.getAllByText('Spectate');
    fireEvent.click(spectateButtons[0]);

    expect(mockListGamesData.handleSpectator).toHaveBeenCalledWith(1);
  });

  test('8. FILTROS: Limpiar filtros', () => {
    renderComponent();
    
    const clearFiltersButton = screen.getByText('Clear Filters');
    fireEvent.click(clearFiltersButton);

    expect(mockListGamesData.clearFilters).toHaveBeenCalled();
  });

  test('9. FILTROS: Activar/desactivar filtro de amigos', () => {
    renderComponent();
    
    const toggleFriendButton = screen.getByText('Toggle Friend Filter');
    fireEvent.click(toggleFriendButton);

    expect(mockListGamesData.toggleFriendFilter).toHaveBeenCalled();
  });

  test('10. FILTROS: Cambiar filtro de creador', () => {
    renderComponent();
    
    const filterInput = screen.getByTestId('filter-input');
    fireEvent.change(filterInput, { target: { value: 'JaviOsuna' } });

    expect(mockListGamesData.handleFilterChange).toHaveBeenCalledWith('creator', 'JaviOsuna');
  });

  test('11. RENDERIZADO: Mostrar solo juegos filtrados', () => {
    const filteredGames = [mockGames[0]];
    useListGames.mockReturnValue({
      ...mockListGamesData,
      filteredGames: filteredGames
    });

    renderComponent();
    
    expect(screen.getByText('JaviOsuna')).toBeInTheDocument();
    expect(screen.queryByText('PilarPacheco')).not.toBeInTheDocument();
  });

  test('12. RENDERIZADO: Mostrar filtro de amigos activado', () => {
    useListGames.mockReturnValue({
      ...mockListGamesData,
      onlyFriend: true,
      filteredGames: [mockGames[1]]
    });

    renderComponent();
    
    expect(screen.getByText('PilarPacheco')).toBeInTheDocument();
  });

  test('13. RENDERIZADO: Lista vacía de juegos', () => {
    useListGames.mockReturnValue({
      ...mockListGamesData,
      filteredGames: []
    });

    renderComponent();
    
    expect(screen.getByText('Games Grid')).toBeInTheDocument();
  });

  test('14. INTERACCIÓN: Múltiples solicitudes de unión', () => {
    renderComponent();
    
    const requestJoinButtons = screen.getAllByText('Request Join');
    
    fireEvent.click(requestJoinButtons[0]);
    expect(mockListGamesData.handleRequestJoin).toHaveBeenCalledWith(1);
    
    fireEvent.click(requestJoinButtons[1]);
    expect(mockListGamesData.handleRequestJoin).toHaveBeenCalledWith(2);
  });

  test('15. INTERACCIÓN: Múltiples solicitudes de espectador', () => {
    renderComponent();
    
    const requestSpectatorButtons = screen.getAllByText('Request Spectator');
    
    fireEvent.click(requestSpectatorButtons[0]);
    expect(mockListGamesData.handleRequestSpectator).toHaveBeenCalledWith(1);
    
    fireEvent.click(requestSpectatorButtons[1]);
    expect(mockListGamesData.handleRequestSpectator).toHaveBeenCalledWith(2);
  });

  test('16. RENDERIZADO: Header con función de refresh', () => {
    renderComponent();
    
    expect(screen.getByText('List Games Header')).toBeInTheDocument();
    expect(screen.getByText('Refresh')).toBeInTheDocument();
  });

  test('17. ESTADO: Verificar que los filtros se pasan correctamente', () => {
    const customFilters = { creator: 'Test', maxPlayers: '5', gameStatus: 'ONGOING' };
    useListGames.mockReturnValue({
      ...mockListGamesData,
      filters: customFilters
    });

    renderComponent();
    
    expect(useListGames).toHaveBeenCalled();
  });

  test('18. RENDERIZADO: Componentes se renderizan cuando no hay carga', () => {
    useListGames.mockReturnValue({
      ...mockListGamesData,
      loading: false
    });

    renderComponent();
    
    expect(screen.queryByText('Loading games...')).not.toBeInTheDocument();
    expect(screen.getByText('Games Grid')).toBeInTheDocument();
    expect(screen.getByText('Filters Panel')).toBeInTheDocument();
  });
});
