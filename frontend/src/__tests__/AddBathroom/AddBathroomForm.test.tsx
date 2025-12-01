import {useState} from 'react';
import {
  describe,
  it,
  afterEach,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {http, HttpResponse} from 'msw';
import {setupServer} from 'msw/node';
import { API_BASE_URL } from '../../utils/api';

import AddBathroomPage from '../../components/AddBathroom/AddBathroomForm';

const URL = API_BASE_URL + '/bathroom';

const server = setupServer();

type PageWrapperProps = {
  open?: boolean;
  name?: string;
  description?: string;
};

/**
 * @param {object} props props
 * @returns {object} page
 */
function AddBathroomWrapper(props: PageWrapperProps) {
  const {
    open: initialOpen = true,
    name = 'Valid Name',
    description = 'Valid Description',
  } = props;
  const [open, setOpen] = useState(initialOpen);
  return (
    <AddBathroomPage
      open={open}
      onClose={() => setOpen(false)}
      onOpen={() => {}}
      onCreated={() => setOpen(false)}
      name={name}
      description={description}
      position={{lat: 36.123456, lng: -122.654321}}
      onNameChange={() => {}}
      onDescriptionChange={() => {}}
    />
  );
}
beforeAll(() => server.listen());

afterEach(() => {
  server.resetHandlers();
  cleanup();
});

afterAll(() => server.close());

describe('Renders', async () => {
  it('Title', () => {
    render(<AddBathroomWrapper />);

    screen.getByText('New Bathroom');
  });

  it('Name and Description Input fields', () => {
    render(<AddBathroomWrapper />);

    screen.getByText('Bathroom Name');
    screen.getByText('Bathroom Description');
  });

  it('Save and Cancel buttons', () => {
    render(<AddBathroomWrapper />);

    screen.getByText('Cancel');
    screen.getByText('Save');
  });

  it('Selected location', () => {
    render(<AddBathroomWrapper />);

    screen.getByText('Location: 36.123456, -122.654321');
  });

  it('does not render content when closed', () => {
    render(<AddBathroomWrapper open={false} />);

    expect(screen.queryByText('New Bathroom')).toBeNull();
  });

  it('Additional details', async () => {
    render(<AddBathroomWrapper />);
    screen.getByText('Additional Details (Optional)');
    // label is only present if options are
    screen.getByText('Gender:');
    screen.getByText('Amenities:');
  });

  it('Options have the select label by default', async () => {
    render(<AddBathroomWrapper />);
    // check one from each group
    screen.getByLabelText('Select Female');
    screen.getByLabelText('Select Toilet Paper');
  });
});

describe('Does not submit with missing property', async () => {
  it('Name is empty', () => {
    render(<AddBathroomWrapper name="" />);

    fireEvent.click(screen.getByText('Save'));
    // form should still be open
    screen.queryByText('New Bathroom');
  });

  it('Description is empty', () => {
    render(<AddBathroomWrapper description="" />);

    fireEvent.click(screen.getByText('Save'));
    // form should still be open
    screen.queryByText('New Bathroom');
  });
});

/**
 * Mock a put request to the server with the given bathroom and status code
 * @param {number} status mocked server status
 */
function mockServer(status: number) {
  server.use(
      http.post(URL, async () => {
        return HttpResponse.json({status});
      }),
  );
}

it('Basic Bathroom created successfully', async () => {
  mockServer(204);
  render(<AddBathroomWrapper />);

  fireEvent.click(screen.getByText('Save'));
  await waitFor(() =>
    expect(screen.queryByText('New Bathroom')).toBeNull(),
  );
});

it('does not call onCreated when error', async () => {
  mockServer(404);
  render(<AddBathroomWrapper />);

  fireEvent.click(screen.getByText('Save'));
  // form should still be open
  screen.queryByText('New Bathroom');
});

/**
 * Click on the element with the given label
 * @param {string} label element label
 */
async function clickOn(label: string) {
  const elem = await screen.findByLabelText(label);
  fireEvent.click(elem);
}
describe('Selecting additional details', async () => {
  beforeEach(() => {
    render(<AddBathroomWrapper />);
  });

  it('Changes label to unselect when chip is selected', async () => {
    await clickOn('Select Female');
    screen.getByLabelText('Unselect Female');
  });

  it('Changes label back if chip is clicked again', async () => {
    await clickOn('Select Female');
    await clickOn('Unselect Female');
    screen.getByLabelText('Select Female');
  });

  it('Can create a bathroom with gender info selected', async () => {
    mockServer(204);
    const chip = screen.getByLabelText('Select Female');
    fireEvent.click(chip);
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() =>
      expect(screen.queryByText('New Bathroom')).toBeNull(),
    );
  });

  it('Can select multiple gender options', async () => {
    await clickOn('Select Female');
    await clickOn('Select Gender Neutral');
    const femaleChip = screen.queryByLabelText('Unselect Female');
    const genderNeutralChip = screen
        .queryByLabelText('Unselect Gender Neutral');
    expect(femaleChip && genderNeutralChip).toBeTruthy();
  });

  it('Can create a bathroom with amenity info selected', async () => {
    mockServer(204);
    const chip = screen.getByLabelText('Select Toilet Paper');
    fireEvent.click(chip);
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() =>
      expect(screen.queryByText('New Bathroom')).toBeNull(),
    );
  });

  it('Can select multiple amenity options', async () => {
    await clickOn('Select Mirror');
    await clickOn('Select Toilet Paper');
    const mirrorChip = screen.queryByLabelText('Unselect Mirror');
    const tolietPaperChip = screen
        .queryByLabelText('Unselect Toilet Paper');
    expect(mirrorChip && tolietPaperChip).toBeTruthy();
  });
});

describe('Closing the bathroom form', async () => {
  it('closes when cancel button clicked', async () => {
    render(<AddBathroomWrapper />);

    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() =>
      expect(screen.queryByText('New Bathroom')).toBeNull(),
    );
  });

  it('closes when dragged down', async () => {
    render(<AddBathroomWrapper />);

    const handle = screen.getByLabelText('Close drawer by dragging');

    // mouse drag down
    fireEvent.mouseDown(handle, {clientY: 100});
    fireEvent.mouseMove(window, {clientY: 300});
    fireEvent.mouseUp(window, {clientY: 300});

    await waitFor(() =>
      expect(screen.queryByText('New Bathroom')).toBeNull(),
    );
  });

  it('does not close when small drag down', async () => {
    render(<AddBathroomWrapper />);

    const handle = screen.getByLabelText('Close drawer by dragging');

    // mouse drag down
    fireEvent.mouseDown(handle, {clientY: 100});
    fireEvent.mouseMove(window, {clientY: 105});
    fireEvent.mouseUp(window, {clientY: 105});

    await waitFor(() =>
      screen.queryByText('New Bathroom'),
    );
  });
});
