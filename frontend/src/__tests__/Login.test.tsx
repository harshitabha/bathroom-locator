import Login from '../components/Login';
import {
  describe,
  it,
  beforeEach,
  afterEach,
  expect,
  vi,
  type MockedFunction,
  beforeAll,
} from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import {MemoryRouter} from 'react-router-dom';
import {supabase} from '../lib/supabaseClient';
import '@testing-library/jest-dom/vitest';
import type {
  AuthTokenResponsePassword,
  SignInWithPasswordCredentials,
} from '@supabase/supabase-js';

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

/**
 * Mocks login and simulates any required user action
 * @param {string} email user email
 * @param {string} password user password
 * @param {string} error error string
 * @returns {MockedFunction} mocked login function
 */
function mockUserLogin(
    email: string, password: string, error: string,
): MockedFunction<
  (credentials: SignInWithPasswordCredentials) =>
  Promise<AuthTokenResponsePassword>> {
  // mock signInWithPassword
  const mockLogin = vi.mocked(supabase.auth.signInWithPassword);
  // TODO: temp solution for linter (no unused vars)
  console.log(error);
  // mockLogin.mockResolvedValueOnce({
  //   data: {user: {email: email, password: password}},
  //   error: error.length === 0 ? null : {message: error},
  // });

  // fill in login form
  fireEvent.change(screen.getByLabelText('Email'), {
    target: {value: email},
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: {value: password},
  });

  // click login button
  fireEvent.click(screen.getByRole('button', {name: 'Login'}));

  return mockLogin;
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

let mockLogin: MockedFunction<
    (credentials: SignInWithPasswordCredentials) =>
    Promise<AuthTokenResponsePassword>>;

beforeEach(() => {
  render(
      <MemoryRouter>
        <Login/>
      </MemoryRouter>,
  );
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it('renders back to map button', async () => {
  const backButton = screen.getByRole('button', {name: 'Back to map'});
  expect(backButton);
});

it('navigates to map page when back button is clicked', async () => {
  const backButton = screen.getByRole('button', {name: 'Back to map'});
  fireEvent.click(backButton);
  expect(mockNavigate).toHaveBeenCalledWith('/');
});

it('renders header and description', async () => {
  expect(screen.getByLabelText('location-icon'));
  expect(screen.getByText('Bathroom'));
  expect(screen.getByText('Locator'));
  expect(screen.getByText('Log in to add new bathroom locations to the map' +
      'or add details to existing bathrooms.'));
});

it('renders auth form', async () => {
  expect(screen.getByText('Login', {selector: 'div'}));

  expect(screen.getByLabelText('Email'));
  expect(screen.getByLabelText('Password'));

  const buttons = screen.getAllByRole('button').map((btn) => btn.textContent);
  expect(buttons).toContain('Login');
  expect(buttons).toContain('Sign Up');
});

it('redirects to Sign Up page when Sign Up button is clicked', async () => {
  const signUpButton = screen.getByRole('button', {name: 'Sign Up'});
  fireEvent.click(signUpButton);
  expect(mockNavigate).toHaveBeenCalledWith('/signup');
});

it('attempts login with the provided credentials', async () => {
  // mock successful user login
  const email = 'test@example.com';
  const password = 'password123';
  const error = '';
  const mockLogin = mockUserLogin(email, password, error);

  // expect that Supabase sign in was called correctly
  await waitFor(() => {
    expect(mockLogin).toHaveBeenCalledWith(
        expect.objectContaining({
          email: email,
          password: password,
        }),
    );
  });
});

it('displays no error when valid credentials are provided', async () => {
  // mock successful user login
  const email = 'test@example.com';
  const password = 'password123';
  const error = '';
  mockUserLogin(email, password, error);

  // check that there is no error message
  const errorMessage = screen.queryByRole('alert');
  await waitFor(() => {
    expect(errorMessage).toBeNull();
  });
});

it('redirects to home page when valid credentials are provided', async () => {
  // mock successful user login
  const email = 'test@example.com';
  const password = 'password123';
  const error = '';
  mockUserLogin(email, password, error);

  await waitFor(() => {
    // expect redirect to map page due to successful login
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
});

describe('Login failed with invalid credentials', async () => {
  it('shows an error message', async () => {
    // mock unsuccessful login with credentials provided
    const email = 'test@example.com';
    const password = 'password123';
    const error = 'Invalid credentials';
    mockUserLogin(email, password, error);


    await waitFor(() => {
      // check for error message to appear
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage?.textContent).toBe(error);
    });
  });

  it('stays on login screen', async () => {
    // mock unsuccessful login with credentials provided
    const email = 'test@example.com';
    const password = 'password123';
    const error = 'Invalid credentials';
    mockUserLogin(email, password, error);

    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe('No input provided', async () => {
  beforeAll(async () => {
    // mock unsuccessful login with no credentials provided
    const email = '';
    const password = '';
    const error = '';
    mockLogin = mockUserLogin(email, password, error);
  });

  it('disables login button', async () => {
    // check that login button is disabled
    const loginButton = screen.getByRole(
        'button',
        {name: 'Login'}) as HTMLButtonElement;
    await waitFor(() => {
      expect(loginButton).toBeDisabled();
    });
  });

  it('doesn\'t call sign in function', async () => {
    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('stays on the login screen', async () => {
    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe('Only email is provided', async () => {
  beforeAll(async () => {
    // mock unsuccessful login with only email provided
    const email = 'test@example.com';
    const password = '';
    const error = '';
    mockLogin = mockUserLogin(email, password, error);
  });

  it('disables login button', async () => {
    // check that login button is disabled
    const loginButton = screen.getByRole(
        'button',
        {name: 'Login'}) as HTMLButtonElement;
    await waitFor(() => {
      expect(loginButton).toBeDisabled();
    });
  });

  it('doesn\'t call sign in function', async () => {
    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('stays on login screen', async () => {
    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe('Only password is provided', async () => {
  beforeAll(async () => {
    // mock unsuccessful login with only password provided
    const email = '';
    const password = 'password123';
    const error = '';
    mockLogin = mockUserLogin(email, password, error);
  });

  it('disables login button', async () => {
    // check that login button is disabled
    const loginButton = screen.getByRole(
        'button',
        {name: 'Login'}) as HTMLButtonElement;
    await waitFor(() => {
      expect(loginButton).toBeDisabled();
    });
  });

  it('doesn\'t call sign in function', async () => {
    // expect that Supabase sign in was not called
    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it('stays on login screen', async () => {
    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
