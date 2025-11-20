import {
  Box,
  Button,
  SwipeableDrawer,
  Typography,
  useTheme,
} from '@mui/material';
import NearMeIcon from '@mui/icons-material/NearMe';
import type {Dispatch, SetStateAction} from 'react';
import {styled} from '@mui/material/styles';

import './BathroomDetails.css';
import {openWalkingDirections} from '../../utils/navigation';


// TODO: make this a model (and replace the thing in Map.tsx with it)
// also: see if it's used anywhere else
// also: refactor so Place --> Bathroom
type Place = {
  id: string;
  name: string;
  position: google.maps.LatLngLiteral;
  description?: string;
};

type bathroomDetailsProps = {
  bathroom: Place,
  setBathroom: Dispatch<SetStateAction<Place | null>>;
};

const BathroomDetails = (props: bathroomDetailsProps) => {
  const {
    bathroom,
    setBathroom
  } = props;
  const theme = useTheme();

  const DetailsButton = styled(Button)(({ theme }) => ({
    borderRadius: '30px',
    padding: '10px 20px',
    fontWeight: 'normal',
  }));

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
              ml: '-5px',
              display: 'flex',
            }}
          >
            <DetailsButton
              variant="contained"
              color="secondary"
              size="small"
              endIcon={<NearMeIcon />}
              onClick={() => openWalkingDirections(
                  bathroom.position.lat,
                  bathroom.position.lng,
              )}
            >
              Navigate
            </DetailsButton>
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
          <Typography variant="subtitle1">
            Gender:
          </Typography>

        </Box>
      </SwipeableDrawer>
  );
};

export default BathroomDetails;
