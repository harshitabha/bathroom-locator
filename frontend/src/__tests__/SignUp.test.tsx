import SignUp from '../components/SignUp';
import {describe, it, beforeEach, afterEach, expect, vi,} from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor} from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import '@testing-library/jest-dom/vitest';

// mock supabase
vi.mock('../lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        signUp: vi.fn(),
      },
    },
  };
});

// function to mock sign up and simulate user action
function mockUserSignUp(email: string, password: string, confirmPassword: string, error: string) {
    const mockSignUp = vi.mocked(supabase.auth.signUp);
    mockSignUp.mockResolvedValueOnce ({
      data: { user: {email: email, password: password, confirmPassword: confirmPassword}},
      error: error.length === 0 ? null : {message: error},
    } as any);

    // fill in sign up form
    fireEvent.change(screen.getByLabelText('Email'), {
      target: {value: email}
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: {value: password}
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), {
      target: {value: confirmPassword}
    });

    // click sign up button
    fireEvent.click(screen.getByRole('button', {name: 'Sign Up'}));

    return mockSignUp;
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
      <SignUp/>
    </MemoryRouter>
  );
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Sign Up component', () => {
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
    expect(screen.getByText('Create an account to add new bathroom locations to the map or add details to existing bathrooms.'));
  });

  it('renders auth form', async () => {
    expect(screen.getByText('Sign Up', { selector: 'div'}));

    expect(screen.getByLabelText('Email'));
    expect(screen.getByLabelText('Email').tagName).toBe('INPUT');

    expect(screen.getByLabelText('Password'));
    expect(screen.getByLabelText('Password').tagName).toBe('INPUT');
    
    expect(screen.getByLabelText('Confirm Password'));
    expect(screen.getByLabelText('Confirm Password').tagName).toBe('INPUT');

    expect(screen.getByRole('button', { name: 'Login'}));
    expect(screen.getByRole('button', { name: 'Sign Up'}));
  });

  it('redirects to Login page when Login button is clicked', async () => {
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('signs up succesfully and redirects to home/map page when email is valid and passwords match', async () => {
    // mock signInWithPassword
    const email = 'test@example.com';
    const password = 'password123';
    const confirmPassword = 'password123';
    const error = '';
    const mockSignUp = mockUserSignUp(email, password, confirmPassword, error);

    // expect that Supabase sign in was called correctly
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith (
        expect.objectContaining({
          email: email,
          password: password,
        })
      );
    });
    
    // check that there is no error message
    const errorMessage = screen.queryByRole('alert');
    expect(errorMessage).toBeNull();
    
    // expect redirect to map page due to successful sign up
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('displays error message when passwords don\'t match and stays on sign up screen', async () => {
    // mock signInWithPassword
    const email = 'test@example.com';
    const password = 'password123';
    const confirmPassword = 'notpassword123';
    const error = 'Passwords do not match';
    const mockSignUp = mockUserSignUp(email, password, confirmPassword, error);

    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
    
    // check for error message to appear
    const errorMessage = screen.queryByRole('alert');
    expect(errorMessage?.textContent).toBe(error);

    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables sign up button when no input is provided and stays on the sign up screen', async () => {
    // mock signInWithPassword
    const email = '';
    const password = '';
    const confirmPassword = '';
    const error = '';
    const mockSignUp = mockUserSignUp(email, password, confirmPassword, error);

    // check that sign up button is disabled
    const signUpButton = screen.getByRole('button', {name: 'Sign Up'}) as HTMLButtonElement;
    expect(signUpButton).toBeDisabled();

    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
    
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables sign up button when only email is provided and stays on the sign up screen', async () => {
    // mock signInWithPassword
    const email = 'test@example.com';
    const password = '';
    const confirmPassword = '';
    const error = '';
    const mockSignUp = mockUserSignUp(email, password, confirmPassword, error);

    // check that sign up button is disabled
    const signUpButton = screen.getByRole('button', {name: 'Sign Up'}) as HTMLButtonElement;
    expect(signUpButton).toBeDisabled();

    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
    
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables sign up button when only password is provided and stays on the sign up screen', async () => {
    // mock signInWithPassword
    const email = '';
    const password = 'password123';
    const confirmPassword = '';
    const error = '';
    const mockSignUp = mockUserSignUp(email, password, confirmPassword, error);

    // check that sign up button is disabled
    const signUpButton = screen.getByRole('button', {name: 'Sign Up'}) as HTMLButtonElement;
    expect(signUpButton).toBeDisabled();

    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
    
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables sign up button when confirm password is not provided and stays on the sign up screen', async () => {
    // mock signInWithPassword
    const email = 'test@example.com';
    const password = 'password123';
    const confirmPassword = '';
    const error = '';
    const mockSignUp = mockUserSignUp(email, password, confirmPassword, error);

    // check that sign up button is disabled
    const signUpButton = screen.getByRole('button', {name: 'Sign Up'}) as HTMLButtonElement;
    expect(signUpButton).toBeDisabled();

    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
    
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables sign up button when only confirm password is provided and stays on the sign up screen', async () => {
    // mock signInWithPassword
    const email = '';
    const password = '';
    const confirmPassword = 'password123';
    const error = '';
    const mockSignUp = mockUserSignUp(email, password, confirmPassword, error);

    // check that sign up button is disabled
    const signUpButton = screen.getByRole('button', {name: 'Sign Up'}) as HTMLButtonElement;
    expect(signUpButton).toBeDisabled();

    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
    
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables sign up button when password is not provided and stays on the sign up screen', async () => {
    // mock signInWithPassword
    const email = 'test@example.com';
    const password = '';
    const confirmPassword = 'password123';
    const error = '';
    const mockSignUp = mockUserSignUp(email, password, confirmPassword, error);

    // check that sign up button is disabled
    const signUpButton = screen.getByRole('button', {name: 'Sign Up'}) as HTMLButtonElement;
    expect(signUpButton).toBeDisabled();

    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
    
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables sign up button when email is not provided and stays on the sign up screen', async () => {
    // mock signInWithPassword
    const email = '';
    const password = 'password123';
    const confirmPassword = 'password123';
    const error = '';
    const mockSignUp = mockUserSignUp(email, password, confirmPassword, error);

    // check that sign up button is disabled
    const signUpButton = screen.getByRole('button', {name: 'Sign Up'}) as HTMLButtonElement;
    expect(signUpButton).toBeDisabled();

    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
    
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('shows an error message when trying to sign up with an existing email and stays on the sign up screen', async () => {
    // mock signInWithPassword
    const email = 'test@example.com';
    const password = 'password123';
    const confirmPassword = 'password123';
    const error = 'User already registered';
    const mockSignUp = mockUserSignUp(email, password, confirmPassword, error);

    // expect that Supabase sign in was called correctly
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith (
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

  it('shows an error message when an invalid email is provided and stays on the sign up screen', async () => {
    // mock signInWithPassword
    const email = 'badEmailFormat';
    const password = 'password123';
    const confirmPassword = 'password123';
    const error = 'Invalid email format';
    const mockSignUp = mockUserSignUp(email, password, confirmPassword, error);

    // expect that Supabase sign in was called correctly
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith (
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
});
