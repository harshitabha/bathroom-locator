import {describe, it, afterEach, expect, vi} from 'vitest';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import AddBathroomBanner from '../components/AddBathroomBanner';

afterEach(() => {
  cleanup();
});

describe('AddBathroomBanner', () => {
  it('renders and shows the message when opened', () => {
    render(
        <AddBathroomBanner
          bannerOpen={true}
          onCancel={() => {}}
        />,
    );

    expect(
        screen.getByText('Choose a location for the bathroom'),
    ).toBeInTheDocument();

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('does not render when bannerOpen is false', () => {
    render(
        <AddBathroomBanner
          bannerOpen={false}
          onCancel={() => {}}
        />,
    );

    expect(
        screen.queryByText('Choose a location for the bathroom'),
    ).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();

    render(
        <AddBathroomBanner
          bannerOpen={true}
          onCancel={onCancel}
        />,
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
