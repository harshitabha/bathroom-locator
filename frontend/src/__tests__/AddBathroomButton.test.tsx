import {describe, it, afterEach, expect, vi} from 'vitest';
import {render, screen, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomButton from '../components/AddBathroomButton';

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('AddBathroomButton', () => {
  it('renders the button', () => {
    render(<AddBathroomButton onClick={() => {}} />);

    const button = screen.getByLabelText('Add a bathroom');
    expect(button).toBeInTheDocument();
  });
});
