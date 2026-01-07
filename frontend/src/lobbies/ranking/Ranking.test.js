import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Ranking from './Ranking';
import tokenService from '../../services/token.service';

jest.mock('../../services/token.service');

const mockUser = { username: 'MineroPro' };

describe('Ranking Component Tests', () => {
    const mockPlayersData = [
        { id: 1, username: 'MineroPro', wonGames: 10, playedGames: 20, acquiredGoldNuggets: 30, builtPaths: 5, destroyedPaths: 1, image: null },
        { id: 2, username: 'SaboteadorX', wonGames: 5, playedGames: 15, acquiredGoldNuggets: 10, builtPaths: 2, destroyedPaths: 8, image: null },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        tokenService.getUser.mockReturnValue(mockUser);
        tokenService.getLocalAccessToken.mockReturnValue('mock-jwt-token');
        global.fetch = jest.fn();
    });

    const renderRanking = () => render(
        <BrowserRouter>
            <Ranking />
        </BrowserRouter>
    );

    test('debe resaltar la fila del usuario actual', async () => {
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockPlayersData),
        });
        renderRanking();
       
        const userRow = await screen.findByRole('row', { name: /MineroPro/i });
        expect(userRow).toHaveClass('current-user-row');
    });

    test('debe cambiar la métrica y reordenar los jugadores correctamente', async () => {
        const user = userEvent.setup();
        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockPlayersData),
        });

        renderRanking();
       
        await screen.findByText('MineroPro');

        const select = screen.getByRole('combobox');
        await user.selectOptions(select, 'destroyedPaths');

        await waitFor(() => {
            const headers = screen.getAllByText('CAMINOS DESTRUIDOS');
            
            expect(headers.length).toBeGreaterThan(0);
        });

        const rows = screen.getAllByRole('row');
        
        expect(rows[1]).toHaveTextContent('SaboteadorX');
        expect(rows[2]).toHaveTextContent('MineroPro');
    });
});