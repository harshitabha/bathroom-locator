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
import {basicBathroom, bathroomWith5Likes} from './constants';
import type {Bathroom} from '../types';

import {supabase} from '../lib/supabaseClient';
import {AuthError, type User, type UserResponse} from '@supabase/supabase-js';
import AppContext from '../context/AppContext';
import BathroomContext from '../context/BathroomContext';

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
  const selected = bathroom;
  const mockSetSelected = () => {};
  const bathrooms : Bathroom [] = [];
  const mockSetBathrooms = () => {};
  render(
      <AppContext
        value={{
          userId: null,
          setUserId: async () => {},
          getCurrentUserId: async () => {},
        }}
      >
        <BathroomContext value={{
          bathrooms,
          setBathrooms: mockSetBathrooms,
          selected,
          setSelected: mockSetSelected}}>
          <BathroomDetails/>,
        </BathroomContext>
      </AppContext>,
  );
}

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('Bathroom Details visibility', () => {
  it('closes when you click away', () => {
    const selected = basicBathroom;
    const mockSetSelected = vi.fn();
    const bathrooms : Bathroom [] = [];
    const mockSetBathrooms = () => {};
    render(
        <BathroomContext value={{
          bathrooms,
          setBathrooms: mockSetBathrooms,
          selected,
          setSelected: mockSetSelected}}>
          <BathroomDetails/>
        </BathroomContext>,
    );
    const backdrop = document.querySelector('.MuiBackdrop-root')!;
    fireEvent.click(backdrop);
    expect(mockSetSelected).toHaveBeenCalledWith(null);
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

      const selected = bathroomWithGender;
      const mockSetSelected = () => {};
      const bathrooms : Bathroom [] = [];
      const mockSetBathrooms = () => {};
      render(
          <BathroomContext value={{
            bathrooms,
            setBathrooms: mockSetBathrooms,
            selected,
            setSelected: mockSetSelected}}>
            <BathroomDetails/>
          </BathroomContext>,
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

      const selected = bathroomWithAmenities;
      const mockSetSelected = () => {};
      const bathrooms : Bathroom [] = [];
      const mockSetBathrooms = () => {};
      render(
          <BathroomContext value={{
            bathrooms,
            setBathrooms: mockSetBathrooms,
            selected,
            setSelected: mockSetSelected}}>
            <BathroomDetails/>,
          </BathroomContext>,
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
