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

  test('2. VISUALIZACIÓN: muestra el estado de carga de la pantalla', () => {
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

  test('3. FILTROS: cambio del filtro seleccionado', async () => {
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

  test('4. FILTROS: limpia todos los filtros (clear)', async () => {
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

  test('5. ACTUALIZACIÓN: refresca la lista de las partidas', async () => {
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

  test('6. ESPECTAR: especta una partida como administrador', async () => {
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


  test('7. FINALIZACIÓN: abre la pestaña de finalización forzada de una partida', async () => {
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

  test('8. FINALIZACIÓN: cierra la pestaña de finalización forzada de una partida', async () => {
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

  test('9. FINALIZACIÓN: finaliza una partida con éxito', async () => {
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

  test('10. FINALIZACIÓN: Error de la finalización de una partida', async () => {
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

  test('11. EXPULSIÓN: Abrir la pestaña para expulsar a un jugador', async () => {
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

  test('12. EXPULSIÓN: cierra la pestaña para expulsar a un jugador', async () => {
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

  test('13. EXPULSIÓN: expulsa al jugador con éxito de una partida', async () => {
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

  test('14. EXPULSIÓN: Error al expulsar jugador de una partida', async () => {
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

  test('15. RENDERIZADO: Renderización de las partidas', () => {
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

  test('16. RENDERIZADO: Muestra el estado vacío predeterminado cuando no hay ninguna partida', () => {
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


  test('17. NAVEGACIÓN: Enlace hacia el lobby', () => {
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

  test('18. RENDERIZADO: Muestra la información de la partida en cada caja', async () => {
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