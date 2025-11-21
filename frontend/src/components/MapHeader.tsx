import {Box, Button, Avatar} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import SearchBar from './SearchBar';

type Props = {
  map: google.maps.Map | null;
};

const MapHeader = ({map}: Props) => {
  const loggedIn = false; // TODO: make this real (maybe pass it down from App)
  const navigate = useNavigate();

  return (
    <Box sx={{
      position: 'fixed',
      top: 10,
      zIndex: 100,
      width: '100%',
      display: 'flex',
      justifyContent: 'right',
      px: 1,
    }}>
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
  );
};

export default MapHeader;
