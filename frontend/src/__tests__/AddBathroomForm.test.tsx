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

const onClose = vi.fn();
const onOpen = vi.fn();
const onCreated = vi.fn();
const onNameChange = vi.fn();
const onDescriptionChange = vi.fn();

const defaultProps = {
  open: true,
  onClose,
  onOpen,
  onCreated,
  name: 'Valid Name',
  description: 'Valid Description',
  position: {lat: 36.123456, lng: -122.654321},
  onNameChange,
  onDescriptionChange,
};

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
    render(<AddBathroomPage {...defaultProps} />);

    expect(screen.getByText('New Bathroom')).toBeInTheDocument();
  });

  it('renders input fields when open', () => {
    render(<AddBathroomPage {...defaultProps} />);

    expect(screen.getByText('Bathroom Name')).toBeInTheDocument();
    expect(screen.getByText('Bathroom Description')).toBeInTheDocument();
  });

  it('renders buttons when open', () => {
    render(<AddBathroomPage {...defaultProps} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(<AddBathroomPage {...defaultProps} open={false} />);

    expect(screen.queryByText('New Bathroom')).not.toBeInTheDocument();
  });

  it('renders the location if provided', () => {
    render(<AddBathroomPage {...defaultProps} />);

    expect(screen.getByText(
        'Location: 36.123456, -122.654321',
    )).toBeInTheDocument();
  });

  it('does not render location if not provided', () => {
    render(<AddBathroomPage {...defaultProps} position={null} />);

    expect(screen.queryByText('Location: ')).not.toBeInTheDocument();
  });

  it('does not submit when name is empty', () => {
    render(
        <AddBathroomPage
          {...defaultProps}
          name=""
        />,
    );

    fireEvent.click(screen.getByText('Save'));
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('does not submit when description is empty', () => {
    render(<AddBathroomPage {...defaultProps} description="" />);

    fireEvent.click(screen.getByText('Save'));
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('does not submit when no location is provided', () => {
    render(<AddBathroomPage {...defaultProps} position={null} />);

    fireEvent.click(screen.getByText('Save'));
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('submits correctly and calls onCreated', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(<AddBathroomPage {...defaultProps} />);

    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
  });

  it('does not call onCreated when error', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    render(<AddBathroomPage {...defaultProps} />);

    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(onCreated).not.toHaveBeenCalled());
  });

  it('closes when cancel button clicked', () => {
    render(<AddBathroomPage {...defaultProps} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
