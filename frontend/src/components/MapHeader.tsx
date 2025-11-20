import {Box, Button, Avatar, Menu, MenuItem} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useState, useEffect} from 'react';
import SearchBar from './SearchBar';
import Logout from './Logout';
import {getCurrentUserId} from '../lib/supabaseClient';

type Props = {
  map: google.maps.Map | null;
};

const MapHeader = ({map}: Props) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>('');

  // handling dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    getCurrentUserId().then(setUserId);
  }, []);


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
      {userId ? (
        <>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              color: 'background.default',
            }}
            onClick={handleAvatarClick}
            aria-label='profile-picture'
          />
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem>
              <Logout setUserId={setUserId}/>
            </MenuItem>
          </Menu>
        </> ):
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
