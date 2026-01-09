import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import tokenService from '../../services/token.service';
import { toast } from 'react-toastify';
import AdminGames from './AdminGames';
import useAdminGames from './hooks/useAdminGames';
import { BrowserRouter } from 'react-router-dom';

// Mocks de los correspondientes modulos y dependencias //

jest.mock('./hooks/useAdminGames');
jest.mock('../../services/token.service');
jest.mock('react-toastify', () => ({toast: {success: jest.fn(), error: jest.fn()}}));
jest.mock('./components/AdminGamesFilters', () => {
  return function MockAdminGamesFilters({ filters, allUsers, onFilterChange, onClearFilters }) {
    return (
      <div data-testid="admin-games-filters">
        <button onClick={() => onFilterChange('status', 'ACTIVE')}>Change Status Filter</button>
        <button onClick={onClearFilters}>Clear Filters</button>
      </div>
    )}});

jest.mock('./components/UnifiedGamesGrid', () => {
  return function MockUnifiedGamesGrid({ games, onSpectate, onForceFinish, onExpelPlayer }) {
    return (
      <div data-testid="unified-games-grid">
        {games.length === 0 ? (
          <p>No games found</p>
        ):(
          games.map((game) => (
            <div key={game.id} data-testid={`game-${game.id}`}>
              <span>Game #{game.id}</span>
              <button onClick={() => onSpectate(game.id)}>Spectate</button>
              <button onClick={() => onForceFinish(game)}>Force Finish</button>
              <button onClick={() => onExpelPlayer(game)}>Expel Player</button>
            </div>
          )))}
      </div>
    )}});

jest.mock('./components/ForceFinishModal', () => {
  return function MockForceFinishModal({ game, onClose, onConfirm }) {
    return (
      <div data-testid="force-finish-modal">
        <h2>Force Finish Game #{game.id}</h2>
        <p>Game Code: {game.code}</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={() => onConfirm(game.id, 'Test reason')}>Confirm</button>
      </div>
    )}});

jest.mock('./components/ExpelPlayerModal', () => {
  return function MockExpelPlayerModal({ game, onClose, onConfirm }) {
    return (
      <div data-testid="expel-player-modal">
        <h2>Expel Player from Game #{game.id}</h2>
        <p>Game Code: {game.code}</p>
        <button onClick={onClose}>Cancel</button>
        <button onClick={() => onConfirm(game.id, 'testuser', 'Test reason')}>Confirm</button>
      </div>
    )}});

const mockGames = [ { id: 1, code: 'GAME001', status: 'ACTIVE', players: [{ username: 'JaviOsuna' }, { username: 'PilarPacheco' }]},
  { id: 2, code: 'GAME002', status: 'FINISHED', players: [{ username: 'GonzaloBengoa' }]}];

const mockUsers = [{ id: 1, username: 'JaviOsuna' }, { id: 2, username: 'PilarPacheco' }, { id: 3, username: 'GonzaloBengoa' }];

describe('AdminGames', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    tokenService.getLocalAccessToken.mockReturnValue('mock-token');
    global.fetch = jest.fn()});

  afterEach(() => {
    jest.restoreAllMocks()});

  test('1. RENDERIZADO: Dashboard con los filtros', () => {
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status: '', creator: '', player: ''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    expect(screen.getByText('🎮 Game Management Dashboard')).toBeInTheDocument();
    expect(screen.getByTestId('admin-games-filters')).toBeInTheDocument();
    expect(screen.getByTestId('unified-games-grid')).toBeInTheDocument();
  });

  test('2. VIEW: shows the loading state', () => {
    useAdminGames.mockReturnValue({
      filteredGames: [],
      allUsers: [],
      filters: { status:'', creator:'', player:''},
      loading: true,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    expect(screen.getByText('Loading games data...')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-games-filters')).not.toBeInTheDocument();
  });

  test('3. FILTERS: change the selected filter', async () => {
    const handleFilterChange = jest.fn();
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'', creator:'', player:''},
      loading: false,
      handleFilterChange,
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const changeFilterButton = screen.getByText('Change Status Filter');
    await user.click(changeFilterButton);
    expect(handleFilterChange).toHaveBeenCalledWith('status', 'ACTIVE');
  });

  test('4. FILTERS: clears all filters (clear)', async () => {
    const clearFilters = jest.fn();
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'ACTIVE', creator:'', player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters,
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const clearButton = screen.getByText('Clear Filters');
    await user.click(clearButton);
    expect(clearFilters).toHaveBeenCalled();
  });

  test('5. UPDATE: refreshes the games list', async () => {
    const refreshGames = jest.fn();
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'', creator:'', player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames,
      handleSpectate: jest.fn()});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const refreshButton = screen.getByText('🔁');
    await user.click(refreshButton);
    expect(refreshGames).toHaveBeenCalled();
  });

  test('6. SPECTATE: spectate a game as admin', async () => {
    const handleSpectate = jest.fn();
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'', creator:'', player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const spectateButton = screen.getAllByText('Spectate')[0];
    await user.click(spectateButton);
    expect(handleSpectate).toHaveBeenCalledWith(1);
  });


  test('7. FINISH: opens the force-finish tab for a game', async () => {
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'', creator:'', player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const forceFinishButton = screen.getAllByText('Force Finish')[0];
    await user.click(forceFinishButton);
    await waitFor(() => {
      expect(screen.getByTestId('force-finish-modal')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Force Finish Game #1')).toBeInTheDocument();
    });
  });

  test('8. FINISH: closes the force-finish tab for a game', async () => {
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'', creator:'', player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const forceFinishBttn = screen.getAllByText('Force Finish')[0];
    await user.click(forceFinishBttn);
    expect(screen.getByTestId('force-finish-modal')).toBeInTheDocument();
    const cancelBttn = screen.getByText('Cancel');
    await user.click(cancelBttn);

    await waitFor(() => {
      expect(screen.queryByTestId('force-finish-modal')).not.toBeInTheDocument()});
  });

  test('9. FINISH: successfully force-finishes a game', async () => {
    const refreshGames = jest.fn();
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'', creator:'', player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames,
      handleSpectate: jest.fn()});
    global.fetch.mockResolvedValueOnce({ok: true, json: async () => ({})});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const forceFinishButton = screen.getAllByText('Force Finish')[0];
    await user.click(forceFinishButton);
    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Game #1 has been force-finished. Players have been notified.');
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/admin/games/1/force-finish', expect.objectContaining({
      method: 'POST', 
      headers: expect.objectContaining({'Authorization': 'Bearer mock-token', 'Content-Type': 'application/json'})}));
    expect(refreshGames).toHaveBeenCalled();
  });

  test('10. FINISH: force-finish game error', async () => {
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'',creator:'',player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});
    global.fetch.mockResolvedValueOnce({ok: false, status: 500});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const forceFinishButton = screen.getAllByText('Force Finish')[0];
    await user.click(forceFinishButton);
    const confirmButton = screen.getByText('Confirm');
    await user.click(confirmButton);

    await waitFor(() => {expect(toast.error).toHaveBeenCalledWith('Failed to force-finish game. Please try again.')});
  });

  test('11. EXPULSION: Open the tab to expel a player', async () => {
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'',creator:'',player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const expelButton = screen.getAllByText('Expel Player')[0];
    await user.click(expelButton);
    await waitFor(() => {
      expect(screen.getByTestId('expel-player-modal')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByText('Expel Player from Game #1')).toBeInTheDocument();
    });
  });

  test('12. EXPULSION: Close the tab to expel a player', async () => {
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'',creator:'',player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const expelButton = screen.getAllByText('Expel Player')[0];
    await user.click(expelButton);
    expect(screen.getByTestId('expel-player-modal')).toBeInTheDocument();
    const cancelButton = screen.getAllByText('Cancel')[0];
    await user.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('expel-player-modal')).not.toBeInTheDocument();});
  });

  test('13. EXPULSION: successfully expels a player from a game', async () => {
    const refreshGames = jest.fn();
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'',creator:'',player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames,
      handleSpectate: jest.fn()});
    global.fetch.mockResolvedValueOnce({ok: true, json: async () => ({})});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const expelButton = screen.getAllByText('Expel Player')[0];
    await user.click(expelButton);
    const confirmButton = screen.getAllByText('Confirm')[0];
    await user.click(confirmButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Player testuser has been expelled from game #1.');
    });
    expect(global.fetch).toHaveBeenCalledWith('/api/v1/admin/games/1/expel-player',expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({'Authorization': 'Bearer mock-token', 'Content-Type': 'application/json'})}));
    expect(refreshGames).toHaveBeenCalled();
  });

  test('14. EXPULSION: expel player error', async () => {
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'',creator:'',player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});
    global.fetch.mockResolvedValueOnce({ok: false, status: 500});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const expelButton = screen.getAllByText('Expel Player')[0];
    await user.click(expelButton);
    const confirmButton = screen.getAllByText('Confirm')[0];
    await user.click(confirmButton);

    await waitFor(() => {expect(toast.error).toHaveBeenCalledWith('Failed to expel player. Please try again.')});
  });

  test('15. RENDER: Renders games', () => {
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'',creator:'',player:''},  
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    expect(screen.getByTestId('game-1')).toBeInTheDocument();
    expect(screen.getByTestId('game-2')).toBeInTheDocument();
    expect(screen.getByText('Game #1')).toBeInTheDocument();
    expect(screen.getByText('Game #2')).toBeInTheDocument();
  });

  test('16. RENDER: Shows the default empty state when there are no games', () => {
    useAdminGames.mockReturnValue({
      filteredGames: [],
      allUsers: mockUsers,
      filters: {status:'',creator:'',player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    expect(screen.getByText('No games found')).toBeInTheDocument();
  });


  test('17. NAVIGATION: Link to the lobby', () => {
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'',creator:'',player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const lobbyLink = screen.getByRole('link',{ name:'➡️'});
    expect(lobbyLink).toBeInTheDocument();
    expect(lobbyLink).toHaveAttribute('href','/lobby');
  });

  test('18. RENDER: Shows game information in each card', async () => {
    useAdminGames.mockReturnValue({
      filteredGames: mockGames,
      allUsers: mockUsers,
      filters: {status:'',creator:'',player:''},
      loading: false,
      handleFilterChange: jest.fn(),
      clearFilters: jest.fn(),
      refreshGames: jest.fn(),
      handleSpectate: jest.fn()});

    const user = userEvent.setup();
    render(
      <BrowserRouter>
        <AdminGames />
      </BrowserRouter>
    );

    const forceFinishButton = screen.getAllByText('Force Finish')[0];
    await user.click(forceFinishButton);

    await waitFor(() => {
      expect(screen.getByText('Game Code: GAME001')).toBeInTheDocument();
    });
  });

});