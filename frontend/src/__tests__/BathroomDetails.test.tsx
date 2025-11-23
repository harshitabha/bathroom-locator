import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import * as navigation from '../utils/navigation';
import BathroomDetails from '../components/BathroomDetails/BathroomDetails';
import InfoWindow from '../components/InfoWindow';

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

describe('Bathroom Details visibility', () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

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
    render(
        <BathroomDetails
          bathroom={bathroom}
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

  it('calls openWalkingDirections when you click on Navigate button', () => {
    const openWalkingDirectionsMock = vi.spyOn(
        navigation, 'openWalkingDirections').mockImplementation(() => {});
    const button = screen.getByRole('button', {name: 'Navigate'});
    fireEvent.click(button);

    expect(openWalkingDirectionsMock)
        .toHaveBeenCalledWith(37.00076576303953, -122.05719563060227);
  });
});
