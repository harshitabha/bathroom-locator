// filter state details of pin instead of using an API call to the backend

import React, {useState, useEffect} from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@mui/material';
import {useTheme, darken} from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckIcon from '@mui/icons-material/Check';

export const GENDER_FILTER_OPTIONS = [
  'Male',
  'Female',
  'Gender Neutral',
] as const;

export const STALLS_FILTER_OPTIONS = ['Private', '2', '3', '4+'] as const;

export const AMENITIES_FILTER_OPTIONS = [
  'Soap',
  'Tissues',
  'Menstrual Products',
  'Mirror',
  'Toilet Paper',
  'Hand Dryer',
] as const;

export const CLEANLINESS_FILTER_OPTIONS = ['1', '2', '3', '4', '5'] as const;

export type GenderFilter = (typeof GENDER_FILTER_OPTIONS)[number];
export type StallsFilter = (typeof STALLS_FILTER_OPTIONS)[number];
export type AmenityFilter = (typeof AMENITIES_FILTER_OPTIONS)[number];
export type CleanlinessFilter = (typeof CLEANLINESS_FILTER_OPTIONS)[number];

type FilterDropdownProps = {
  label: string;
  options: readonly string[];
  selected: readonly string[];
  onChange: (selected: string[]) => void;
  isActive: boolean;
  onActivated: () => void;
  onRequestClose?: () => void;
  'data-testid'?: string;
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  isActive,
  onActivated,
  onRequestClose,
  'data-testid': dataTestId,
}) => {
  const theme = useTheme();
  const hoverBg = darken(theme.palette.background.paper, 0.06);
  const activeBg = darken(theme.palette.background.paper, 0.1);
  const btnShadow = theme.shadows[3];
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    if (!isActive && anchorEl) {
      setAnchorEl(null);
    }
  }, [isActive, anchorEl]);

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (anchorEl && isActive) {
      setAnchorEl(null);
      onRequestClose?.();
    } else {
      onActivated();
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
    onRequestClose?.();
  };

  const handleToggle = (option: string) => {
    const next = selected.includes(option) ?
      selected.filter((o) => o !== option) :
      [...selected, option];

    onChange(next);
  };

  const labelText =
    selected.length === 0 ? label : `${selected.length} Selected`;

  return (
    <>
      <Button
        variant='text'
        color='inherit'
        disableRipple
        disableElevation
        onClick={handleButtonClick}
        data-testid={dataTestId}
        endIcon={open ? (
          <ExpandLessIcon fontSize='small' />
        ) : (
          <ExpandMoreIcon fontSize='small' />
        )}
        sx={{
          'textTransform': 'none',
          'borderRadius': 3,
          'px': 1.5,
          'py': 0.5,
          'mr': 1,
          'bgcolor': 'background.paper',
          'color': 'text.primary',
          'boxShadow': btnShadow,
          'minWidth': 0,
          '&:hover': {bgcolor: hoverBg, boxShadow: btnShadow},
          '&:active': {bgcolor: activeBg, boxShadow: btnShadow},
        }}
      >
        <Typography variant='body2' sx={{color: 'inherit', fontWeight: 500}}>
          {labelText}
        </Typography>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
        transformOrigin={{vertical: 'top', horizontal: 'left'}}
        slotProps={{
          paper: {
            sx: {
              'bgcolor': 'background.paper',
              'color': 'text.primary',
              'borderRadius': 3,
              'boxShadow': theme.shadows[4],
              'mt': 0.5,
              'minWidth': 180,
            },
          },
          list: {
            sx: {
              'py': 0.5,
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            onClick={() => handleToggle(option)}
            dense
            selected={selected.includes(option)}
            sx={{
              'px': 1.5,
              'py': 1.25,
              '&.Mui-selected': {
                bgcolor: darken(theme.palette.background.paper, 0.06),
              },
              '&.Mui-selected:hover': {
                bgcolor: darken(theme.palette.background.paper, 0.1),
              },
            }}
          >
            <ListItemIcon sx={{minWidth: 28}}>
              {selected.includes(option) && (
                <CheckIcon fontSize='small' />
              )}
            </ListItemIcon>
            <ListItemText
              primary={option}
              slotProps={{
                primary: {sx: {fontWeight: 500}},
              }}
            />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

type MapFiltersProps = {
  selectedGenders: GenderFilter[];
  selectedStalls: StallsFilter[];
  selectedAmenities: AmenityFilter[];
  selectedCleanliness: CleanlinessFilter[];
  onGendersChange: (next: GenderFilter[]) => void;
  onStallsChange: (next: StallsFilter[]) => void;
  onAmenitiesChange: (next: AmenityFilter[]) => void;
  onCleanlinessChange: (next: CleanlinessFilter[]) => void;
};

const MapFilters: React.FC<MapFiltersProps> = ({
  selectedGenders,
  selectedStalls,
  selectedAmenities,
  selectedCleanliness,
  onGendersChange,
  onStallsChange,
  onAmenitiesChange,
  onCleanlinessChange,
}: MapFiltersProps) => {
  const [activeFilter, setActiveFilter] = useState<
    'gender' | 'stalls' | 'amenities' | 'cleanliness' | null
  >(null);
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 8,
        right: 8,
        top: 8,
        zIndex: (t) => t.zIndex.modal + 1,
        display: 'flex',
        justifyContent: 'flex-start',
        pointerEvents: 'none',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          maxWidth: 600,
          width: 'auto',
          overflowX: 'auto',
          px: 1,
          py: 0.5,
          pointerEvents: 'auto',
        }}
      >
        <FilterDropdown
          label='Gender'
          options={GENDER_FILTER_OPTIONS}
          selected={selectedGenders}
          onChange={(next) => onGendersChange(next as GenderFilter[])}
          isActive={activeFilter === 'gender'}
          onActivated={() => setActiveFilter('gender')}
          onRequestClose={() => setActiveFilter(null)}
          data-testid='filter-gender'
        />
        <FilterDropdown
          label='Stalls'
          options={STALLS_FILTER_OPTIONS}
          selected={selectedStalls}
          onChange={(next) => onStallsChange(next as StallsFilter[])}
          isActive={activeFilter === 'stalls'}
          onActivated={() => setActiveFilter('stalls')}
          onRequestClose={() => setActiveFilter(null)}
          data-testid='filter-stalls'
        />
        <FilterDropdown
          label='Amenities'
          options={AMENITIES_FILTER_OPTIONS}
          selected={selectedAmenities}
          onChange={(next) => onAmenitiesChange(next as AmenityFilter[])}
          isActive={activeFilter === 'amenities'}
          onActivated={() => setActiveFilter('amenities')}
          onRequestClose={() => setActiveFilter(null)}
          data-testid='filter-amenities'
        />
        <FilterDropdown
          label='Cleanliness'
          options={CLEANLINESS_FILTER_OPTIONS}
          selected={selectedCleanliness}
          onChange={(next) => onCleanlinessChange(next as CleanlinessFilter[])}
          isActive={activeFilter === 'cleanliness'}
          onActivated={() => setActiveFilter('cleanliness')}
          onRequestClose={() => setActiveFilter(null)}
          data-testid='filter-cleanliness'
        />
      </Box>
    </Box>
  );
};

export default MapFilters;
