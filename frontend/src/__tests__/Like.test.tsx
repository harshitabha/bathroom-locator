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


const bathroom : Bathroom = {
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

const bathroomWith4Likes : Bathroom = {
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
  likes: 4,
};

const userId = '6697fe75-586e-4f24-9c56-243d15d1d9f0';

const URL = 'http://localhost:3000/user/likes';

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
 */
function renderLikeComponent(bathroom: Bathroom) {
  let likes : number = bathroom.likes;
  const setLikesMock = vi.fn((newLikes) => {
    likes = newLikes;
  });

  render(
      <Like
        bathroom={bathroom}
        userId={userId}
        likes={likes}
        setLikes={setLikesMock}
      />,
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

  renderLikeComponent(bathroomWith4Likes);

  expect(screen.getByLabelText(`Like ${bathroom.name}`));
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

    renderLikeComponent(bathroomWith4Likes);
  });

  it('keeps unliked state', async () => {
    await userEvent.click(screen.getByLabelText(`Like ${bathroom.name}`));

    const unlikedButton = await screen.getByLabelText(`Like ${bathroom.name}`);
    expect(unlikedButton);
  });

  it('doesn\'t change # of likes', async () => {
    await userEvent.click(screen.getByLabelText(`Like ${bathroom.name}`));

    await waitFor(() => {
      expect(screen.getByText('4'));
    });
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

    renderLikeComponent(bathroomWith4Likes);
  });

  it('keeps liked state', async () => {
    const likedButton = await waitFor(() => {
      return screen.getByLabelText(`Unlike ${bathroom.name}`);
    });
    await userEvent.click(likedButton);
    expect(await waitFor(() => {
      return screen.getByLabelText(`Unlike ${bathroom.name}`);
    }));
  });

  it('doesn\'t change # of likes', async () => {
    const likedButton = await waitFor(() => {
      return screen.getByLabelText(`Unlike ${bathroom.name}`);
    });
    await userEvent.click(likedButton);
    await waitFor(() => {
      expect(screen.getByText('4'));
    });
  });
});

describe('Like component', async () => {
  let likes: number = bathroom.likes;
  beforeEach(() => {
    const getResponse = HttpResponse.json([], {status: 200});
    const postResponse = HttpResponse.json({status: 201});
    const deleteResponse = HttpResponse.json({status: 200});
    setupHttpRequests(getResponse, postResponse, deleteResponse);

    const setLikesMock = vi.fn((newLikes) => {
      likes = newLikes;
    });

    render(
        <Like
          bathroom={bathroom}
          userId={userId}
          likes={likes}
          setLikes={setLikesMock}
        />,
    );
  });

  it('renders like button', async () => {
    expect(screen.getByLabelText(`Like ${bathroom.name}`));
  });

  it('toggles like on click', async () => {
    const likeButton = screen.getByLabelText(`Like ${bathroom.name}`);
    await userEvent.click(likeButton);
    await waitFor(() => {
      expect(screen.getByLabelText(`Unlike ${bathroom.name}`));
    });
  });

  it('renders number of likes when bathroom is liked', async () => {
    const likeButton = screen.getByLabelText(`Like ${bathroom.name}`);
    await userEvent.click(likeButton);
    await waitFor(() => {
      expect(screen.getByText('1'));
    });
  });
});


describe('Already liked bathroom', async () => {
  let likes: number = bathroomWith4Likes.likes;
  beforeEach(() => {
    server.use(
        // get user's likes
        http.get(URL + '*', async () => {
          return HttpResponse.json([bathroom.id], {status: 200});
        }),
        // add user like
        http.post(URL, async () => {
          return HttpResponse.json({status: 201});
        }),
        // remove user like
        http.delete(URL, async () => {
          return HttpResponse.json({status: 200});
        }),
    );

    const setLikesMock = vi.fn((newLikes) => {
      likes = newLikes;
    });

    render(
        <Like
          bathroom={bathroomWith4Likes}
          userId={userId}
          likes={likes}
          setLikes={setLikesMock}
        />,
    );
  });

  it('renders liked button', async () => {
    await waitFor(() => {
      expect(screen.getByLabelText(`Unlike ${bathroom.name}`));
    });
  });

  it('renders number of likes when > 0', async () => {
    await waitFor(() => {
      expect(screen.getByText('4'));
    });
  });

  it('toggles unlike on click', async () => {
    const likedButton = await waitFor(() => {
      return screen.getByLabelText(`Unlike ${bathroom.name}`);
    });
    await userEvent.click(likedButton);
    await waitFor(() => {
      expect(screen.getByLabelText(`Like ${bathroom.name}`));
    });
  });

  it('removes a like on click', async () => {
    const likedButton = await waitFor(() => {
      return screen.getByLabelText(`Unlike ${bathroom.name}`);
    });
    await userEvent.click(likedButton);
    await waitFor(() => {
      expect(screen.getByText('3'));
    });
  });
});
