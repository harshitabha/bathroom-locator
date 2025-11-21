import {describe, it, afterEach, expect, vi} from 'vitest';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {AddBathroomForm} from '../components/AddBathroomForm';

describe('AddBathroomForm', () => {
  afterEach(() => {
    cleanup();
    vi.resetAllMocks();
  });

  const defaultProps = {
    name: '',
    details: '',
    position: {lat: 36.123456, lng: -122.654321},
    onNameChange: vi.fn(),
    onDetailsChange: vi.fn(),
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
    isMobile: true,
  };

  it('renders the form fields and actions', () => {
    render(<AddBathroomForm {...defaultProps} />);

    expect(screen.getByLabelText(/bathroom name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bathroom description/i)).toBeInTheDocument();

    expect(screen.getByRole('button', {name: 'Cancel'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'Save'})).toBeInTheDocument();
  });

  it('shows the location if provided', () => {
    render(<AddBathroomForm {...defaultProps} />);

    expect(screen.getByText(/location: 36\.123456/i)).toBeInTheDocument();
    expect(screen.getByText(/-122\.654321/i)).toBeInTheDocument();
  });

  it('does not show location if not provided', () => {
    render(<AddBathroomForm {...defaultProps} position={null} />);

    expect(screen.queryByText(/Location:/)).not.toBeInTheDocument();
  });

  it('calls onSubmit when save button is clicked', () => {
    const onSubmit = vi.fn();

    render(
        <AddBathroomForm
          {...defaultProps}
          name="Test Bathroom"
          details="Some details"
          onSubmit={onSubmit}
        />,
    );

    const saveButton = screen.getByRole('button', {name: 'Save'});
    fireEvent.click(saveButton);

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    const onCancel = vi.fn();

    render(<AddBathroomForm {...defaultProps} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole('button', {name: 'Cancel'}));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
