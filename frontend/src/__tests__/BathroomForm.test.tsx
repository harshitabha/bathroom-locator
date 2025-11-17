import {useState} from 'react';
import type React from 'react';
import BathroomForm from '../components/BathroomForm';
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

describe('BathroomForm', () => {
  const basePosition = {lat: 36.991, lng: -122.059};

  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  /**
   * Render the BathroomForm component with local state
   * @param {Partial<React.ComponentProps<typeof BathroomForm>>} overrides
   * Props to override
   * @returns {{ onSubmit: ReturnType<typeof vi.fn> }} mocked onSubmit function
   */
  function renderAddBathroom(
      overrides: Partial<React.ComponentProps<typeof BathroomForm>> = {},
  ) {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    /**
     * @returns {React.ReactElement} Wrapped BathroomForm component
     */
    function Wrapper() {
      const [name, setName] = useState(overrides.name ?? '');
      const [details, setDetails] = useState(overrides.details ?? '');
      const [resetToken] = useState(overrides.resetToken ?? 0);

      return (
        <BathroomForm
          open={overrides.open ?? true}
          onClose={overrides.onClose ?? (() => {})}
          onOpen={overrides.onOpen}
          position={overrides.position ?? basePosition}
          name={name}
          details={details}
          onNameChange={(next: string) => {
            setName(next);
            overrides.onNameChange?.(next);
          }}
          onDetailsChange={(next: string) => {
            setDetails(next);
            overrides.onDetailsChange?.(next);
          }}
          onSubmit={async (payload) => {
            await onSubmit(payload);
            return overrides.onSubmit?.(payload);
          }}
          onCancelFull={overrides.onCancelFull}
          resetToken={resetToken}
        />
      );
    }

    render(<Wrapper />);
    return {onSubmit};
  }

  const fillFormAndSubmit = async (
      name: string,
      details: string,
  ) => {
    const nameInput = screen.getByLabelText(/Bathroom Name/i);
    const detailsInput = screen.getByLabelText(/Bathroom Description/i);

    fireEvent.change(nameInput, {target: {value: name}});
    fireEvent.change(detailsInput, {target: {value: details}});

    const saveButton = screen.getByRole('button', {name: 'Save'});
    fireEvent.click(saveButton);
  };

  it('renders the dialog title when open', () => {
    renderAddBathroom();

    screen.getByText('New Bathroom');
  });

  it('renders the Bathroom Name field label', () => {
    renderAddBathroom();

    screen.getByText('Bathroom Name');
  });

  it('renders the Bathroom Description field label', () => {
    renderAddBathroom();

    screen.getByText('Bathroom Description');
  });

  it('renders the Cancel button', () => {
    renderAddBathroom();

    screen.getByRole('button', {name: 'Cancel'});
  });

  it('renders the Save button', () => {
    renderAddBathroom();

    screen.getByRole('button', {name: 'Save'});
  });

  it('shows the formatted location when position is provided', () => {
    renderAddBathroom({
      position: {lat: 36.1234567, lng: -122.7654321},
    });

    screen.getByText('Location: 36.123457, -122.765432');
  });

  it(
      'calls onSubmit with trimmed values and position when fields are valid',
      async () => {
        const {onSubmit} = renderAddBathroom();

        await fillFormAndSubmit(
            '   My Bathroom   ',
            '  Near the blue door on the left   ',
        );

        await waitFor(() => {
          expect(onSubmit).toHaveBeenCalledWith({
            name: 'My Bathroom',
            details: 'Near the blue door on the left',
            position: basePosition,
          });
        });
      },
  );

  it('does not call onSubmit when name is empty', async () => {
    const {onSubmit} = renderAddBathroom();

    await fillFormAndSubmit('   ', 'Some details');

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  it('does not call onSubmit when details are empty', async () => {
    const {onSubmit} = renderAddBathroom();

    await fillFormAndSubmit('Some name', '   ');

    await waitFor(() => {
      expect(onSubmit).not.toHaveBeenCalled();
    });
  });
});
