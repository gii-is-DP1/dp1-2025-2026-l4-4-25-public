import { render,screen,waitFor,fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import tokenService from '../../services/token.service';
import useWebSocket from '../../hooks/useWebSocket';
import useLobbyData from './hooks/useLobbyData';
import { useGameData } from '../../game/hooks/useGameData';
import { toast } from 'react-toastify';
import CreateGame from './CreateGame';

// Mocks de los correspondientes modulos y hooks //

jest.mock('../../services/token.service');
jest.mock('../../hooks/useWebSocket');
jest.mock('./hooks/useLobbyData');
jest.mock('../../game/hooks/useGameData');
jest.mock('react-toastify', () => ({toast: {success: jest.fn(), error: jest.fn(), info: jest.fn(), warning: jest.fn()},
  ToastContainer: () => null }));

jest.mock('./components/LobbyInfo', () => {
  return function LobbyInfo() { return <div>Lobby Info</div> }});

jest.mock('./components/JoinRequestsPanel', () => {
  return function JoinRequestsPanel({ joinRequests, onAccept, onDeny }) {
    return (
      <div>
        <div>Join Requests</div>
        {joinRequests.map(res => (
          <div key={res.username}>
            <span>{res.username}</span>
            <button onClick={()=> onAccept(res.username)}>Accept</button>
            <button onClick={()=> onDeny(res.username)}>Deny</button>
          </div>
        ))}
      </div>
    )}});
    
jest.mock('./components/SpectatorRequestsPanel', () => {
  return function SpectatorRequestsPanel({ spectatorRequests, onAccept, onDeny }) {
    return (
      <div>
        <div>Spectator Requests</div>
        {spectatorRequests.map(res => (
          <div key={res.username}>
            <span>{res.username}</span>
            <button onClick={()=> onAccept(res.username)}>Accept</button>
            <button onClick={()=> onDeny(res.username)}>Deny</button>
          </div>
        ))}
      </div>
    )}});

jest.mock('./components/GameSettings', () => {
  return function GameSettings({ isCreator }) {
    return isCreator?<div>Max Players<br/>Privacy</div>: null;
  }});
jest.mock('./components/PlayersListLobby', () => {
  return function PlayersListLobby({ activePlayers, isCreator, onExpelPlayer }) {
    return (
      <div>
        <div>Players</div>
        {activePlayers.map(player => (
          <div key={player}>
            <span>{player}</span>
            {isCreator && <button onClick={() => onExpelPlayer(player)}>Expel</button>}
          </div>
        ))}
      </div>
    )}});

jest.mock('./components/InviteFriends', () => {
  return function InviteFriends() { return <div>Invite Friends</div> }});

jest.mock('./components/LobbyControls', () => {
  return function LobbyControls({ isCreator, onSave, onStart, onCancel, onExitLobby }) {
    return (
      <div>
        {isCreator ? (
          <>
            <button onClick={onSave}>Save Settings</button>
            <button onClick={onStart}>Start Game</button>
            <button onClick={onCancel}>Cancel</button>
          </>
        ):(
          <button onClick={onExitLobby}>Exit Lobby</button>
        )}
      </div>
    )}});

const mockNavigate = jest.fn(); // Mock de la función navigate
const mockLocation = { state: null }; // Mock del location

jest.mock('react-router-dom', () => ({...jest.requireActual('react-router-dom'), useNavigate: () => mockNavigate, useLocation: () => mockLocation}));

describe('CreateGame Component', () => {
  const mockGame = {
    id: 1,
    creator: 'JaviOsuna',
    activePlayers: ['JaviOsuna'],
    maxPlayers: 5,
    private: false,
    gameStatus: 'CREATED',
    chat: 1
  };

  const mockUser = {
    username: 'JaviOsuna',
    id: 1
  };

  const mockLobbyData = {
    game: mockGame,
    setGame: jest.fn(),
    joinRequests: [],
    setJoinRequests: jest.fn(),
    spectatorRequests: [],
    setSpectatorRequests: jest.fn(),
    postFirstMessage: jest.fn(),
    updateGame: jest.fn(),
    deleteGame: jest.fn(),
    sendMessage: jest.fn(),
    deleteMessages: jest.fn(),
    postround: jest.fn(),
    round: null
};

  const mockGameData = {
    patchActivePlayer: jest.fn(),
    fetchActivePlayerByUsername: jest.fn()};

  beforeEach(() => {
    jest.clearAllMocks();
    tokenService.getLocalAccessToken.mockReturnValue('fake-jwt-token');
    tokenService.getUser.mockReturnValue(mockUser);
    useWebSocket.mockReturnValue(null);
    useLobbyData.mockReturnValue(mockLobbyData);
    useGameData.mockReturnValue(mockGameData);
    mockLocation.state = { game: mockGame };
    
    // Mock para ruta: /api/v1/players
    global.fetch = jest.fn(() =>
        Promise.resolve({
        ok: true,
        json: () => Promise.resolve({id: 1, username:'JaviOsuna'})
      }))});

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <CreateGame />
      </BrowserRouter>
    )};

  test('1. RENDERIZADO: CreateGame con todo el game info', () => {
    renderComponent();
    expect(screen.getByText('Lobby Info')).toBeInTheDocument();
    expect(screen.getByText('Join Requests')).toBeInTheDocument();
    expect(screen.getByText('Save Settings')).toBeInTheDocument()});

  test('2. RENDERIZADO: mostrar el panel de solicitudes de unión (CREADOR)', () => {
    const joinRequest = { username:'PilarPacheco', messageId: 1 };
    useLobbyData.mockReturnValue({...mockLobbyData, joinRequests: [joinRequest]});

    renderComponent();
    expect(screen.getByText(/join requests/i)).toBeInTheDocument()});

  test('3. RENDERIZADO: mostrar la configuración del juego (SOLO CREADOR)', () => {
    renderComponent();
    expect(screen.getByText(/max players/i)).toBeInTheDocument();
    expect(screen.getByText(/privacy/i)).toBeInTheDocument()});

  test('4. SOLICITUDES: aceptar la solicitud de unión (SOLO CREADOR)', async () => {
    const joinRequest = { username:'PilarPacheco', messageId: 1 };
    mockLobbyData.updateGame.mockResolvedValue({...mockGame, activePlayers: ['JaviOsuna','PilarPacheco']});

    useLobbyData.mockReturnValue({...mockLobbyData, joinRequests: [joinRequest]});
    renderComponent();

    const acceptButtons = screen.getAllByText(/accept/i);
    fireEvent.click(acceptButtons[0]);

    await waitFor(() => {
      expect(mockLobbyData.updateGame).toHaveBeenCalledWith({
        activePlayers: ['JaviOsuna','PilarPacheco']});
    });
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('PilarPacheco'));
  });

  test('5. SOLICITUDES: rechazo de la solicitud de unión a la partida (SOLO CREADOR)', async () => {
    const joinRequest = { username:'PilarPacheco', messageId: 1 };
    
    useLobbyData.mockReturnValue({...mockLobbyData, joinRequests: [joinRequest]});
    renderComponent();

    const denyButtons = screen.getAllByText(/deny/i);
    fireEvent.click(denyButtons[0]);

    await waitFor(() => {
      expect(mockLobbyData.sendMessage).toHaveBeenCalled();
    });
    expect(toast.info).toHaveBeenCalledWith(expect.stringContaining('denied'))});

  test('6. CONFIGURACIÓN DE LA PARTIDA: Actualización de la configuración del juego', async () => {
    mockLobbyData.updateGame.mockResolvedValue(mockGame);
    renderComponent();

    const saveButton = screen.getByText(/save settings/i);
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockLobbyData.updateGame).toHaveBeenCalled();
    });
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('updated'))});

  test('7. INICIO DE LA PARTIDA: manejo del inicio del juego', async () => {
    const mockRound = { id: 1, board: 1 };
    mockLobbyData.postround.mockResolvedValue(mockRound);
    mockLobbyData.updateGame.mockResolvedValue({ ...mockGame, gameStatus: 'ONGOING' });
    mockGameData.fetchActivePlayerByUsername.mockResolvedValue({ id: 1 });
    mockGameData.patchActivePlayer.mockResolvedValue({});

    renderComponent();

    const startButton = screen.getByText(/start game/i);
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockLobbyData.postround).toHaveBeenCalledWith(1, 1);
    });
    expect(mockLobbyData.updateGame).toHaveBeenCalledWith({gameStatus: 'ONGOING'});
    expect(toast.success).toHaveBeenCalledWith('Game started successfully!')});

  test('8. CANCELAR UNA PARTIDA', async () => {
    mockLobbyData.deleteGame.mockResolvedValue();
    renderComponent();

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockLobbyData.deleteGame).toHaveBeenCalled();
    });
    expect(mockNavigate).toHaveBeenCalledWith('/lobby')});

  test('9. EXPULSAR A UN JUGADOR', async () => {
    const gameWithPlayers = {...mockGame, activePlayers: ['javiOsuna', 'PilarPacheco']};
    
    mockLocation.state = { game: gameWithPlayers };
    useLobbyData.mockReturnValue({...mockLobbyData, game: gameWithPlayers});
    mockLobbyData.updateGame.mockResolvedValue({...gameWithPlayers, activePlayers: ['JaviOsuna']});
    renderComponent();

    const expelButtons = screen.getAllByText(/expel/i);
    expect(expelButtons.length).toBeGreaterThan(0);
    fireEvent.click(expelButtons[0]);
    await waitFor(() => {
      expect(mockLobbyData.updateGame).toHaveBeenCalled()});
  });

  test('10. SALIR AL LOBBY (PARA JUGADORES)', async () => {
    const nonCreatorUser = { username: 'PilarPacheco', id: 2 };
    tokenService.getUser.mockReturnValue(nonCreatorUser);
    const gameWithPlayers = {...mockGame, activePlayers: ['JaviOsuna', 'PilarPacheco']};

    mockLocation.state = { game: gameWithPlayers };
    useLobbyData.mockReturnValue({...mockLobbyData, game: gameWithPlayers});
    mockLobbyData.updateGame.mockResolvedValue({ ...gameWithPlayers, activePlayers: ['JaviOsuna']});
    renderComponent();

    const exitButton = screen.getByText(/exit lobby/i);
    fireEvent.click(exitButton);

    await waitFor(() => {
      expect(mockLobbyData.updateGame).toHaveBeenCalledWith({
        activePlayers: ['JaviOsuna']});
    });
    expect(mockNavigate).toHaveBeenCalledWith('/lobby');
  });

  test('11. MENSAJE WEBSOCKET: Mensaje sobre la actualización del juego', async () => {
    const updatedGame = { ...mockGame, maxPlayers: 7 };
    const socketMessage = { game: updatedGame };
    useWebSocket.mockReturnValue(socketMessage);
    renderComponent();

    await waitFor(() => {
      expect(useLobbyData).toHaveBeenCalled()});
  });

  test('12. MENSAJE WEBSOCKET: Mensaje sobre el inicio del juego', async () => {
    const mockRound = { id: 1, board: 1 };
    const socketMessage = {game: {...mockGame, gameStatus: 'ONGOING'}, round: mockRound};
    useWebSocket.mockReturnValue(socketMessage);
    renderComponent();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`/board/${mockRound.board}`, {
        state: { game: socketMessage.game, round: mockRound}})});
  });

  test('13. ADMINISTRADOR: Forzar finalizar una partida', async () => {
    const adminMsg = {adminAction: {action: 'FORCE_FINISH', reason:'Test reason'}};
    useWebSocket.mockReturnValue(adminMsg);
    renderComponent();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Admin has deleted'))});
  });

  test('14. ADMINISTRADOR: Expulsar a un jugador', async () => {
    const adminMsg = {adminAction: { action: 'PLAYER_EXPELLED', affectedPlayer: 'testuser', reason: 'Test reason'}};
    useWebSocket.mockReturnValue(adminMsg);
    renderComponent();

    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalledWith(expect.stringContaining('expelled'))});
  });

  test('15. ACEPTAR SOLICITUD DE ESPECTADOR (CREADOR)', async () => {
    const spectatorReq = { username: 'LauraMartin', messageId: 2 };
    useLobbyData.mockReturnValue({...mockLobbyData, spectatorRequests: [spectatorReq]});
    renderComponent();
    const acceptButtons = screen.getAllByText(/accept/i);
    expect(acceptButtons.length).toBeGreaterThan(0);
    fireEvent.click(acceptButtons[0]);

    await waitFor(() => {
      expect(mockLobbyData.sendMessage).toHaveBeenCalled();
    });
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('spectator'));
  });

  test('16. DENEGAR SOLICITUD DE ESPECTADOR (CREADOR)', async () => {
    const spectatorReq = { username: 'LauraMartin', messageId: 2 };
    useLobbyData.mockReturnValue({...mockLobbyData, spectatorRequests: [spectatorReq]});
    renderComponent();
    const denyButtons = screen.getAllByText(/deny/i);
    expect(denyButtons.length).toBeGreaterThan(1);
    fireEvent.click(denyButtons[1]);

    await waitFor(() => {
      expect(mockLobbyData.sendMessage).toHaveBeenCalled();
    });
    expect(toast.info).toHaveBeenCalledWith(expect.stringContaining('denied'));
  });

  test('17. VISTA DEL JUGADOR: Player no puede ver los controles/paneles/botones si no es Creador', () => {
    const nonCreatorUser = { username:'PilarPacheco', id: 2 };
    tokenService.getUser.mockReturnValue(nonCreatorUser);
    renderComponent();

    expect(screen.queryByText(/save settings/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/cancel/i)).not.toBeInTheDocument()});

  test('18. EXPULSIÓN DE JUGADOR: Monitoreo de la expulsión de un jugador', async () => {
    const nonCreatorUser = { username:'PilarPacheco', id: 2 };
    tokenService.getUser.mockReturnValue(nonCreatorUser);

    const gameWithPlayer = {...mockGame, activePlayers: ['JaviOsuna', 'PilarPacheco']};
    mockLocation.state = { game: gameWithPlayer };
    const { rerender } = renderComponent();

    const gameAfterExpulsion = {...mockGame, activePlayers: ['JaviOsuna']};
    useLobbyData.mockReturnValue({...mockLobbyData, game: gameAfterExpulsion});

    rerender(
      <BrowserRouter>
        <CreateGame />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You have been expelled from the game');
    });
    expect(mockNavigate).toHaveBeenCalledWith('/lobby');
  });
});