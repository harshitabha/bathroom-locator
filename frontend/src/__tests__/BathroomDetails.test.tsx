import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import * as navigation from '../utils/navigation';
import BathroomDetails from '../components/BathroomDetails/BathroomDetails';
import InfoWindow from '../components/InfoWindow';

import {supabase} from '../lib/supabaseClient';
import {AuthError, type User, type UserResponse} from '@supabase/supabase-js';
import AppContext from '../context/AppContext';
import {getCurrentUserId} from '../App';
import type {Bathroom} from '../types';

const bathroom = {
  id: '5f1169fe-4db2-48a2-b059-f05cfe63588b',
  name: 'Namaste Lounge Bathroom',
  position: {
    'lat': 37.00076576303953,
    'lng': -122.05719563060227,
  },
  description: 'more details',
  num_stalls: 1,
  amenities: {
    'soap': true,
    'mirror': true,
    'hand_dryer': false,
    'paper_towel': true,
    'toilet_paper': true,
    'menstrual_products': true,
  },
  gender: {
    'male': false,
    'female': true,
    'gender_neutral': false,
  },
  likes: 0,
};

const bathroomWith5Likes = {
  id: '5f1169fe-4db2-48a2-b059-f05cfe63588b',
  name: 'Namaste Lounge Bathroom',
  position: {
    'lat': 37.00076576303953,
    'lng': -122.05719563060227,
  },
  description: 'more details',
  num_stalls: 1,
  amenities: {
    'soap': true,
    'mirror': true,
    'hand_dryer': false,
    'paper_towel': true,
    'toilet_paper': true,
    'menstrual_products': true,
  },
  gender: {
    'male': false,
    'female': true,
    'gender_neutral': false,
  },
  likes: 5,
};

// mock supabase
vi.mock('../lib/supabaseClient', () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn(),
        signOut: vi.fn(),
      },
    },
  };
});

/**
 * Mocks supabase get user id
 * @param {string | null} userId user id
 * @param {string | null} error error message
 */
function mockGetUserId(userId: string | null, error: string | null) {
  const user : User | null = userId ? {
    id: userId,
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString()} :
    null;

  const mockGetUser = vi.mocked(supabase.auth.getUser);
  mockGetUser.mockResolvedValueOnce({
    data: {user: user},
    error: error ? new AuthError(error) : null,
  } as UserResponse);
}

/**
 * renders bathroom details component with context
 * @param {Bathroom} bathroom selected bathroom
 */
function verifyBathroomRender(bathroom: Bathroom) {
  render(
      <AppContext value={{getCurrentUserId}}>
        <BathroomDetails
          bathroom={bathroom}
          setBathroom={() => {}}
        />,
      </AppContext>,
  );
}

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Bathroom Details visibility', () => {
  it('by default, doesn\'t render the Bathroom Details', () => {
    render(
        <InfoWindow bathroom={null} setBathroom={() => {}} />,
    );
    const bathroomDetails = screen.queryByText('Namaste Lounge Bathroom');
    expect(bathroomDetails).toBeNull();
  });

  it('renders the Bathroom Details when a bathroom is selected', async () => {
    render(
        <InfoWindow bathroom={bathroom} setBathroom={() => {}} />,
    );
    const bathroomDetails = screen.queryByText('Namaste Lounge Bathroom');
    expect(bathroomDetails).toBeInTheDocument();
  });

  it('closes when you click away', () => {
    const mockSetBathroom = vi.fn();
    render(
        <InfoWindow bathroom={bathroom} setBathroom={mockSetBathroom} />,
    );
    const backdrop = document.querySelector('.MuiBackdrop-root')!;
    fireEvent.click(backdrop);
    expect(mockSetBathroom).toHaveBeenCalledWith(null);
  });
});

describe('Bathroom Details component content', () => {
  beforeEach(() => {
    mockGetUserId(null, null);
    verifyBathroomRender(bathroom);
  });

  it('renders the bathroom name and description', () => {
    expect(screen.getByText('Namaste Lounge Bathroom'));
    expect(screen.getByText('more details'));
  });

  it('renders the navigate button', () => {
    expect(screen.getByText('Navigate'));
  });

  it('calls openWalkingDirections when you click on Navigate button', () => {
    const openWalkingDirectionsMock = vi.spyOn(
        navigation, 'openWalkingDirections').mockImplementation(() => {});
    const button = screen.getByRole('button', {name: 'Navigate'});
    fireEvent.click(button);

    expect(openWalkingDirectionsMock)
        .toHaveBeenCalledWith(37.00076576303953, -122.05719563060227);
  });
});

describe('Bathroom Details component when user is not logged in', () => {
  beforeEach(() => {
    mockGetUserId(null, null);
    verifyBathroomRender(bathroom);
  });

  it('doesn\'t render like component', async () => {
    expect(screen.queryByLabelText(`Unlike ${bathroom.name}`)).toBeNull();
    expect(screen.queryByLabelText(`Like ${bathroom.name}`)).toBeNull();
  });

  it('doesn\'t render verified bathroom with 0 likes', async () => {
    expect(screen.queryByLabelText('Verified Bathroom')).toBeNull();
  });
});


describe('Bathroom Details component when bathroom has >= 5 likes', () => {
  beforeEach(() => {
    mockGetUserId('123', null);
    verifyBathroomRender(bathroomWith5Likes);
  });

  it('renders verified bathroom', async () => {
    expect(screen.queryByLabelText('Verified Bathroom'));
  });
});

