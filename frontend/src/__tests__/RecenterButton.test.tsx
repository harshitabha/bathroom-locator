import {describe, it, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import RecenterButton from '../components/RecenterButton';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('RecenterButton', () => {
  it('renders the recenter button', () => {
    render(<RecenterButton onClick={() => {}} />);
    screen.getByLabelText('Recenter map');
  });

  it('calls panTo when clicked', () => {
    const panToMock = vi.fn();
    render(<RecenterButton onClick={panToMock} />);

    fireEvent.click(screen.getByLabelText('Recenter map'));
    expect(panToMock).toHaveBeenCalled();
  });
});
