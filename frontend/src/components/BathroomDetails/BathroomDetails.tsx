import {
  Box,
  Chip,
  SwipeableDrawer,
  Typography,
  useTheme,
} from '@mui/material';
import NearMeIcon from '@mui/icons-material/NearMe';
import {useState, useContext, type Dispatch, type SetStateAction} from 'react';

import './BathroomDetails.css';
import {openWalkingDirections} from '../../utils/navigation';
import type {Bathroom} from '../../types';
import AppContext from '../../context/AppContext';
import Like from './Like';

interface bathroomDetailsProps {
  bathroom: Bathroom,
  setBathroom: Dispatch<SetStateAction<Bathroom | null>>;
};

const BathroomDetails = (props: bathroomDetailsProps) => {
  const {
    bathroom,
    setBathroom,
  } = props;
  const theme = useTheme();

  const [userId, setUserId] = useState<string | null>('');
  const [likes, setLikes] = useState(bathroom.likes);
  const appContext = useContext(AppContext);
  appContext?.getCurrentUserId().then(setUserId);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={bathroom !== null}
      onClose={() => setBathroom(null)}
      onOpen={() => {}}
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
          sx: {bgcolor: theme.palette.background.default},
        },
      }}
    >
      <Box className="card-drag-handle-container">
        <Box
          className="card-drag-handle"
          sx={{bgcolor: 'text.disabled'}}
        />
      </Box>
      <Box
        className="addbathroom-card"
        sx={{bgcolor: 'theme.palette.background'}}
      >
        <Typography
          variant="h5"
          fontWeight={600}
          sx={{pb: '8px',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          {bathroom.name}
          {userId ?
          <Like
            bathroom={bathroom}
            userId={userId}
            likes={likes}
            setLikes={setLikes}
          /> :
          null
          }
        </Typography>
        <Box
          sx={{
            ml: '-2px',
            display: 'flex',
            gap: '8px',
          }}
        >
          {likes >= 5 ?
            <Chip label="Verified Bathroom" variant="outlined"
              color="primary"/> :
            null}
          <Chip
            label={
              <Box sx={{display: 'flex', alignItems: 'center', gap: '3px'}}>
                Navigate
                <NearMeIcon fontSize='inherit' />
              </Box>
            }
            variant="outlined"
            color="secondary"
            onClick={() => openWalkingDirections(
                bathroom.position.lat,
                bathroom.position.lng,
            )}
          />
        </Box>
        <Typography variant="h6" className="details-subheader">
            Description
        </Typography>
        <Typography variant="body1">
          {bathroom.description}
        </Typography>

        <Typography variant="h6" className="details-subheader">
            Additional Details
        </Typography>

      </Box>
    </SwipeableDrawer>
  );
};

export default BathroomDetails;
