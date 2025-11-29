import {Box, Button, Avatar, Menu, MenuItem} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useState, useContext} from 'react';
import SearchBar from './SearchBar';
import AddBathroomBanner from './AddBathroomBanner';
import MapFilters, {
  type AmenityFilter,
} from './MapFilters';
import AppContext from '../context/AppContext';
import {supabase} from '../lib/supabaseClient';

type Props = {
  map: google.maps.Map | null;
  bannerOpen: boolean;
  onCancelBanner: () => void;
  selectedAmenities: AmenityFilter[];
  onAmenitiesChange: (next: AmenityFilter[]) => void;
};

const MapHeader = ({
  map,
  bannerOpen,
  onCancelBanner,
  selectedAmenities,
  onAmenitiesChange,
}: Props) => {
  const navigate = useNavigate();
  const appContext = useContext(AppContext);

  // handling dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = anchorEl ? true : false;
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  /**
   * signs out current user
   */
  async function signOutUser() {
    const {error} = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      appContext?.setUserId(null);
    }
  }

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
        {appContext?.userId ? (
        <>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              color: 'background.default',
            }}
            onClick={handleAvatarClick}
            aria-label='Profile Picture'
          />
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            sx={{marginTop: 1}}
          >
            <MenuItem
              onClick={() => {
                signOutUser();
                onCancelBanner();
              }}
              sx={{paddingY: 0}}
            >
              Logout
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
      {/* row 2, bathroom banner */}
      <AddBathroomBanner bannerOpen={bannerOpen} onCancel={onCancelBanner} />
      {/* row 3, filters */}
      <MapFilters
        selectedAmenities={selectedAmenities}
        onAmenitiesChange={onAmenitiesChange}
      />
    </Box>
  );
};

export default MapHeader;
