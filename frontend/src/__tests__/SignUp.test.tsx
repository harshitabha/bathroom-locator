import SignUp from '../components/SignUp';
import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom';

// mock supabase
vi.mock('../lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        signInWithPassword: vi.fn(),
      },
    },
  };
});

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
  vi.clearAllMocks();
  render (
    <MemoryRouter>
      <SignUp/>
    </MemoryRouter>
  );
});

afterEach(() => {
  cleanup();
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
});
