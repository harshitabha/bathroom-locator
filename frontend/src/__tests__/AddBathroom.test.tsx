import AddBathroom from '../components/AddBathroom';
import {describe, it, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<any>('@mui/material');
  return {
    ...actual,
    useMediaQuery: () => false,
  };
});

describe('AddBathroom component', () => {
  const basePosition = {lat: 36.991, lng: -122.059};
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });
  function renderAddBathroom(
    overrides: Partial<React.ComponentProps<typeof AddBathroom>> = {},
  ) {
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const props: React.ComponentProps<typeof AddBathroom> = {
      open: true,
      onClose,
      onOpen: undefined,
      position: basePosition,
      name: '',
      details: '',
      onNameChange: () => {},
      onDetailsChange: () => {},
      onSubmit,
      onCancelFull: undefined,
      resetToken: 0,
      ...overrides,
    };
    render(<AddBathroom {...props} />);
    return {onClose, onSubmit, props};
  }

  it('renders dialog with title and form fields when open', () => {
    renderAddBathroom();
    expect(screen.getByText('New Bathroom')).toBeInTheDocument();
    expect(screen.getByLabelText(/Bathroom Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Bathroom Description/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Save'})).toBeInTheDocument();
  });

  it('shows the location text when position is provided', () => {
    renderAddBathroom({
      position: {lat: 36.1234567, lng: -122.7654321},
    });

    expect(
      screen.getByText('Location: 36.123457, -122.765432'),
    ).toBeInTheDocument();
  });

  it('does not show location text when position is null', () => {
    renderAddBathroom({position: null});
    expect(
      screen.queryByText(/Location:/i),
    ).not.toBeInTheDocument();
  });

  it('calls onClose when the Cancel button is clicked', () => {
    const {onClose} = renderAddBathroom();

    const cancelButton = screen.getByRole('button', {name: 'Cancel'});
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit with trimmed values when all fields are valid', async () => {
    const {onSubmit} = renderAddBathroom({
      name: 'My Bathroom',
      details: 'Near the blue door on the left',
      onNameChange: vi.fn(),
      onDetailsChange: vi.fn(),
    });

    const nameInput = screen.getByLabelText(/Bathroom Name/i);
    const detailsInput = screen.getByLabelText(/Bathroom Description/i);

    fireEvent.change(nameInput, {target: {value: 'My Bathroom'}});
    fireEvent.change(detailsInput, {
      target: {value: 'Near the blue door on the left'},
    });

    const saveButton = screen.getByRole('button', {name: 'Save'});
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'My Bathroom',
        details: 'Near the blue door on the left',
        position: {lat: 36.991, lng: -122.059},
      });
    });
  });

  it('does not call onSubmit when position is missing', async () => {
    const {onSubmit} = renderAddBathroom({
      position: null,
      name: 'Some name',
      details: 'Some details',
    });

    const saveButton = screen.getByRole('button', {name: 'Save'});
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('does not call onSubmit when name is empty', async () => {
    const {onSubmit} = renderAddBathroom({
      name: ' ',
      details: 'Some details',
    });

    const saveButton = screen.getByRole('button', {name: 'Save'});
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('does not call onSubmit when details are empty', async () => {
    const {onSubmit} = renderAddBathroom({
      name: 'Some name',
      details: ' ',
    });

    const saveButton = screen.getByRole('button', {name: 'Save'});
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});