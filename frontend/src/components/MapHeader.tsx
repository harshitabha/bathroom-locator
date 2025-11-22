import {Box, Button, Avatar} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import SearchBar from './SearchBar';
import AddBathroomBanner from './AddBathroomBanner';

type Props = {
  map: google.maps.Map | null;
  bannerOpen: boolean;
  onCancelBanner: () => void;
};

const MapHeader = ({map, bannerOpen, onCancelBanner}: Props) => {
  const loggedIn = false; // TODO: make this real (maybe pass it down from App)
  const navigate = useNavigate();

  return (
    <Box sx={{
      position: 'fixed',
      top: 10,
      zIndex: 100,
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      px: 1,
      gap: 1,
    }}>
      {/* row 1, search + login */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          justifyContent: 'right',
          alignItems: 'flex-start',
        }}
      >
        <Box sx={{flex: 1, mr: 1}}>
          <SearchBar map={map} />
        </Box>
        {loggedIn ?
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            color: 'background.default',
          }}
          aria-label='profile-picture'
        /> :
        <Button
          variant="contained"
          size="small"
          color="secondary"
          sx={{
            height: 40,
            padding: '7px',
            borderRadius: '25px',
          }}
          onClick={() => navigate('/login')}
        >
          Login
        </Button>
        }
      </Box>
      {/* row 2, bathroom banner */}
      <AddBathroomBanner bannerOpen={bannerOpen} onCancel={onCancelBanner} />
    </Box>
  );
};

export default MapHeader;
