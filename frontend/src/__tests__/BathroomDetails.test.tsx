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
import {basicBathroom, bathroomWith5Likes} from './constants';
import type {Bathroom} from '../types';

import {supabase} from '../lib/supabaseClient';
import {AuthError, type User, type UserResponse} from '@supabase/supabase-js';
import AppContext from '../context/AppContext';
import {getCurrentUserId} from '../App';

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
        <InfoWindow bathroom={basicBathroom} setBathroom={() => {}} />,
    );
    screen.getByText('Namaste Lounge Bathroom');
  });

  it('closes when you click away', () => {
    const mockSetBathroom = vi.fn();
    render(
        <InfoWindow bathroom={basicBathroom} setBathroom={mockSetBathroom} />,
    );
    const backdrop = document.querySelector('.MuiBackdrop-root')!;
    fireEvent.click(backdrop);
    expect(mockSetBathroom).toHaveBeenCalledWith(null);
  });
});

describe('Bathroom Details component content', () => {
  beforeEach(() => {
    mockGetUserId(null, null);
    verifyBathroomRender(basicBathroom);
  });

  it('renders the bathroom name and description', () => {
    expect(screen.getByText('Namaste Lounge Bathroom'));
    expect(screen.getByText('more details'));
  });

  it('renders the navigate button', () => {
    expect(screen.getByText('Navigate'));
  });

  it('Doesn\'t show additional details if there are' +
    'no additional details', async () => {
    const addtionalDetailsHeader = screen.queryByText('Additional Details');
    expect(addtionalDetailsHeader).toBeNull();
  });

  it('calls openWalkingDirections when you click on Navigate button', () => {
    const openWalkingDirectionsMock = vi.spyOn(
        navigation, 'openWalkingDirections').mockImplementation(() => {});
    const button = screen.getByText('Navigate');
    fireEvent.click(button);

    expect(openWalkingDirectionsMock)
        .toHaveBeenCalledWith(37.00076576303953, -122.05719563060227);
  });
});

it('doesn\'t render verified bathroom with <5 likes', async () => {
  mockGetUserId(null, null);
  verifyBathroomRender(basicBathroom);

  expect(screen.queryByLabelText('Verified Bathroom')).toBeNull();
});


describe('Bathroom Details component when bathroom has >= 5 likes', () => {
  beforeEach(() => {
    mockGetUserId('123', null);
    verifyBathroomRender(bathroomWith5Likes);
  });

  it('renders verified bathroom', async () => {
    screen.findByLabelText('Verified Bathroom');
  });
});

describe('Rendering Additional Details', async () => {
  describe('Gender information', async () => {
    beforeEach(() => {
      const bathroomWithGender: Bathroom = {
        ...basicBathroom,
        gender: {
          female: true,
          male: false,
          gender_neutral: true,
        },
      };
      render(
          <BathroomDetails
            bathroom={bathroomWithGender}
            setBathroom={() => {}}
          />,
      );
    });

    it('Renders gender label', async () => {
      screen.getByText('Gender:');
    });

    it('Renders the true options in bathroom', async () => {
      screen.getByText('Female');
      screen.getByText('Gender Neutral');
    });

    it('It doesn\'t display amenities if not set', async () => {
      const amenitiesLabel = screen.queryByText('Amenities:');
      expect(amenitiesLabel).toBeNull();
    });
  });

  describe('Amenities information', async () => {
    beforeEach(() => {
      const bathroomWithAmenities: Bathroom = {
        ...basicBathroom,
        amenities: {
          soap: true,
          mirror: false,
          hand_dryer: true,
          paper_towel: false,
          toilet_paper: true,
          menstrual_products: false,
        },
      };
      render(
          <BathroomDetails
            bathroom={bathroomWithAmenities}
            setBathroom={() => {}}
          />,
      );
    });

    it('Renders gender label', async () => {
      screen.getByText('Amenities:');
    });

    it('Renders the true options in bathroom', async () => {
      screen.getByText('Soap');
      screen.getByText('Hand Dryer');
      screen.getByText('Toilet Paper');
    });

    it('It doesn\'t display gender if not set', async () => {
      const genderLabel = screen.queryByText('Gender:');
      expect(genderLabel).toBeNull();
    });
  });
});
