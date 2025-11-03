import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  SwipeableDrawer,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

export type NewBathroomPayload = {
  name: string;
  details?: string;
  position: { lat: number; lng: number };
};

type Props = {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void; // for iOS swipe behavior
  position: { lat: number; lng: number } | null;

  // controlled fields from parent
  name: string;
  details: string;
  onNameChange: (v: string) => void;
  onDetailsChange: (v: string) => void;
  resetToken?: number;

  // submit + optional full cancel (exit add flow entirely)
  onSubmit: (data: NewBathroomPayload) => Promise<void> | void;
  onCancelFull?: () => void;
};

export default function AddBathroomPage({
  open,
  onClose,
  onOpen,
  position,
  onSubmit,
  name,
  details,
  onNameChange,
  onDetailsChange,
}: Props) {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  const handleSubmit = async () => {
    if (!position || !name.trim()) return;
    await onSubmit({
      name: name.trim(),
      details: details.trim() || undefined,
      position,
    });
  };

  // Mobile bottom sheet
  if (isSmall) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={onOpen ?? (() => {})}
        disableDiscovery
        disableSwipeToOpen
        ModalProps={{
          keepMounted: false,
          disableAutoFocus: true,
          disableEnforceFocus: true,
          disableRestoreFocus: true
        }}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: "86vh",
              backgroundColor: "#FBFAED",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: "text.disabled", mb: 1 }} />
        </Box>

        <Box sx={{ px: 2, pb: 2 }}>
          <Box sx={{ p: 2, bgcolor: "#FBFAED", borderRadius: 2 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
              New Bathroom
            </Typography>

            <TextField
              fullWidth
              label="Bathroom Name"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              sx={{ mt: 1.5 }}
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Bathroom Description"
              value={details}
              onChange={(e) => onDetailsChange(e.target.value)}
              helperText="Please add details on how to find the bathroom, and anything else to note"
              sx={{ mt: 2 }}
            />

            {position && (
              <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: "block" }}>
                Location: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
              </Typography>
            )}

            <Box sx={{ display: "flex", gap: 1.5, mt: 2 }}>
              <Button
                type="button"
                fullWidth
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onClose();
                }}
                sx={{
                  color: "#1B1C15",
                  fontWeight: 550,
                  border: "1px solid #845416",
                  borderRadius: "8px",
                  "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                }}
              >
                Cancel
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  backgroundColor: "#576421",
                  color: "white",
                  "&:hover": { backgroundColor: "#6B7A29" },
                }}
              >
                Save
              </Button>
            </Box>
          </Box>
        </Box>
      </SwipeableDrawer>
    );
  }

  // Desktop dialog
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: { backgroundColor: "#FBFAED" },
        },
      }}
    >
      <DialogTitle>New Bathroom</DialogTitle>
      <DialogContent sx={{ pt: 2, bgcolor: "#FBFAED" }}>
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            label="Bathroom Name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            sx={{ mt: 2 }}
            label="Bathroom Description"
            value={details}
            onChange={(e) => onDetailsChange(e.target.value)}
            helperText="Please add details on how to find the bathroom, and anything else to note"
          />
          {position && (
            <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: "block" }}>
              Location: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
          }}
          sx={{
            color: "#1B1C15",
            fontWeight: 550,
            border: "1px solid #845416",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "rgba(0,0,0,0.04)" },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: "#576421",
            color: "white",
            "&:hover": { backgroundColor: "#6B7A29" },
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
