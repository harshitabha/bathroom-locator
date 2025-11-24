import {
  Box,
  Button,
  SwipeableDrawer,
  Typography,
  useTheme,
} from '@mui/material';
import NearMeIcon from '@mui/icons-material/NearMe';
import type {Dispatch, SetStateAction} from 'react';

import './BathroomDetails.css';
import {openWalkingDirections} from '../../utils/navigation';
import type {GenderOptions, Bathroom} from '../../types';
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
          <Button
            variant="contained"
            color="secondary"
            size="small"
            className="details-button"
            endIcon={<NearMeIcon />}
            onClick={() => openWalkingDirections(
                bathroom.position.lat,
                bathroom.position.lng,
            )}
          >
              Navigate
          </Button>
        </Box>

        <Typography variant="h6" className="details-subheader">
            Description
        </Typography>
        <Typography variant="body1">
          {bathroom.description}
        </Typography>

        {
          gender.length > 0 ?
          <Box>
            <Typography variant="h6" className="details-subheader">
              Additional Details
            </Typography>
            <Detail name='Gender' values={gender}/>
          </Box> : null
        }


      </Box>
    </SwipeableDrawer>
  );
};

export default BathroomDetails;
