import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import * as navigation from '../utils/navigation';
import BathroomDetails from '../components/BathroomDetails/BathroomDetails';
import BathroomMap from '../components/Map';
import {bathroom} from './constants';
import type {Place} from '../types';

import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';

const URL = 'http://localhost:3000';
const server = setupServer();

describe('Bathroom Details visibility', () => {
  beforeEach(() => {
    server.use(
        http.get(URL + '/bathroom', async () => {
          return HttpResponse.json(
              [bathroom],
          );
        }),
        http.get(URL + '/bathroom/update', async () => {
          return HttpResponse.json([]);
        }),
    );

    // mocks the google maps api
    vi.mock('@react-google-maps/api', () =>
      import('./mocks/react-google-maps-api'),
    );

    render(<BathroomMap />);
  });

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  it('by default, does not render the Bathroom Details', () => {
    const bathroomDetails = screen.queryByText('Namaste Lounge Bathroom');
    expect(bathroomDetails).not.toBeInTheDocument();
  });

  it('renders the Bathroom Details when you click on a pin', async () => {
    fireEvent.click(screen.getByLabelText(bathroom.name));
    expect(screen.getByText('Namaste Lounge Bathroom'));
  });

  it('closes the Bathroom Details when you click away', async () => {
    fireEvent.click(screen.getByLabelText(bathroom.name));
    // click out of the details page
    const map = screen.getByLabelText('Bathroom Map');
    fireEvent.click(map);
    const bathroomName = screen.queryByText('Namaste Lounge Bathroom');
    expect(bathroomName).toBeNull();
  });
});

describe('Bathroom Details common content', () => {
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
    expect(screen.getByRole('button', {name: 'Navigate'}));
  });

  it('Doesn\'t show additional details if there are' +
    'no additional details', async () => {
    const addtionalDetailsHeader = screen.queryByText('Additional Details');
    expect(addtionalDetailsHeader).toBeNull();
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

describe('Rendering Additional Details', async () => {
  describe('Gender information', async () => {
    beforeEach(() => {
      const bathroomWithGender: Place = {
        ...bathroom,
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
      screen.getByText('Male');
    });
  });
});
