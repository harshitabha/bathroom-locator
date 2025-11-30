import type {Bathroom} from '../types';
import type {AmenityFilter} from '../components/MapFilters';

const amenityKeyMap: Record<
  AmenityFilter,
  keyof NonNullable<Bathroom['amenities']>
> = {
  'Soap': 'soap',
  'Tissues': 'paper_towel',
  'Menstrual Products': 'menstrual_products',
  'Mirror': 'mirror',
  'Toilet Paper': 'toilet_paper',
  'Hand Dryer': 'hand_dryer',
};

/**
 * Filters bathrooms by selected amenity options
 * If no filters are selected it returns the original list
 * @param {Bathroom[]} bathrooms bathrooms to check
 * @param {AmenityFilter[]} selectedAmenities filters chosen by the user
 * @returns {Bathroom[]} bathrooms that match the selected amenities
 */
export function filterBathroomsByAmenities(
    bathrooms: Bathroom[],
    selectedAmenities: AmenityFilter[],
): Bathroom[] {
  if (!selectedAmenities.length) return bathrooms;

  return bathrooms.filter((bathroom) => {
    const amenities = bathroom.amenities;
    if (!amenities) return false;

    return selectedAmenities.every(
        (option) => amenities[amenityKeyMap[option]],
    );
  });
}
