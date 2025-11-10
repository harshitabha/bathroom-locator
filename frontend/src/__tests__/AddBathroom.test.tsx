import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddBathroomPage from '../components/AddBathroom';
import React from 'react';
import { mockMatchMedia } from '../__test-helpers__/testUtils';

const basePosition = { lat: 36.99, lng: -122.0589 };

describe('AddBathroomPage — mobile drawer (isSmall=true)', () => {
  beforeEach(() => mockMatchMedia(true));

  function renderMobile(
    overrides: Partial<React.ComponentProps<typeof AddBathroomPage>> = {}
  ) {
    const onClose = vi.fn();
    const onSubmit = vi.fn();
    const onNameChange = vi.fn();
    const onDetailsChange = vi.fn();

    render(
      <AddBathroomPage
        open
        onClose={onClose}
        onSubmit={onSubmit}
        onOpen={vi.fn()}
        position={overrides.position === undefined ? basePosition : overrides.position}
        name={overrides.name ?? ''}
        details={overrides.details ?? ''}
        onNameChange={overrides.onNameChange ?? onNameChange}
        onDetailsChange={overrides.onDetailsChange ?? onDetailsChange}
      />
    );
    return { onClose, onSubmit, onNameChange, onDetailsChange };
  }

  it('renders fields and location line', () => {
    renderMobile({ name: 'A', details: 'B' });

    expect(
      screen.getByRole('heading', { name: /new bathroom/i })
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/bathroom name/i)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/bathroom description/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/location:/i)).toHaveTextContent('36.990000');
    expect(screen.getByText(/location:/i)).toHaveTextContent('-122.058900');
  });

  it('calls onClose (and not onSubmit) when Cancel is clicked', async () => {
    const user = userEvent.setup();
    const { onClose, onSubmit } = renderMobile({ name: 'X', details: 'Y' });

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('passes trimmed values and position to onSubmit when Save is clicked', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderMobile({
      name: '   Cowell Restroom   ',
      details: '  near lobby ',
      position: basePosition,
    });

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Cowell Restroom',
        details: 'near lobby',
        position: basePosition,
      })
    );
  });

  it('does not call onSubmit when name is blank', async () => {
    const user = userEvent.setup();

    const { onSubmit } = renderMobile({
      name: '   ',
      details: 'some description',
      position: basePosition,
    });

    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmit when description is blank', async () => {
    const user = userEvent.setup();

    const { onSubmit } = renderMobile({
      name: 'Library Bathroom',
      details: '   ',
      position: basePosition,
    });

    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmit when position is missing', async () => {
    const user = userEvent.setup();

    const { onSubmit } = renderMobile({
      name: 'Library Bathroom',
      details: 'near lobby',
      position: null,
    });

    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe('AddBathroomPage — desktop dialog (isSmall=false)', () => {
  beforeEach(() => mockMatchMedia(false));

  it('renders dialog and calls onSubmit with values on Save', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const onClose = vi.fn();

    render(
      <AddBathroomPage
        open
        onClose={onClose}
        onSubmit={onSubmit}
        position={basePosition}
        name="S&E Building"
        details="first floor"
        onNameChange={vi.fn()}
        onDetailsChange={vi.fn()}
      />
    );

    // dialog fields exist
    expect(
      screen.getByLabelText(/bathroom name/i)
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'S&E Building',
        details: 'first floor',
        position: basePosition,
      })
    );

    // Cancel still calls onClose in desktop mode
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onSubmit when name is blank', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AddBathroomPage
        open
        onClose={vi.fn()}
        onSubmit={onSubmit}
        position={basePosition}
        name="   "
        details="first floor"
        onNameChange={vi.fn()}
        onDetailsChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('does not call onSubmit when description is blank', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <AddBathroomPage
        open
        onClose={vi.fn()}
        onSubmit={onSubmit}
        position={basePosition}
        name="S&E Building"
        details="   "
        onNameChange={vi.fn()}
        onDetailsChange={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});