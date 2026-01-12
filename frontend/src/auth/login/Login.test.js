import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import tokenService from '../../services/token.service';
import Login from './index';

// Mocks
jest.mock('../../services/token.service');

jest.mock('../../components/formGenerator/formGenerator', () => {
  return function FormGenerator({ ref, inputs, onSubmit, buttonText }) {
    return (
      <form data-testid="login-form" onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ 
          values: { 
            username: 'testuser', 
            password: 'password123'
          } 
        });
      }}>
        {inputs.map(input => (
          <input 
            key={input.name} 
            data-testid={`input-${input.name}`}
            placeholder={input.label}
          />
        ))}
        <button type="submit" data-testid="submit-button">{buttonText}</button>
      </form>
    );
  };
});

jest.mock('../../components/WelcomeScreen', () => {
  return function WelcomeScreen({ username, onComplete }) {
    return (
      <div data-testid="welcome-screen">
        <span>Welcome {username}!</span>
        <button onClick={onComplete} data-testid="complete-welcome">Continue</button>
      </div>
    );
  };
});

jest.mock('reactstrap', () => ({
  Alert: ({ children, color }) => <div data-testid="alert" className={color}>{children}</div>
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock para window.location
const originalLocation = window.location;

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch = jest.fn();
    
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.location = originalLocation;
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  // Tests de renderizado básico
  describe('Basic Rendering', () => {
    test('should render login title', () => {
      renderLogin();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });

    test('should render login form', () => {
      renderLogin();
      expect(screen.getByTestId('login-form')).toBeInTheDocument();
    });

    test('should render submit button with correct text', () => {
      renderLogin();
      expect(screen.getByTestId('submit-button')).toHaveTextContent('Log in');
    });

    test('should render register link', () => {
      renderLogin();
      expect(screen.getByText(/Not registered yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Sign up here/i)).toBeInTheDocument();
    });

    test('should not render alert initially', () => {
      renderLogin();
      expect(screen.queryByTestId('alert')).not.toBeInTheDocument();
    });
  });

  // Tests de navegación
  describe('Navigation', () => {
    test('should have link to register page', () => {
      renderLogin();
      
      const registerLink = screen.getByText(/Sign up here/i);
      expect(registerLink).toHaveAttribute('href', '/register');
    });
  });

  // Tests de login exitoso
  describe('Successful Login', () => {
    test('should call signin endpoint on form submit', async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ token: 'mock-token', username: 'testuser' })
      });

      renderLogin();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/v1/auth/signin', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'testuser', password: 'password123' })
        }));
      });
    });

    test('should set token on successful login', async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ token: 'mock-token', username: 'testuser' })
      });

      renderLogin();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(tokenService.setUser).toHaveBeenCalled();
      });
      expect(tokenService.updateLocalAccessToken).toHaveBeenCalledWith('mock-token');
    });

    test('should show welcome screen on successful login', async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ token: 'mock-token', username: 'testuser' })
      });

      renderLogin();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
      expect(screen.getByText('Welcome testuser!')).toBeInTheDocument();
    });

    test('should redirect to lobby when welcome is completed', async () => {
      global.fetch.mockResolvedValueOnce({
        status: 200,
        json: () => Promise.resolve({ token: 'mock-token', username: 'testuser' })
      });

      renderLogin();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });

      const completeButton = screen.getByTestId('complete-welcome');
      fireEvent.click(completeButton);
      
      expect(mockNavigate).toHaveBeenCalledWith('/lobby');
    });
  });

  // Tests de login fallido
  describe('Failed Login', () => {
    test('should show error message on failed login', async () => {
      global.fetch.mockResolvedValueOnce({
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      });

      renderLogin();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
      });
      expect(screen.getByText('Invalid login attempt')).toBeInTheDocument();
    });

    test('should not show welcome screen on failed login', async () => {
      global.fetch.mockResolvedValueOnce({
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      });

      renderLogin();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('welcome-screen')).not.toBeInTheDocument();
      });
    });

    test('should not set token on failed login', async () => {
      global.fetch.mockResolvedValueOnce({
        status: 401,
        json: () => Promise.resolve({ message: 'Invalid credentials' })
      });

      renderLogin();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('alert')).toBeInTheDocument();
      });
      
      expect(tokenService.setUser).not.toHaveBeenCalled();
      expect(tokenService.updateLocalAccessToken).not.toHaveBeenCalled();
    });
  });

  // Tests de manejo de errores
  describe('Error Handling', () => {
    test('should handle network errors gracefully', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      renderLogin();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      // El componente debería manejar el error (aunque el comportamiento exacto depende de la implementación)
      await waitFor(() => {
        expect(tokenService.setUser).not.toHaveBeenCalled();
      });
    });
  });
});
