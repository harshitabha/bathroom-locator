import {
  Box,
  Chip,
  SwipeableDrawer,
  Typography,
  useTheme,
} from '@mui/material';
import NearMeIcon from '@mui/icons-material/NearMe';
import type {Dispatch, SetStateAction} from 'react';

import './BathroomDetails.css';
import {openWalkingDirections} from '../../utils/navigation';
import type {AmenityOptions, GenderOptions, Bathroom} from '../../types';
import Detail from './Detail';

interface bathroomDetailsProps {
  bathroom: Bathroom,
  setBathroom: Dispatch<SetStateAction<Bathroom | null>>;
};

const BathroomDetails = (props: bathroomDetailsProps) => {
  const {
    bathroom,
    setBathroom,
  } = props;
  const gender = bathroom.gender ? Object.keys(bathroom.gender)
      .filter((val) => bathroom.gender![val as GenderOptions] == true)
      .map((key) => {
        return {name: key, selected: true};
      }) : [];
  const amenities = bathroom.amenities ? Object.keys(bathroom.amenities)
      .filter((val) => bathroom.amenities![val as AmenityOptions] == true)
      .map((key) => {
        return {name: key, selected: true};
      }) : [];

  const theme = useTheme();

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
          sx={{pb: '8px'}}
        >
          {bathroom.name}
        </Typography>
        <Box
          sx={{
            ml: '-2px',
            display: 'flex',
          }}
        >
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

        {
          gender.length > 0 || amenities.length > 0 ?
          <Box>
            <Typography variant="h6" className="details-subheader">
              Additional Details
            </Typography>
            {
              gender.length > 0 ?
              <Detail name='Gender' values={gender}/> : null
            }
            {
              amenities.length > 0 ?
              <Detail name='Amenities' values={amenities}/> : null
            }
          </Box> : null
        }


      </Box>
    </SwipeableDrawer>
  );
};

export default BathroomDetails;
