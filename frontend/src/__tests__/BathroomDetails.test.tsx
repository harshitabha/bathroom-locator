import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import * as navigation from '../utils/navigation';
import BathroomDetails from '../components/BathroomDetails/BathroomDetails';
import InfoWindow from '../components/InfoWindow';
import {basicBathroom} from './constants';
import type {Bathroom} from '../types';

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
    render(
        <BathroomDetails
          bathroom={basicBathroom}
          setBathroom={() => {}}
        />,
    );
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
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
  });
});
