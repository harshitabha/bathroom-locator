import {useRef, useCallback, useState} from 'react';
import {
  Box,
  Button,
  SwipeableDrawer,
  TextField,
  Typography,
} from '@mui/material';
import './AddBathroomForm.css';
import Detail from '../Detail';
import type {IndexObject} from '../../types';

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
        const handleMouseUp = () => {
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

/**
 * Add bathroom form for adding bathroom
 * @param {object} props Component props
 * @returns {object} JSX container for the component
 */
export default function AddBathroomForm(props: Props) {
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
    if (!position || !name?.trim() || !description?.trim()) return;

    const newBathroom = {
      name: name.trim(),
      description: description.trim(),
      position,
      gender: additionalDetails.gender,
      amenities: additionalDetails.amenities,
    };

    try {
      const res = await fetch('http://localhost:3000/bathroom', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(newBathroom),
      });
      if (!res.ok) {
        throw res;
      }

      await res.json();
      await onCreated();
    } catch (err) {
      console.log('cathing');
      console.error('Error creating bathroom:', err);
    }
  };

  const {onMouseDown: onHandleMouseDown} = useDragToCloseDrawer(onClose);
  const [additionalDetails, setAdditionalDetails] = useState({
    gender: {
      female: false,
      male: false,
      gender_neutral: false,
    },
    amenities: {
      toilet_paper: false,
      soap: false,
      paper_towel: false,
      hand_dryer: false,
      menstrual_products: false,
      mirror: false,
    },
  } as IndexObject<IndexObject<boolean>>);

  const handleDetailsChange = (
      detailName: string,
      attrName: string,
  ) => {
    setAdditionalDetails({
      ...additionalDetails,
      [detailName]: {
        ...(additionalDetails[detailName] as object),
        [attrName]: !additionalDetails[detailName][attrName],
      },
    });
  };

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
          sx: {bgcolor: 'background.default'},
        },
      }}
    >
      <Box
        aria-label="Close drawer by dragging"
        className="addbathroom-drag-handle-container"
        onMouseDown={onHandleMouseDown}>
        <Box
          className="addbathroom-drag-handle"
          sx={{bgcolor: 'text.disabled'}}
        />
      </Box>

      <Box
        className="addbathroom-mobile-wrapper"
        sx={{bgcolor: 'background.default'}}
      >
        <Box
          className="addbathroom-card"
          sx={{bgcolor: 'background.default'}}
        >
          <Typography
            variant="h1"
            className="addbathroom-title"
          >
            New Bathroom
          </Typography>

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

          <Box>
            <Typography variant='h2' className='addbathroom-subtitle'>
              Additional Details (Optional)
            </Typography>
            <Detail
              name='Gender'
              values={additionalDetails.gender}
              handleClick={handleDetailsChange}
              styles='column'
              chipEditable={true}
            />
            <Detail
              name='Amenities'
              values={additionalDetails.amenities}
              handleClick={handleDetailsChange}
              styles='column'
              chipEditable={true}
            />
          </Box>

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
              fullWidth={true}
              onClick={onClose}
              className="addbathroom-btn-cancel"
              variant="outlined"
              sx={{
                'color': 'text.primary',
                'borderColor': 'secondary.main',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'secondary.main',
                },
              }}
            >
              Cancel
            </Button>

            <Button
              fullWidth={true}
              variant="contained"
              onClick={handleSubmit}
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
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};
