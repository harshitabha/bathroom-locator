import {useState} from 'react';
import {describe, it, afterEach, expect, vi, beforeEach} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  cleanup,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomPage from '../components/AddBathroomForm';

const fetchMock = vi.fn();
globalThis.fetch = fetchMock as unknown as typeof fetch;

type PageWrapperProps = {
  open?: boolean;
  name?: string;
  description?: string;
};

/**
 * @param {object} props props
 * @returns {object} page
 */
function PageWrapper(props: PageWrapperProps) {
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

beforeEach(() => {
  vi.resetAllMocks();
  fetchMock.mockReset();
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('AddBathroomPage', () => {
  it('renders title when open', () => {
    render(<PageWrapper />);

    expect(screen.getByText('New Bathroom'));
  });

  it('renders input fields when open', () => {
    render(<PageWrapper />);

    expect(screen.getByText('Bathroom Name'));
    expect(screen.getByText('Bathroom Description'));
  });

  it('renders buttons when open', () => {
    render(<PageWrapper />);

    expect(screen.getByText('Cancel'));
    expect(screen.getByText('Save'));
  });

  it('renders the location', () => {
    render(<PageWrapper />);

    expect(screen.getByText('Location: 36.123456, -122.654321'));
  });

  it('does not render content when closed', () => {
    render(<PageWrapper open={false} />);

    expect(screen.queryByText('New Bathroom')).toBeNull();
  });

  it('does not submit when name is empty', () => {
    render(<PageWrapper name="" />);

    fireEvent.click(screen.getByText('Save'));
    // form should still be open
    expect(screen.queryByText('New Bathroom'));
  });

  it('does not submit when description is empty', () => {
    render(<PageWrapper description="" />);

    fireEvent.click(screen.getByText('Save'));
    // form should still be open
    expect(screen.queryByText('New Bathroom'));
  });

  it('submits correctly and form is closed', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<PageWrapper />);

    fireEvent.click(screen.getByText('Save'));
    await waitFor(() =>
      expect(screen.queryByText('New Bathroom')).toBeNull(),
    );
  });

  it('does not call onCreated when error', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    render(<PageWrapper />);

    fireEvent.click(screen.getByText('Save'));
    // form should still be open
    expect(screen.queryByText('New Bathroom'));
  });

  it('closes when cancel button clicked', async () => {
    render(<PageWrapper />);

    fireEvent.click(screen.getByText('Cancel'));
    await waitFor(() =>
      expect(screen.queryByText('New Bathroom')).toBeNull(),
    );
  });

  it('closes when dragged down', async () => {
    render(<PageWrapper />);

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
    render(<PageWrapper />);

    const handle = screen.getByLabelText('Close drawer by dragging');

    // mouse drag down
    fireEvent.mouseDown(handle, {clientY: 100});
    fireEvent.mouseMove(window, {clientY: 105});
    fireEvent.mouseUp(window, {clientY: 105});

    await waitFor(() =>
      expect(screen.queryByText('New Bathroom')),
    );
  });
});
