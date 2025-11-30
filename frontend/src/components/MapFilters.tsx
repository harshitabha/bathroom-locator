import React, {useState, useEffect} from 'react';
import {
  Box,
  Button,
  Popper,
  Paper,
  List,
  MenuItem,
  ListItemIcon,
  ListItemText,
  ClickAwayListener,
  Typography,
} from '@mui/material';
import {useTheme, darken} from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CheckIcon from '@mui/icons-material/Check';

export const AMENITIES_FILTER_OPTIONS = [
  'Soap',
  'Tissues',
  'Menstrual Products',
  'Mirror',
  'Toilet Paper',
  'Hand Dryer',
] as const;

export type AmenityFilter = (typeof AMENITIES_FILTER_OPTIONS)[number];

type FilterDropdownProps = {
  label: string;
  options: readonly string[];
  selected: readonly string[];
  onChange: (selected: string[]) => void;
  isActive: boolean;
  onActivated: () => void;
  onRequestClose?: () => void;
  ariaLabel?: string;
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  options,
  selected,
  onChange,
  isActive,
  onActivated,
  onRequestClose,
  ariaLabel,
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

  const handleButtonClick = (
      event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (open && isActive) {
      setAnchorEl(null);
      onRequestClose?.();
    } else {
      onActivated();
      setAnchorEl(event.currentTarget);
    }
  };

  return (
    <>
      <Button
        variant='text'
        color='inherit'
        disableRipple
        disableElevation
        onClick={handleButtonClick}
        aria-label={ariaLabel ?? `${label} filter`}
        endIcon={open ? (
          <ExpandLessIcon fontSize='small' />
        ) : (
          <ExpandMoreIcon fontSize='small' />
        )}
        sx={{
          'textTransform': 'none',
          'borderRadius': 1.5,
          'px': 1.5,
          'py': 0.7,
          'minHeight': 28,
          'mr': 0.75,
          'bgcolor': 'background.paper',
          'color': 'text.primary',
          'boxShadow': btnShadow,
          'minWidth': 0,
          '&:hover': {bgcolor: hoverBg, boxShadow: btnShadow},
          '&:active': {bgcolor: activeBg, boxShadow: btnShadow},
        }}
      >
        <Typography
          variant='caption'
          sx={{
            color: 'inherit',
            fontWeight: 500,
            fontSize: 12,
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}
        >
          {labelText}
        </Typography>
      </Button>

      <Popper
        open={open}
        anchorEl={anchorEl}
        placement='bottom-start'
        modifiers={[
          {name: 'offset', options: {offset: [0, 6]}},
        ]}
        sx={{zIndex: 80}}
      >
        <ClickAwayListener
          onClickAway={(event: MouseEvent | TouchEvent) => {
            if (anchorEl && anchorEl.contains(event.target as Node)) {
              return;
            }
            handleClose();
          }}
        >
          <Paper
            sx={{
              'bgcolor': 'background.paper',
              'color': 'text.primary',
              'borderRadius': 3,
              'boxShadow': theme.shadows[4],
              'minWidth': 180,
            }}
          >
            <List dense sx={{py: 0.5}}>
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
                      primary: {sx: {fontWeight: 450}},
                    }}
                  />
                </MenuItem>
              ))}
            </List>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
};

type MapFiltersProps = {
  selectedAmenities: AmenityFilter[];
  onAmenitiesChange: (next: AmenityFilter[]) => void;
};

const MapFilters: React.FC<MapFiltersProps> = ({
  selectedAmenities,
  onAmenitiesChange,
}: MapFiltersProps) => {
  const [activeFilter, setActiveFilter] = useState<'amenities' | null>(null);
  return (
    <Box
      sx={{
        position: 'fixed',
        left: 8,
        right: 8,
        top: 55,
        zIndex: 60,
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
          px: 0,
          py: 0.5,
          pointerEvents: 'auto',
        }}
      >
        <FilterDropdown
          label='Amenities'
          options={AMENITIES_FILTER_OPTIONS}
          selected={selectedAmenities}
          onChange={(next) => onAmenitiesChange(next as AmenityFilter[])}
          isActive={activeFilter === 'amenities'}
          onActivated={() => setActiveFilter('amenities')}
          onRequestClose={() => setActiveFilter(null)}
          ariaLabel='Amenities filter'
        />
      </Box>
    </Box>
  );
};

export default MapFilters;
