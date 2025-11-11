import SignUp from '../components/SignUp';
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
  AuthResponse,
  SignInWithPasswordCredentials,
} from '@supabase/supabase-js';

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

/**
 * Mocks signup and simulates any required user action
 * @param {string} email user email
 * @param {string} password user password
 * @param {string} confirmPassword confirmed password
 * @param {string} error error string
 * @returns {MockedFunction} mocked login function
 */
function mockUserSignUp(
    email: string,
    password: string,
    confirmPassword: string,
    error: string): MockedFunction<
      (credentials: SignInWithPasswordCredentials) =>
      Promise<AuthResponse>> {
  const mockSignUp = vi.mocked(supabase.auth.signUp);
  // TODO: @ravikavya could you also update this function
  console.log(error);
  // mockSignUp.mockResolvedValueOnce({
  //   data: {user: {
  //     email: email,
  //     password: password,
  //     confirmPassword: confirmPassword,
  //   }},
  //   error: error.length === 0 ? null : {message: error},
  // });

  // fill in sign up form
  fireEvent.change(screen.getByLabelText('Email'), {
    target: {value: email},
  });
  fireEvent.change(screen.getByLabelText('Password'), {
    target: {value: password},
  });
  fireEvent.change(screen.getByLabelText('Confirm Password'), {
    target: {value: confirmPassword},
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
  render(
      <MemoryRouter>
        <SignUp/>
      </MemoryRouter>,
  );
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Renders Sign up', async () => {
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
    screen.getByLabelText('location-icon');
    screen.getByText('Bathroom');
    screen.getByText('Locator');
    screen.getByText('Create an account to add new bathroom locations' +
      'to the map or add details to existing bathrooms.');
  });

  it('renders auth form', async () => {
    screen.getByText('Sign Up', {selector: 'div'});

    screen.getByLabelText('Email');
    screen.getByLabelText('Password');

    screen.getByLabelText('Confirm Password');
    expect(screen.getByLabelText('Confirm Password').tagName).toBe('INPUT');

    screen.getByRole('button', {name: 'Login'});
    screen.getByRole('button', {name: 'Sign Up'});
  });
});

it('redirects to Login page when Login button is clicked', async () => {
  const loginButton = screen.getByRole('button', {name: 'Login'});
  fireEvent.click(loginButton);
  expect(mockNavigate).toHaveBeenCalledWith('/login');
});

describe('Email provide and passwords match', async () => {
  let mockSignUp : MockedFunction<
      (credentials: SignInWithPasswordCredentials) =>
      Promise<AuthResponse>>;
  let email: string;
  let password: string;

  beforeAll(async () => {
    // mock signInWithPassword
    email = 'test@example.com';
    password = 'password123';
    const confirmPassword = 'password123';
    const error = '';
    mockSignUp = mockUserSignUp(email, password, confirmPassword, error);
  });

  it('attempts signs up', async () => {
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
          expect.objectContaining({
            email: email,
            password: password,
          }),
      );
    });
  });

  it('doesn\'t show an error', async () => {
    await waitFor(() => {
      // check that there is no error message
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage).toBeNull();
    });
  });

  it('redirects to home/map page', async () => {
    await waitFor(() => {
      // expect redirect to map page due to successful sign up
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});

describe('Passwords don\'t match', async () => {
  let mockSignUp : MockedFunction<
      (credentials: SignInWithPasswordCredentials) =>
      Promise<AuthResponse>>;
  let email: string;
  let password: string;
  let error: string;

  beforeAll(async () => {
    // mock signInWithPassword
    email = 'test@example.com';
    password = 'password123';
    const confirmPassword = 'notpassword123';
    error = 'Passwords do not match';
    mockSignUp = mockUserSignUp(email, password, confirmPassword, error);
  });

  it('doesn\'t call sign up', async () => {
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('displays error message', async () => {
    await waitFor(() => {
      // check for error message to appear
      const errorMessage = screen.queryByRole('alert');
      expect(errorMessage?.textContent).toBe(error);
    });
  });

  it('stays on sign up screen', async () => {
    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe('No input provided', async () => {
  let mockSignUp : MockedFunction<
      (credentials: SignInWithPasswordCredentials) =>
      Promise<AuthResponse>>;
  let email: string;
  let password: string;
  let error: string;

  beforeAll(async () => {
    // mock signInWithPassword
    email = '';
    password = '';
    const confirmPassword = '';
    error = '';
    mockSignUp = mockUserSignUp(email, password, confirmPassword, error);
  });

  it('disables sign up button', async () => {
    await waitFor(() => {
      // check that sign up button is disabled
      const signUpButton = screen.getByRole(
          'button',
          {name: 'Sign Up'}) as HTMLButtonElement;
      expect(signUpButton).toBeDisabled();
    });
  });

  it('doesn\'t call sign up', async () => {
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('stays on sign up screen', async () => {
    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe('Only email is provided', async () => {
  let mockSignUp : MockedFunction<
      (credentials: SignInWithPasswordCredentials) =>
      Promise<AuthResponse>>;
  let email: string;
  let password: string;
  let error: string;

  beforeAll(async () => {
    // mock signInWithPassword
    email = 'test@example.com';
    password = '';
    const confirmPassword = '';
    error = '';
    mockSignUp = mockUserSignUp(email, password, confirmPassword, error);
  });

  it('disables sign up button', async () => {
    const signUpButton = screen.getByRole(
        'button',
        {name: 'Sign Up'}) as HTMLButtonElement;
    await waitFor(() => {
      expect(signUpButton).toBeDisabled();
    });
  });

  it('doesn\'t call sign up', async () => {
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('stays on the sign up screen', async () => {
    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe('Only password is provided', async () => {
  let mockSignUp : MockedFunction<
      (credentials: SignInWithPasswordCredentials) =>
      Promise<AuthResponse>>;
  let email: string;
  let password: string;
  let error: string;

  beforeAll(async () => {
    // mock signInWithPassword
    email = '';
    password = 'password123';
    const confirmPassword = '';
    error = '';
    mockSignUp = mockUserSignUp(email, password, confirmPassword, error);
  });

  it('disables sign up button', async () => {
    const signUpButton = screen.getByRole(
        'button',
        {name: 'Sign Up'}) as HTMLButtonElement;
    await waitFor(() => {
      expect(signUpButton).toBeDisabled();
    });
  });

  it('doesn\'t call sign up', async () => {
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('stays on the sign up screen', async () => {
    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe('Confirm password is missing', async () => {
  let mockSignUp : MockedFunction<
      (credentials: SignInWithPasswordCredentials) =>
      Promise<AuthResponse>>;
  let email: string;
  let password: string;
  let error: string;

  beforeAll(async () => {
    // mock signInWithPassword
    email = 'test@example.com';
    password = 'password123';
    const confirmPassword = '';
    error = '';
    mockSignUp = mockUserSignUp(email, password, confirmPassword, error);
  });

  it('disables sign up button', async () => {
    const signUpButton = screen.getByRole(
        'button',
        {name: 'Sign Up'}) as HTMLButtonElement;
    await waitFor(() => {
      expect(signUpButton).toBeDisabled();
    });
  });

  it('doesn\'t call sign up', async () => {
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('stays on the sign up screen', async () => {
    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe('Only confirm password is provided', async () => {
  let mockSignUp : MockedFunction<
      (credentials: SignInWithPasswordCredentials) =>
      Promise<AuthResponse>>;
  let email: string;
  let password: string;
  let error: string;

  beforeAll(async () => {
    // mock signInWithPassword
    email = '';
    password = '';
    const confirmPassword = 'password123';
    error = '';
    mockSignUp = mockUserSignUp(email, password, confirmPassword, error);
  });

  it('disables sign up button', async () => {
    const signUpButton = screen.getByRole(
        'button',
        {name: 'Sign Up'}) as HTMLButtonElement;
    await waitFor(() => {
      expect(signUpButton).toBeDisabled();
    });
  });

  it('doesn\'t call sign up', async () => {
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('stays on the sign up screen', async () => {
    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe('Password missing', async () => {
  let mockSignUp : MockedFunction<
      (credentials: SignInWithPasswordCredentials) =>
      Promise<AuthResponse>>;
  let email: string;
  let password: string;
  let error: string;

  beforeAll(async () => {
    // mock signInWithPassword
    email = 'test@example.com';
    password = '';
    const confirmPassword = 'password123';
    error = '';
    mockSignUp = mockUserSignUp(email, password, confirmPassword, error);
  });

  it('disables sign up button', async () => {
    const signUpButton = screen.getByRole(
        'button',
        {name: 'Sign Up'}) as HTMLButtonElement;
    await waitFor(() => {
      expect(signUpButton).toBeDisabled();
    });
  });

  it('doesn\'t call sign up', async () => {
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('stays on the sign up screen', async () => {
    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

describe('Email missing', async () => {
  let mockSignUp : MockedFunction<
      (credentials: SignInWithPasswordCredentials) =>
      Promise<AuthResponse>>;
  let email: string;
  let password: string;
  let error: string;

  beforeAll(async () => {
    // mock signInWithPassword
    email = '';
    password = 'password123';
    const confirmPassword = 'password123';
    error = '';
    mockSignUp = mockUserSignUp(email, password, confirmPassword, error);
  });

  it('disables sign up button', async () => {
    const signUpButton = screen.getByRole(
        'button',
        {name: 'Sign Up'}) as HTMLButtonElement;
    await waitFor(() => {
      expect(signUpButton).toBeDisabled();
    });
  });

  it('doesn\'t call sign up', async () => {
    await waitFor(() => {
      expect(mockSignUp).not.toHaveBeenCalled();
    });
  });

  it('stays on the sign up screen', async () => {
    await waitFor(() => {
      // ensure navigation was not called
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});


it('shows an error message when trying to sign up' +
  'with an registered email', async () => {
  // mock signInWithPassword
  const email = 'test@example.com';
  const password = 'password123';
  const confirmPassword = 'password123';
  const error = 'User already registered';
  mockUserSignUp(email, password, confirmPassword, error);

  await waitFor(() => {
    // check for error message to appear
    const errorMessage = screen.queryByRole('alert');
    expect(errorMessage?.textContent).toBe(error);
  });
});

it('stays on the sign up screen if the user is already' +
  'registered with the given email', async () => {
  // mock signInWithPassword
  const email = 'test@example.com';
  const password = 'password123';
  const confirmPassword = 'password123';
  const error = 'User already registered';
  mockUserSignUp(email, password, confirmPassword, error);

  await waitFor(() => {
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

it('displays error message when email is of the wrong format', async () => {
  // mock signInWithPassword
  const email = 'badEmailFormat';
  const password = 'password123';
  const confirmPassword = 'password123';
  const error = 'Invalid email format';
  mockUserSignUp(email, password, confirmPassword, error);

  await waitFor(() => {
    // check for error message to appear
    const errorMessage = screen.queryByRole('alert');
    expect(errorMessage?.textContent).toBe(error);
  });
});

it('stays on sign up screen when email is of the wrong format', async () => {
  // mock signInWithPassword
  const email = 'badEmailFormat';
  const password = 'password123';
  const confirmPassword = 'password123';
  const error = 'Invalid email format';
  mockUserSignUp(email, password, confirmPassword, error);

  await waitFor(() => {
    // ensure navigation was not called
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
