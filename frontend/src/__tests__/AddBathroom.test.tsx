import type React from 'react';
import AddBathroom from '../components/AddBathroom';
import {
  describe,
  it,
  afterEach,
  expect,
  vi,
} from 'vitest';
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

describe('AddBathroom component', () => {
  const basePosition = {lat: 36.991, lng: -122.059};

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  /**
   * Render the AddBathroom component with default props
   * @param {object} overrides Props to override for this render
   * @returns {object} Object containing onClose and onSubmit
   */
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
    return {onClose, onSubmit};
  }

  it('shows the dialog title when open', () => {
    renderAddBathroom();
    screen.getByText('New Bathroom');
  });

  it('shows the Bathroom Name label when open', () => {
    renderAddBathroom();
    screen.getByText('Bathroom Name');
  });

  it('shows the Bathroom Description label when open', () => {
    renderAddBathroom();
    screen.getByText('Bathroom Description');
  });

  it('shows the Cancel button when open', () => {
    renderAddBathroom();
    screen.getByRole('button', {name: 'Cancel'});
  });

  it('shows the Save button when open', () => {
    renderAddBathroom();
    screen.getByRole('button', {name: 'Save'});
  });

  it('shows the location text when position is provided', () => {
    renderAddBathroom({
      position: {lat: 36.1234567, lng: -122.7654321},
    });

    screen.getByText('Location: 36.123457, -122.765432');
  });

  it('does not show location text when position is null', () => {
    renderAddBathroom({position: null});
    expect(screen.queryByText(/location:/i)).toBeNull();
  });

  it('calls onClose when the Cancel button is clicked', () => {
    const {onClose} = renderAddBathroom();

    const cancelButton = screen.getByRole('button', {name: /cancel/i});
    fireEvent.click(cancelButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit once when all fields are valid', async () => {
    const {onSubmit} = renderAddBathroom({
      name: 'My Bathroom',
      details: 'Near the blue door on the left',
      onNameChange: vi.fn(),
      onDetailsChange: vi.fn(),
    });

    const nameInput = screen.getByRole('textbox', {name: 'Bathroom Name'});
    const detailsInput = screen.getByRole('textbox', {
      name: 'Bathroom Description',
    });

    fireEvent.change(nameInput, {target: {value: 'My Bathroom'}});
    fireEvent.change(detailsInput, {
      target: {value: 'Near the blue door on the left'},
    });

    const saveButton = screen.getByRole('button', {name: /save/i});
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it(
      'passes trimmed values and position to onSubmit when fields are valid',
      async () => {
        const {onSubmit} = renderAddBathroom({
          name: '   My Bathroom   ',
          details: '  Near the blue door on the left   ',
          onNameChange: vi.fn(),
          onDetailsChange: vi.fn(),
        });

        const nameInput = screen.getByRole('textbox', {
          name: 'Bathroom Name',
        });
        const detailsInput = screen.getByRole('textbox', {
          name: 'Bathroom Description',
        });

        fireEvent.change(nameInput, {
          target: {value: '   My Bathroom   '},
        });
        fireEvent.change(detailsInput, {
          target: {value: '  Near the blue door on the left   '},
        });

        const saveButton = screen.getByRole('button', {name: /save/i});
        fireEvent.click(saveButton);

        await waitFor(() => {
          expect(onSubmit).toHaveBeenCalledWith({
            name: 'My Bathroom',
            details: 'Near the blue door on the left',
            position: {
              lat: 36.991,
              lng: -122.059,
            },
          });
        });
      },
  );

  it('does not call onSubmit when name is empty', async () => {
    const {onSubmit} = renderAddBathroom({
      name: '   ',
      details: 'Some details',
    });

    const saveButton = screen.getByRole('button', {name: /save/i});
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('does not call onSubmit when details are empty', async () => {
    const {onSubmit} = renderAddBathroom({
      name: 'Some name',
      details: '   ',
    });

    const saveButton = screen.getByRole('button', {name: /save/i});
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
