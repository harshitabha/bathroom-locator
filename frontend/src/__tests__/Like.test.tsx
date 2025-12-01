import Like from '../components/BathroomDetails/Like';
import {
  it,
  vi,
  beforeAll,
  beforeEach,
  afterAll,
  afterEach,
  expect,
  describe,
} from 'vitest';
import {render, screen, cleanup, waitFor} from '@testing-library/react';
import {userEvent} from '@testing-library/user-event';
import {setupServer} from 'msw/node';
import {http, HttpResponse} from 'msw';
import type {Bathroom} from '../types';
import {basicBathroom, bathroomWith4Likes} from './constants';
import BathroomContext from '../context/BathroomContext';
import {API_BASE_URL} from '../utils/api';

const userId = '6697fe75-586e-4f24-9c56-243d15d1d9f0';

const URL = API_BASE_URL + '/user/likes';

const server = setupServer();

/**
 * http response setup
 * @param {Response} getResponse get response
 * @param {Response} postResponse post response
 * @param {Response} deleteResponse delete response
 */
function setupHttpRequests(
    getResponse : Response,
    postResponse : Response,
    deleteResponse : Response,
) {
  server.use(
      // get user's likes
      http.get(URL + '*', async () => {
        return getResponse;
      }),
      // add user like
      http.post(URL, async () => {
        return postResponse;
      }),
      // remove user like
      http.delete(URL, async () => {
        return deleteResponse;
      }),
  );
}

/**
 * like component rendering
 * @param {Bathroom} bathroom selected bathroom
 * @param {string | null} userId user id
 */
function renderLikeComponent(bathroom: Bathroom, userId: string | null) {
  let bathrooms : Bathroom [] = [bathroom];
  const mockSetBathrooms = vi.fn((newBathrooms) => {
    bathrooms = newBathrooms;
  });
  let selected : Bathroom = bathroom;
  const mockSetSelected = vi.fn((newSelected) => {
    selected = newSelected;
  });

  render(
      <BathroomContext value={{
        bathrooms,
        setBathrooms: mockSetBathrooms,
        selected,
        setSelected: mockSetSelected,
      }}>
        <Like
          userId={userId}
        />
      </BathroomContext>,
  );
}

beforeAll(() => server.listen());

afterEach(async () => {
  cleanup();
  server.resetHandlers();
  vi.resetAllMocks();
});

afterAll(() => server.close());

it('renders bathroom as unliked when get request fails', () => {
  const getReponse = HttpResponse.json([], {status: 400});
  const postResponse = HttpResponse.json({status: 201});
  const deleteResponse = HttpResponse.json({status: 200});
  setupHttpRequests(getReponse, postResponse, deleteResponse);

  renderLikeComponent(bathroomWith4Likes, userId);

  screen.getByLabelText(`Like ${bathroomWith4Likes.name}`);
});

describe('Like component when post request fails', () => {
  beforeEach(() => {
    const getReponse = HttpResponse.json([], {status: 200});
    const postResponse = HttpResponse.json(
        {errorMessage: 'Failed to like bathroom'},
        {status: 400},
    );
    const deleteResponse = HttpResponse.json({status: 200});
    setupHttpRequests(getReponse, postResponse, deleteResponse);

    renderLikeComponent(bathroomWith4Likes, userId);
  });

  it('keeps unliked state', async () => {
    await userEvent.click(
        screen.getByLabelText(`Like ${bathroomWith4Likes.name}`),
    );

    await screen.getByLabelText(`Like ${bathroomWith4Likes.name}`);
  });

  it('doesn\'t change # of likes', async () => {
    await userEvent.click(
        screen.getByLabelText(`Like ${bathroomWith4Likes.name}`),
    );

    screen.findByText('4');
  });
});

describe('Like component when delete request fails', () => {
  beforeEach(() => {
    const getReponse = HttpResponse.json(
        [bathroomWith4Likes.id],
        {status: 200},
    );
    const postResponse = HttpResponse.json({status: 201});
    const deleteResponse = HttpResponse.json(
        {errorMessage: 'Failed to unlike bathroom'},
        {status: 404},
    );

    setupHttpRequests(getReponse, postResponse, deleteResponse);

    renderLikeComponent(bathroomWith4Likes, userId);
  });

  it('keeps liked state', async () => {
    const likedButton = await waitFor(() => {
      return screen.getByLabelText(`Unlike ${bathroomWith4Likes.name}`);
    });
    await userEvent.click(likedButton);
    await waitFor(() => {
      return screen.getByLabelText(`Unlike ${bathroomWith4Likes.name}`);
    });
  });

  it('doesn\'t change # of likes', async () => {
    const likedButton = await waitFor(() => {
      return screen.getByLabelText(`Unlike ${bathroomWith4Likes.name}`);
    });
    await userEvent.click(likedButton);
    await waitFor(() => {
      screen.getByText('4');
    });
  });
});

describe('Like component when user not logged in', async () => {
  beforeEach(() => {
    const getResponse = HttpResponse.json([], {status: 200});
    const postResponse = HttpResponse.json({status: 201});
    const deleteResponse = HttpResponse.json({status: 200});
    setupHttpRequests(getResponse, postResponse, deleteResponse);

    renderLikeComponent(basicBathroom, null);
  });

  it('doesn\'t render like button', async () => {
    expect(screen.queryByLabelText(`Like ${basicBathroom.name}`)).toBeNull();
  });
});

describe('Like component when user logged in', async () => {
  beforeEach(() => {
    const getResponse = HttpResponse.json([], {status: 200});
    const postResponse = HttpResponse.json({status: 201});
    const deleteResponse = HttpResponse.json({status: 200});
    setupHttpRequests(getResponse, postResponse, deleteResponse);

    renderLikeComponent(basicBathroom, userId);
  });

  it('renders like button', async () => {
    screen.getByLabelText(`Like ${basicBathroom.name}`);
  });

  it('toggles like on click', async () => {
    const likeButton = screen.getByLabelText(`Like ${basicBathroom.name}`);
    await userEvent.click(likeButton);
    screen.findByLabelText(`Unlike ${basicBathroom.name}`);
  });

  it('renders number of likes when bathroom is liked', async () => {
    const likeButton = screen.getByLabelText(`Like ${basicBathroom.name}`);
    await userEvent.click(likeButton);
    screen.findByText('1');
  });
});


describe('Already liked bathroom', async () => {
  beforeEach(() => {
    const getResponse = HttpResponse.json(
        [bathroomWith4Likes.id],
        {status: 200},
    );
    const postResponse = HttpResponse.json({status: 201});
    const deleteResponse = HttpResponse.json({status: 200});
    setupHttpRequests(getResponse, postResponse, deleteResponse);

    renderLikeComponent(bathroomWith4Likes, userId);
  });

  it('renders liked button', async () => {
    screen.findByLabelText(`Unlike ${bathroomWith4Likes.name}`);
  });

  it('renders number of likes when > 0', async () => {
    screen.findByText('4');
  });

  it('toggles unlike on click', async () => {
    const likedButton = await waitFor(() => {
      return screen.getByLabelText(`Unlike ${bathroomWith4Likes.name}`);
    });
    await userEvent.click(likedButton);
    screen.findByLabelText(`Like ${bathroomWith4Likes.name}`);
  });

  it('removes a like on click', async () => {
    const likedButton = await waitFor(() => {
      return screen.getByLabelText(`Unlike ${bathroomWith4Likes.name}`);
    });
    await userEvent.click(likedButton);
    screen.findByText('3');
  });
});
