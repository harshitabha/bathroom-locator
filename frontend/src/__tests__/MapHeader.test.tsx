import MapHeader from '../components/MapHeader';

import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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
  render(
    <MemoryRouter>
      <MapHeader />
    </MemoryRouter>
  );
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});


describe('Map Header component', () => {
  it('renders the login button by default', async () => {
    const loginButton = screen.getByRole('button', { name: 'Login' });
    expect(loginButton);
  });

  it('hides the profile picture by default', async () => {
    const profilePicture = screen.queryByLabelText('profile-picture');
    expect(profilePicture).not.toBeInTheDocument();
  });

  it('leads to login page when login button is clicked', async () => {
    const loginButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(loginButton);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
