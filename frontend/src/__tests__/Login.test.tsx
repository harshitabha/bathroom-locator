import Login from '../components/Login';
import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '@testing-library/jest-dom/vitest';

// mock supabase
vi.mock('../lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        signInWithPassword: vi.fn(),
      },
    },
  }
});

// function to mock login and simulate user action
function mockUserLogin(email: string, password: string, error: string) {
  // mock signInWithPassword
  const mockLogin = vi.mocked(supabase.auth.signInWithPassword);
  mockLogin.mockResolvedValueOnce ({
    data: { user: {email: email, password: password}},
    error: error.length === 0 ? null : {message: error},
  } as any);

  // fill in login form
  fireEvent.change(screen.getByLabelText('Email'), {
    target: {value: email}
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: {value: password}
  });

  // click login button
  fireEvent.click(screen.getByRole('button', {name: 'Login'}));

  return mockLogin
}

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate, // override useNavigate
  };
});

beforeEach(() => {
  render (
    <MemoryRouter>
      <Login/>
    </MemoryRouter>
  );
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Login component', () => {
  it('renders back to map button and navigates to map page on click', async () => {
    // check rendering
    expect(screen.getByTestId('back-arrow'));
    const backButton = screen.getByRole('button', { name: 'Back to map'});
    expect(backButton);

    // check navigation
    fireEvent.click(backButton);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders header and description', async () => {
    expect(screen.getByTestId('location-pin'));
    expect(screen.getByText('Bathroom'));
    expect(screen.getByText('Locator'));
    expect(screen.getByText('Log in to add new bathroom locations to the map or add details to existing bathrooms.'));
  });

  it('renders auth form', async () => {
    expect(screen.getByText('Login', { selector: 'div'}));

    expect(screen.getByLabelText('Email'));
    expect(screen.getByLabelText('Email').tagName).toBe('INPUT');
    
    expect(screen.getByLabelText('Password'));
    expect(screen.getByLabelText('Password').tagName).toBe('INPUT');

    const buttons = screen.getAllByRole('button').map(btn => btn.textContent);
    expect(buttons).toContain('Login');
    expect(buttons).toContain('Sign Up');
  });

  it('redirects to Sign Up page when Sign Up button is clicked', async () => {
    const signUpButton = screen.getByRole('button', { name: 'Sign Up' });
    fireEvent.click(signUpButton);
    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('logs in succesfully and redirects to home/map page when valid credentials are provided', async () => {
    // mock successful user login
    const email = 'test@example.com';
    const password = 'password123';
    const error = '';
    const mockLogin = mockUserLogin(email, password, error);

    // expect that Supabase sign in was called correctly
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith (
        expect.objectContaining({
          email: email,
          password: password,
        })
      );
    });

    // check that there is no error message
    const errorMessage = screen.queryByRole('alert');
    expect(errorMessage).toBeNull();

    // expect redirect to map page due to successful login
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it ('shows an error message when login fails and stays on the login screen', async () => {
    // mock unsuccessful login with credentials provided
    const email = 'test@example.com';
    const password = 'password123';
    const error = 'Invalid credentials';
    const mockLogin = mockUserLogin(email, password, error);

    // expect that Supabase sign in was called correctly
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          email: email,
          password: password,
        })
      );
    });

    // check for error message to appear
    const errorMessage = screen.queryByRole('alert');
    expect(errorMessage?.textContent).toBe(error);
    
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it ('disables login button when no input is provided and stays on the login screen', async () => {
    // mock unsuccessful login with no credentials provided
    const email = '';
    const password = '';
    const error = '';
    const mockLogin = mockUserLogin(email, password, error);

    // check that login button is disabled
    const loginButton = screen.getByRole('button', {name: 'Login'}) as HTMLButtonElement;
    expect(loginButton).toBeDisabled();

    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
    
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it ('disables login button when only email is provided and stays on the login screen', async () => {
    // mock unsuccessful login with only email provided
    const email = 'test@example.com';
    const password = '';
    const error = '';
    const mockLogin = mockUserLogin(email, password, error);

    // check that login button is disabled
    const loginButton = screen.getByRole('button', {name: 'Login'}) as HTMLButtonElement;
    expect(loginButton).toBeDisabled();

    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
    
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it ('disables login button when only password is provided and stays on the login screen', async () => {
    // mock unsuccessful login with only password provided
    const email = '';
    const password = 'password123';
    const error = '';
    const mockLogin = mockUserLogin(email, password, error);

    // check that login button is disabled
    const loginButton = screen.getByRole('button', {name: 'Login'}) as HTMLButtonElement;
    expect(loginButton).toBeDisabled();

    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
    
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
