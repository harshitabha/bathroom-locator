import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import * as navigation from '../utils/navigation';
import BathroomDetails from '../components/BathroomDetails/BathroomDetails';

describe('Bathroom Details component content', () => {
  beforeEach(() => {
    render(
        <BathroomDetails
          bathroom={{
            id: '5f1169fe-4db2-48a2-b059-f05cfe63588b',
            name: 'Namaste Lounge Bathroom',
            position: {
              'lat': 37.00076576303953,
              'lng': -122.05719563060227,
            },
            description: 'more details',
          }}
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
    expect(screen.getByRole('button', {name: 'Navigate'}));
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
