import {describe, it, beforeEach, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import * as navigation from '../utils/navigation';
import BathroomDetails from '../components/BathroomDetails/BathroomDetails';
import BathroomMap from '../components/Map';

import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';

const URL = 'http://localhost:3000';
const server = setupServer();

describe('Bathroom Details visibility', () => {
  beforeEach(() => {
    server.use(
        http.get(URL + '/bathroom', async () => {
          return HttpResponse.json(
              [{
                id: '5f1169fe-4db2-48a2-b059-f05cfe63588b',
                name: 'Namaste Lounge Bathroom',
                position: {
                  'lat': 37.00076576303953,
                  'lng': -122.05719563060227},
                description: 'more details',
              }],
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
    fireEvent.click(screen.getByTestId('marker'));
    expect(screen.getByText('Namaste Lounge Bathroom'));
  });

  it('closes the Bathroom Details when you click away', async () => {
    fireEvent.click(screen.getByTestId('marker'));
    // click out of the details page
    const backdrop = document.querySelector('.MuiBackdrop-root')!;
    fireEvent.click(backdrop);
    expect(screen.queryByText('Namaste Lounge Bathroom'))
        .not.toBeInTheDocument();
  });
});

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
