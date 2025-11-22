import {useRef, useCallback} from 'react';
import {
  Box,
  Button,
  SwipeableDrawer,
  TextField,
  Typography,
} from '@mui/material';
import './AddBathroomForm.css';

/**
 * Used to hide the add bathroom form by dragging down on desktop
 * @param {object} onClose closes add bathroom form
 * @param {number} threshold threshold distance for mouse drag
 * @returns {object} React.MouseEventHandler
 */
function useDragToCloseDrawer(onClose: () => void, threshold = 10) {
  const startYRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const closedDuringDragRef = useRef(false);

  const onMouseDown: React.MouseEventHandler<HTMLDivElement> = useCallback(
      (e) => {
        if (e.button !== 0) return;

        e.stopPropagation();
        startYRef.current = e.clientY;
        draggingRef.current = true;
        closedDuringDragRef.current = false;

        const handleMouseMove = (ev: MouseEvent) => {
          if (!draggingRef.current || startYRef.current == null) return;
          const dy = ev.clientY - startYRef.current;

          if (dy > threshold && !closedDuringDragRef.current) {
            closedDuringDragRef.current = true;
            draggingRef.current = false;
            startYRef.current = null;
            onClose();
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
          }
        };

        // cleanup after finish dragging
        const handleMouseUp = (ev: MouseEvent) => {
          ev.stopPropagation?.();
          draggingRef.current = false;
          startYRef.current = null;
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      },
      [onClose, threshold],
  );

  return {onMouseDown};
}

type Props = {
  open: boolean;
  onClose: () => void;
  onOpen?: () => void;
  position: { lat: number; lng: number } | null;
  name: string;
  description: string;
  onNameChange: (newName: string) => void;
  onDescriptionChange: (newDescription: string) => void;
  onCreated: () => Promise<void> | void;
};

type AddBathroomFormProps = {
  name: string;
  description: string;
  position: { lat: number; lng: number } | null;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
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
    description,
    position,
    onNameChange,
    onDescriptionChange,
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
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
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
    onCreated,
    name,
    description,
    onNameChange,
    onDescriptionChange,
  } = props;

  const handleSubmit = async () => {
    if (!position || !name.trim() || !description.trim()) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      position,
      num_stalls: 1,
      amenities: {
        toilet_paper: false,
        soap: false,
        paper_towel: false,
        hand_dryer: false,
        menstrual_products: false,
        mirror: false,
      },
    };

    try {
      const res = await fetch('http://localhost:3000/bathroom', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        console.error('Failed to create bathroom:', res.status, errorBody);
        return;
      }

      await res.json();

      await onCreated();
    } catch (err) {
      console.error('Error creating bathroom:', err);
    }
  };

  const {onMouseDown: onHandleMouseDown} = useDragToCloseDrawer(onClose);

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
          sx: {bgcolor: (theme) => theme.palette.background.default},
        },
      }}
    >
      <Box
        className="addbathroom-drag-handle-container"
        onMouseDown={onHandleMouseDown}>
        <Box
          className="addbathroom-drag-handle"
          sx={{bgcolor: 'text.disabled'}}
        />
      </Box>

      <Box
        className="addbathroom-mobile-wrapper"
        sx={{bgcolor: (theme) => theme.palette.background.default}}
      >
        <Box
          className="addbathroom-card"
          sx={{bgcolor: (theme) => theme.palette.background.default}}
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
            description={description}
            position={position}
            onNameChange={onNameChange}
            onDescriptionChange={onDescriptionChange}
            onSubmit={handleSubmit}
            onCancel={onClose}
            isMobile
          />
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};
