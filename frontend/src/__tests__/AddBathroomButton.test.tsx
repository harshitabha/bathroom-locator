import {describe, it, afterEach, expect, vi} from 'vitest';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomButton from '../components/AddBathroomButton';

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('AddBathroomButton', () => {
  it('renders the button', () => {
    render(<AddBathroomButton onClick={() => {}} />);

    const button = screen.getByRole('button', {name: 'Add a bathroom'});
    expect(button).toBeInTheDocument();
  });

  it('calls onClick when pressed', () => {
    const onClick = vi.fn();

    render(<AddBathroomButton onClick={onClick} />);

    const button = screen.getByRole('button', {name: 'Add a bathroom'});
    fireEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
