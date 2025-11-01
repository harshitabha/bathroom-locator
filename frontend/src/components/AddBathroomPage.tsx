import { useEffect, useState } from "react";
import type { SelectChangeEvent } from "@mui/material";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  FormGroup, FormControlLabel, Checkbox
} from "@mui/material";

export type NewBathroomPayload = {
  name: string;
  details?: string;
  gender: "male" | "female" | "unisex";
  amenities: {
    menstrualProducts: boolean;
    accessibleStall: boolean;
    cleanedBathroom: boolean;
  };
  position: { lat: number; lng: number };
};

type Props = {
  open: boolean;
  onClose: () => void;
  position: { lat: number; lng: number } | null;
  onSubmit: (data: NewBathroomPayload) => Promise<void> | void;
};

export default function AddBathroomPage({ open, onClose, position, onSubmit }: Props) {
  const [name, setName] = useState("");
  const [details, setDetails] = useState("");
  const [gender, setGender] = useState<"male" | "female" | "unisex">("unisex");
  const [amenities, setAmenities] = useState({
    menstrualProducts: false,
    accessibleStall: false,
    cleanedBathroom: false,
  });

  // Reset form whenever it opens
  useEffect(() => {
    if (open) {
      setName("");
      setDetails("");
      setGender("unisex");
      setAmenities({ menstrualProducts: false, accessibleStall: false, cleanedBathroom: false });
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!position) return;
    if (!name.trim()) return;

    await onSubmit({
      name: name.trim(),
      details: details.trim() || undefined,
      gender,
      amenities,
      position,
    });

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Bathroom</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Name"
          fullWidth
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel id="gender-label">Gender</InputLabel>
          <Select
            labelId="gender-label"
            label="Gender"
            value={gender}
            onChange={(e: SelectChangeEvent<string>) => setGender(e.target.value as "male" | "female" | "unisex")}
          >
            <MenuItem value="unisex">Unisex</MenuItem>
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </Select>
        </FormControl>

        <FormGroup sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={amenities.menstrualProducts}
                onChange={(e) =>
                  setAmenities(a => ({ ...a, menstrualProducts: e.target.checked }))
                }
              />
            }
            label="Menstrual Products Available"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={amenities.accessibleStall}
                onChange={(e) =>
                  setAmenities(a => ({ ...a, accessibleStall: e.target.checked }))
                }
              />
            }
            label="Accessible stall"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={amenities.cleanedBathroom}
                onChange={(e) =>
                  setAmenities(a => ({ ...a, cleanedBathroom: e.target.checked }))
                }
              />
            }
            label="Cleanly Bathroom"
          />
        </FormGroup>

        <TextField
          margin="dense"
          label="Details (optional)"
          fullWidth
          multiline
          minRows={2}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          sx={{ mt: 2 }}
        />

        {position && (
          <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
            Location: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </div>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Save</Button>
      </DialogActions>
    </Dialog>
  );
}