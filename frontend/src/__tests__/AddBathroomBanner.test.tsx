import {describe, it, afterEach, expect, vi, beforeEach} from 'vitest';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomBanner from '../components/AddBathroomBanner';

const onCancel = vi.fn();

beforeEach(() => {
  render(
      <AddBathroomBanner
        bannerOpen={true}
        onCancel={onCancel}
      />,
  );
});

afterEach(() => {
  cleanup();
});

describe('AddBathroomBanner', () => {
  it('renders when opened', () => {
    expect(screen.getByLabelText('Bathroom banner')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders the message when opened', () => {
    expect(
        screen.getByText('Choose a location for the bathroom'),
    ).toBeInTheDocument();
  });

  it('does not render when bannerOpen is false', () => {
    cleanup();
    render(
        <AddBathroomBanner
          bannerOpen={false}
          onCancel={onCancel}
        />,
    );

    expect(
        screen.queryByText('Choose a location for the bathroom'),
    ).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    fireEvent.click(screen.getByText('Cancel'));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
