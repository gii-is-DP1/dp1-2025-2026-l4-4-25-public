import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import tokenService from '../../services/token.service';
import Register from './index';

// Mocks
jest.mock('../../services/token.service');

jest.mock('../../components/formGenerator/formGenerator', () => {
  const React = require('react');
  return React.forwardRef(function FormGenerator({ inputs, onSubmit, buttonText }, ref) {
    React.useImperativeHandle(ref, () => ({
      validate: () => true
    }));
    
    return (
      <form data-testid="register-form" onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ 
          values: { 
            username: 'newuser', 
            password: 'password123',
            email: 'newuser@example.com',
            birthdate: '2000-01-01'
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
  });
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

jest.mock('../../util/getIconImage', () => {
  return jest.fn((id) => `/icon-${id}.png`);
});

jest.mock('reactstrap', () => ({
  Dropdown: ({ children, isOpen, toggle }) => (
    <div data-testid="dropdown" onClick={toggle}>{children}</div>
  ),
  DropdownToggle: ({ children, caret }) => (
    <button data-testid="dropdown-toggle">{children}</button>
  ),
  DropdownMenu: ({ children }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownItem: ({ children, onClick }) => (
    <button data-testid="dropdown-item" onClick={onClick}>{children}</button>
  )
}));

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

// Mock para window.location
const originalLocation = window.location;

describe('Register Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    global.fetch = jest.fn();
    global.alert = jest.fn();
    
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.location = originalLocation;
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <Register />
      </BrowserRouter>
    );
  };

  // Tests de renderizado básico
  describe('Basic Rendering', () => {
    test('should render register title', () => {
      renderRegister();
      expect(screen.getByText('Register')).toBeInTheDocument();
    });

    test('should render return to login button', () => {
      renderRegister();
      expect(screen.getByText(/Return to Login/i)).toBeInTheDocument();
    });

    test('should render form', () => {
      renderRegister();
      expect(screen.getByTestId('register-form')).toBeInTheDocument();
    });

    test('should render profile image selector', () => {
      renderRegister();
      expect(screen.getByText(/Select profile image/i)).toBeInTheDocument();
    });

    test('should render dropdown for predefined images', () => {
      renderRegister();
      expect(screen.getByTestId('dropdown')).toBeInTheDocument();
    });

    test('should render file input for custom image', () => {
      renderRegister();
      expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    });
  });

  // Tests de navegación
  describe('Navigation', () => {
    test('should have link to login page', () => {
      renderRegister();
      
      const loginLink = screen.getByRole('link', { name: /Return to Login/i });
      expect(loginLink).toHaveAttribute('href', '/login');
    });
  });

  // Tests de registro exitoso
  describe('Successful Registration', () => {
    test('should call signup and signin endpoints on form submit', async () => {
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          json: () => Promise.resolve({ id: 1, username: 'newuser' })
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => Promise.resolve({ token: 'mock-token', username: 'newuser' })
        });

      renderRegister();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
      expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/v1/auth/signup', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }));
      expect(global.fetch).toHaveBeenNthCalledWith(2, '/api/v1/auth/signin', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }));
    });

    test('should set token and show welcome screen on successful registration', async () => {
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          json: () => Promise.resolve({ id: 1, username: 'newuser' })
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => Promise.resolve({ token: 'mock-token', username: 'newuser' })
        });

      renderRegister();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });
      expect(tokenService.setUser).toHaveBeenCalled();
      expect(tokenService.updateLocalAccessToken).toHaveBeenCalledWith('mock-token');
    });

    test('should redirect to lobby when welcome is completed', async () => {
      global.fetch
        .mockResolvedValueOnce({
          status: 200,
          json: () => Promise.resolve({ id: 1, username: 'newuser' })
        })
        .mockResolvedValueOnce({
          status: 200,
          json: () => Promise.resolve({ token: 'mock-token', username: 'newuser' })
        });

      renderRegister();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('welcome-screen')).toBeInTheDocument();
      });

      const completeButton = screen.getByTestId('complete-welcome');
      fireEvent.click(completeButton);
      
      expect(window.location.href).toBe('/lobby');
    });
  });

  // Tests de registro fallido
  describe('Failed Registration', () => {
    test('should show alert on registration failure', async () => {
      global.fetch.mockResolvedValueOnce({
        status: 400,
        json: () => Promise.resolve({ message: 'Username already exists' })
      });

      renderRegister();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Username already exists');
      });
    });

    test('should not show welcome screen on registration failure', async () => {
      global.fetch.mockResolvedValueOnce({
        status: 400,
        json: () => Promise.resolve({ message: 'Registration failed' })
      });

      renderRegister();
      
      const submitButton = screen.getByTestId('submit-button');
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('welcome-screen')).not.toBeInTheDocument();
      });
    });
  });

  // Tests de selección de imagen
  describe('Profile Image Selection', () => {
    test('should render default profile avatar', () => {
      renderRegister();
      
      const avatar = screen.getByAltText('Avatar');
      expect(avatar).toBeInTheDocument();
    });
  });
});
