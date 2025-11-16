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
} from '@mui/material';
import './AddBathroom.css';

export type NewBathroomPayload = {
  name: string;
  details?: string;
  position: { lat: number; lng: number };
};

type Props = {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  position: { lat: number; lng: number } | null;

  name: string;
  details: string;
  onNameChange: (v: string) => void;
  onDetailsChange: (v: string) => void;
  resetToken?: number;

  onSubmit: (data: NewBathroomPayload) => Promise<void> | void;
  onCancelFull?: () => void;
};

type AddBathroomFormProps = {
  name: string;
  details: string;
  position: { lat: number; lng: number } | null;
  onNameChange: (v: string) => void;
  onDetailsChange: (v: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isMobile?: boolean;
};

/**
 * Form for entering bathroom info
 * @param {object} props Component props
 * @returns {object} JSX form fields
 */
function AddBathroomForm(props: AddBathroomFormProps) {
  const {
    name,
    details,
    position,
    onNameChange,
    onDetailsChange,
    onSubmit,
    onCancel,
    isMobile,
  } = props;

  return (
    <>
      <TextField
        fullWidth
        required
        label="Bathroom Name"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
      />

      <TextField
        fullWidth
        multiline
        minRows={3}
        required
        label="Bathroom Description"
        value={details}
        onChange={(e) => onDetailsChange(e.target.value)}
        helperText={
          'Please add details on how to find the bathroom, ' +
          'and anything else to note.'
        }
        className="addbathroom-description"
      />

      {position && (
        <Typography
          variant="caption"
          className="addbathroom-location"
        >
          Location: {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </Typography>
      )}

      <Box className="addbathroom-actions-row">
        <Button
          type="button"
          fullWidth={!!isMobile}
          onClick={onCancel}
          className="addbathroom-btn-cancel"
          variant="outlined"
          sx={{
            'color': 'text.primary',
            'fontWeight': 550,
            'borderColor': 'secondary.main',
            'borderRadius': 2,
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'secondary.main',
            },
          }}
        >
          Cancel
        </Button>

        <Button
          fullWidth={!!isMobile}
          variant="contained"
          onClick={onSubmit}
          className="addbathroom-btn-save"
          sx={{
            'bgcolor': 'primary.main',
            'color': 'common.white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          Save
        </Button>
      </Box>
    </>
  );
}

/**
 * Add bathroom UI wrapper
 * @param {object} props Component props
 * @returns {object} JSX container for the component
 */
export default function AddBathroomPage(props: Props) {
  const {
    open,
    onClose,
    onOpen,
    position,
    onSubmit,
    name,
    details,
    onNameChange,
    onDetailsChange,
  } = props;

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));

  const handleSubmit = async () => {
    if (!position || !name.trim() || !details.trim()) return;

    await onSubmit({
      name: name.trim(),
      details: details.trim(),
      position,
    });
  };

  // mobile
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
          disableRestoreFocus: true,
        }}
        slotProps={{
          paper: {
            className: 'addbathroom-drawer-paper',
            sx: {bgcolor: 'background.paper'},
          },
        }}
      >
        <Box className="addbathroom-drag-handle-container">
          <Box
            className="addbathroom-drag-handle"
            sx={{bgcolor: 'text.disabled'}}
          />
        </Box>

        <Box
          className="addbathroom-mobile-wrapper"
          sx={{bgcolor: 'background.paper'}}
        >
          <Box
            className="addbathroom-card"
            sx={{bgcolor: 'background.paper'}}
          >
            <Typography
              variant="h5"
              fontWeight={600}
              className="addbathroom-title"
            >
              New Bathroom
            </Typography>

            <AddBathroomForm
              name={name}
              details={details}
              position={position}
              onNameChange={onNameChange}
              onDetailsChange={onDetailsChange}
              onSubmit={handleSubmit}
              onCancel={onClose}
              isMobile
            />
          </Box>
        </Box>
      </SwipeableDrawer>
    );
  }

  // desktop
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          className: 'addbathroom-dialog-paper',
          sx: {bgcolor: 'background.paper'},
        },
      }}
    >
      <DialogTitle
        className="addbathroom-dialog-title"
        sx={{bgcolor: 'background.paper'}}
      >
        New Bathroom
      </DialogTitle>

      <DialogContent
        className="addbathroom-dialog-content"
        sx={{bgcolor: 'background.paper'}}
      >
        <Box className="addbathroom-dialog-inner">
          <AddBathroomForm
            name={name}
            details={details}
            position={position}
            onNameChange={onNameChange}
            onDetailsChange={onDetailsChange}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </Box>
      </DialogContent>

      <DialogActions
        className="addbathroom-dialog-actions"
        sx={{bgcolor: 'background.paper'}}
      />
    </Dialog>
  );
}
