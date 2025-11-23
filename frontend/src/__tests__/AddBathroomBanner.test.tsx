import {useState} from 'react';
import {describe, it, afterEach, expect, beforeEach} from 'vitest';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomBanner from '../components/AddBathroomBanner';

/**
 * @returns {object} banner
 */
function BannerWrapper() {
  const [open, setOpen] = useState(true);
  return (
    <AddBathroomBanner bannerOpen={open} onCancel={() => setOpen(false)} />
  );
}

beforeEach(() => {
  render(<BannerWrapper />);
});

afterEach(() => {
  cleanup();
});

describe('AddBathroomBanner', () => {
  it('renders when opened', () => {
    expect(screen.getByLabelText('Bathroom banner'));
    expect(screen.getByText('Cancel'));
  });

  it('renders the message when opened', () => {
    expect(screen.getByText('Choose a location for the bathroom'));
  });

  it('does not render when bannerOpen is false', () => {
    cleanup();
    render(<AddBathroomBanner bannerOpen={false} onCancel={() => {}} />);

    expect(screen.queryByText('Choose a location for the bathroom')).toBeNull();
  });

  it('closes banner when cancel button is clicked', () => {
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Choose a location for the bathroom')).toBeNull();
  });
});
