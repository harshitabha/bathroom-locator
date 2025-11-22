import {describe, it, afterEach, expect, vi} from 'vitest';
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

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('AddBathroomPage', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onOpen: vi.fn(),
    onCreated: vi.fn(),
    name: '',
    description: '',
    position: {lat: 36.123456, lng: -122.654321},
    onNameChange: vi.fn(),
    onDescriptionChange: vi.fn(),
  };

  it('renders content when open', () => {
    render(<AddBathroomPage {...defaultProps} open={true} />);

    expect(screen.getByText('New Bathroom')).toBeInTheDocument();
    expect(screen.getByText('Bathroom Name')).toBeInTheDocument();
    expect(screen.getByText('Bathroom Description')).toBeInTheDocument();
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
    const onCreated = vi.fn();

    render(
        <AddBathroomPage
          {...defaultProps}
          name=""
          description="Description"
          onCreated={onCreated}
        />,
    );

    fireEvent.click(screen.getByText('Save'));
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('does not submit when description is empty', () => {
    const onCreated = vi.fn();

    render(
        <AddBathroomPage
          {...defaultProps}
          name="Name"
          description=""
          onCreated={onCreated}
        />,
    );

    fireEvent.click(screen.getByText('Save'));
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('does not submit when no location is provided', () => {
    const onCreated = vi.fn();

    render(
        <AddBathroomPage
          {...defaultProps}
          name="Name"
          description="Description"
          position={null}
          onCreated={onCreated}
        />,
    );

    fireEvent.click(screen.getByText('Save'));
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('submits correctly and calls onCreated', async () => {
    const onCreated = vi.fn();

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    render(
        <AddBathroomPage
          {...defaultProps}
          name="Valid Name"
          description="Valid Description"
          onCreated={onCreated}
        />,
    );

    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
  });

  it('does not call onCreated when error', async () => {
    const onCreated = vi.fn();

    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({}),
    });

    render(
        <AddBathroomPage
          {...defaultProps}
          name="Valid Name"
          description="Valid Description"
          onCreated={onCreated}
        />,
    );

    fireEvent.click(screen.getByText('Save'));
    await waitFor(() => expect(onCreated).not.toHaveBeenCalled());
  });

  it('calls onClose when cancel button clicked', () => {
    const onClose = vi.fn();
    render(<AddBathroomPage {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
