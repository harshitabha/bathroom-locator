import type {Bathroom} from '../types';
import type {GenderFilter} from '../components/MapFilters';

const genderKeyMap: Record<
  GenderFilter,
  keyof NonNullable<Bathroom['gender']>
> = {
  'Male': 'male',
  'Female': 'female',
  'Gender Neutral': 'gender_neutral',
};

/**
 * Filters bathrooms by selected gender options.
 * If no filters are selected it returns the original list.
 * @param {Bathroom[]} bathrooms bathrooms to check
 * @param {GenderFilter[]} selectedGenders filters chosen by the user
 * @returns {Bathroom[]} bathrooms that match the selected genders
 */
export function filterBathroomsByGender(
    bathrooms: Bathroom[],
    selectedGenders: GenderFilter[],
): Bathroom[] {
  if (!selectedGenders.length) return bathrooms;

  return bathrooms.filter((bathroom) => {
    const genderInfo = bathroom.gender;
    if (!genderInfo) return false;

    return selectedGenders.some((option) => genderInfo[genderKeyMap[option]]);
  });
}
