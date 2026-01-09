import { rest } from 'msw';

const mockUsers = [
  { id: 1, username: 'admin1', authority: { authority: 'ADMIN' } },
  { id: 2, username: 'user1', authority: { authority: 'USER' } },
];

export const handlers = [
  // Users API
  rest.get('/api/v1/users', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(mockUsers));
  }),

  rest.get('/api/v1/users/:id/inActiveGame', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(false));
  }),

  rest.delete('/api/v1/users/:id', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'User deleted successfully' }));
  }),
];
