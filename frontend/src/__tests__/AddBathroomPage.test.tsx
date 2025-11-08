import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddBathroomPage from '../components/AddBathroomPage';
import React from 'react';

function mockMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

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
        position={overrides.position ?? basePosition}
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

    expect(screen.getByRole('heading', { name: /new bathroom/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/bathroom name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bathroom description/i)).toBeInTheDocument();
    expect(screen.getByText(/location:/i)).toHaveTextContent('36.990000');
    expect(screen.getByText(/location:/i)).toHaveTextContent('-122.058900');
  });

  it('Cancel calls onClose (and does not submit)', async () => {
    const user = userEvent.setup();
    const { onClose, onSubmit } = renderMobile({ name: 'X' });

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('Save trims values and calls onSubmit when name+position provided', async () => {
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
      
    // component intentionally doesn't auto close here
  });

  it('Save is a no-op if missing name or position', async () => {
    const user = userEvent.setup();

    // no name
    const a = renderMobile({ name: '   ', position: basePosition });
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(a.onSubmit).not.toHaveBeenCalled();

    // no position
    const b = renderMobile({ name: 'Lib', position: null });
    await user.click(screen.getAllByRole('button', { name: /save/i })[1]); // second instance
    expect(b.onSubmit).not.toHaveBeenCalled();
  });
});

describe('AddBathroomPage — desktop dialog (isSmall=false)', () => {
  beforeEach(() => mockMatchMedia(false));

  it('renders dialog and allows Save', async () => {
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
    expect(screen.getByLabelText(/bathroom name/i)).toBeInTheDocument();

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
});
