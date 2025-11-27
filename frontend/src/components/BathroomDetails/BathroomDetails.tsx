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
import type {Bathroom, Gender, Amenities, OptionalObj} from '../../types';
import Detail from '../Detail';

interface bathroomDetailsProps {
  bathroom: Bathroom,
  setBathroom: Dispatch<SetStateAction<Bathroom | null>>;
};

const BathroomDetails = (props: bathroomDetailsProps) => {
  const {
    bathroom,
    setBathroom,
  } = props;
  const gender = getTrueKeys(bathroom.gender);
  const amenities = getTrueKeys(bathroom.amenities);
  const additionalDetailsExist = getNumKeysInObj(bathroom.gender) > 0 ||
    getNumKeysInObj(bathroom.amenities) > 0;

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
          additionalDetailsExist ?
          <Box>
            <Typography variant="h6" className="details-subheader">
              Additional Details
            </Typography>
            {
              getNumKeysInObj(gender) > 0 ?
              <Detail
                name='Gender'
                values={gender}
                handleClick={() => {}}/> : null
            }
            {
              getNumKeysInObj(amenities) > 0 ?
              <Detail
                name='Amenities'
                values={amenities}
                handleClick={() => {}}/> : null
            }
          </Box> : null
        }


      </Box>
    </SwipeableDrawer>
  );
};

/**
 * Get the object with only it's true keys
 * @param {object | undefined} obj object to process
 * @returns {object} object with only true keys
 */
function getTrueKeys(obj: Gender | Amenities | undefined) {
  if (!obj) {
    return {};
  }

  const filtered: {[key: string]: boolean} = Object.keys(obj)
      .reduce((newObj, key) => {
        const typedKey = key as keyof (Gender | Amenities);
        if (obj[typedKey]) {
          newObj[typedKey] = obj[typedKey];
        }
        return newObj;
      }, {} as OptionalObj<Gender | Amenities>);
  return filtered;
}

/**
 * Gets the number of keys in an object
 * @param {object | undefined} obj the object to check the number of keys of
 * @returns {number} the number of keys in the object
 */
function getNumKeysInObj(obj: object | undefined) {
  if (!obj) {
    return 0;
  }
  return Object.keys(obj).length;
}

export default BathroomDetails;
