import React, {useState, useEffect} from "react";
import {Box, Button, Menu, MenuItem, Checkbox, ListItemText, Typography} from "@mui/material";

export const GENDER_FILTER_OPTIONS = ["Male", "Female", "Gender Neutral"] as const;

export const STALLS_FILTER_OPTIONS = ["Private", "2", "3", "4+"] as const;

export const AMENITIES_FILTER_OPTIONS = [
  "Soap",
  "Tissues",
  "Menstrual Products",
  "Mirror",
  "Toilet Paper",
  "Hand Dryer",
] as const;

export type GenderFilter = (typeof GENDER_FILTER_OPTIONS)[number];
export type StallsFilter = (typeof STALLS_FILTER_OPTIONS)[number];
export type AmenityFilter = (typeof AMENITIES_FILTER_OPTIONS)[number];

type FilterDropdownProps = {
  label: string;
  options: readonly string[];
  selected: readonly string[];
  onChange: (selected: string[]) => void;
  isActive: boolean;
  onActivated: () => void;
  onRequestClose?: () => void;
  "data-testid"?: string;
};

function FilterDropdown({
  label,
  options,
  selected,
  onChange,
  isActive,
  onActivated,
  onRequestClose,
  "data-testid": dataTestId,
}: FilterDropdownProps) {
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
    const next = selected.includes(option)
      ? selected.filter((o) => o !== option)
      : [...selected, option];

    onChange(next);
  };

  const labelText =
    selected.length === 0 ? label : `${selected.length} Selected`;

  return (
    <>
      <Button
        variant="text"
        color="inherit"
        disableRipple
        disableElevation
        onClick={handleButtonClick}
        data-testid={dataTestId}
        sx={{
          textTransform: "none",
          borderRadius: 2,
          px: 1.5,
          py: 0.5,
          mr: 1,
          bgcolor: "var(--color-bg-light)",
          color: "var(--color-text-dark)",
          border: "1px solid var(--color-accent-brown)",
          boxShadow: "none",
          minWidth: 0,
          "&:hover": { bgcolor: "#E9E8D9"},
          "&:active": { bgcolor: "#DCDAC7" }
        }}
      >
        <Typography variant="body2" fontWeight={500} sx={{ color: "inherit" }}>
            {labelText}
        </Typography>
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            onClick={() => handleToggle(option)}
            dense
          >
            <Checkbox size="small" checked={selected.includes(option)} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

type MapFiltersProps = {
  selectedGenders: GenderFilter[];
  selectedStalls: StallsFilter[];
  selectedAmenities: AmenityFilter[];
  onGendersChange: (next: GenderFilter[]) => void;
  onStallsChange: (next: StallsFilter[]) => void;
  onAmenitiesChange: (next: AmenityFilter[]) => void;
};

export default function MapFilters({
  selectedGenders,
  selectedStalls,
  selectedAmenities,
  onGendersChange,
  onStallsChange,
  onAmenitiesChange,
}: MapFiltersProps) {
  const [activeFilter, setActiveFilter] = useState<
    "gender" | "stalls" | "amenities" | null
  >(null);
  return (
    <Box
      sx={{
        position: "fixed",
        left: 8,
        right: 8,
        top: 8,
        zIndex: (t) => t.zIndex.modal + 1,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          maxWidth: 600,
          width: "100%",
          overflowX: "auto",
          px: 1,
          py: 0.5,
          pointerEvents: "auto",
        }}
      >
        <FilterDropdown
          label="Gender"
          options={GENDER_FILTER_OPTIONS}
          selected={selectedGenders}
          onChange={(next) => onGendersChange(next as GenderFilter[])}
          isActive={activeFilter === "gender"}
          onActivated={() => setActiveFilter("gender")}
          onRequestClose={() => setActiveFilter(null)}
          data-testid="filter-gender"
        />
        <FilterDropdown
          label="Stalls"
          options={STALLS_FILTER_OPTIONS}
          selected={selectedStalls}
          onChange={(next) => onStallsChange(next as StallsFilter[])}
          isActive={activeFilter === "stalls"}
          onActivated={() => setActiveFilter("stalls")}
          onRequestClose={() => setActiveFilter(null)}
          data-testid="filter-stalls"
        />
        <FilterDropdown
          label="Amenities"
          options={AMENITIES_FILTER_OPTIONS}
          selected={selectedAmenities}
          onChange={(next) => onAmenitiesChange(next as AmenityFilter[])}
          isActive={activeFilter === "amenities"}
          onActivated={() => setActiveFilter("amenities")}
          onRequestClose={() => setActiveFilter(null)}
          data-testid="filter-amenities"
        />
      </Box>
    </Box>
  );
}