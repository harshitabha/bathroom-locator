import {describe, it, expect, vi, afterEach} from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomPage from '../components/AddBathroomForm';

// mock fetch
const fetchMock = vi.fn();
global.fetch = fetchMock as unknown as typeof fetch;

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
    details: '',
    position: {lat: 36.123456, lng: -122.654321},
    onNameChange: vi.fn(),
    onDetailsChange: vi.fn(),
  };

  it('renders content when open', () => {
    render(<AddBathroomPage {...defaultProps} open={true} />);

    expect(screen.getByText(/new bathroom/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bathroom name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bathroom description/i)).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(<AddBathroomPage {...defaultProps} open={false} />);

    expect(screen.queryByText(/new bathroom/i)).not.toBeInTheDocument();
  });

  it('does not submit when name is empty', () => {
    const onCreated = vi.fn();

    render(
        <AddBathroomPage
          {...defaultProps}
          name=""
          details="Details"
          onCreated={onCreated}
        />,
    );

    fireEvent.click(screen.getByRole('button', {name: /save/i}));

    expect(onCreated).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does NOT submit when details are empty', () => {
    const onCreated = vi.fn();

    render(
        <AddBathroomPage
          {...defaultProps}
          name="Valid"
          details=""
          onCreated={onCreated}
        />,
    );

    fireEvent.click(screen.getByRole('button', {name: /save/i}));

    expect(onCreated).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('does NOT submit when no location is provided', () => {
    const onCreated = vi.fn();

    render(
        <AddBathroomPage
          {...defaultProps}
          name="Valid"
          details="Details"
          position={null}
          onCreated={onCreated}
        />,
    );

    fireEvent.click(screen.getByRole('button', {name: /save/i}));

    expect(onCreated).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('submits correctly and calls onCreated', async () => {
    const onCreated = vi.fn();

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: vi.fn().mockResolvedValue({}),
    });

    render(
        <AddBathroomPage
          {...defaultProps}
          name="Valid Name"
          details="Valid Description"
          onCreated={onCreated}
        />,
    );

    fireEvent.click(screen.getByRole('button', {name: /save/i}));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(onCreated).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onCreated when error', async () => {
    const onCreated = vi.fn();

    fetchMock.mockResolvedValueOnce({
      ok: false,
      json: vi.fn().mockResolvedValue({}),
    });

    render(
        <AddBathroomPage
          {...defaultProps}
          name="Valid Name"
          details="Valid Description"
          onCreated={onCreated}
        />,
    );

    fireEvent.click(screen.getByRole('button', {name: /save/i}));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
      expect(onCreated).not.toHaveBeenCalled();
    });
  });

  it('calls onClose when cancel button clicked', () => {
    const onClose = vi.fn();

    render(<AddBathroomPage {...defaultProps} onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', {name: /cancel/i}));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
