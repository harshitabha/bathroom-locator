import {Box, Button, Avatar, Menu, MenuItem} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useState, useEffect, useContext} from 'react';
import SearchBar from './SearchBar';
import MapFilters, {
  type GenderFilter,
  type StallsFilter,
  type AmenityFilter,
  type CleanlinessFilter,
} from './MapFilters';
import AddBathroomBanner from './AddBathroomBanner';
import AppContext from '../context/AppContext';
import {supabase} from '../lib/supabaseClient';

type Props = {
  map: google.maps.Map | null;
  bannerOpen: boolean;
  onCancelBanner: () => void;
  selectedGenders?: GenderFilter[];
  selectedStalls?: StallsFilter[];
  selectedAmenities?: AmenityFilter[];
  selectedCleanliness?: CleanlinessFilter[];
  onGendersChange?: (next: GenderFilter[]) => void;
  onStallsChange?: (next: StallsFilter[]) => void;
  onAmenitiesChange?: (next: AmenityFilter[]) => void;
  onCleanlinessChange?: (next: CleanlinessFilter[]) => void;
};

const MapHeader = ({
  map,
  bannerOpen,
  onCancelBanner,
  selectedGenders,
  selectedStalls,
  selectedAmenities,
  selectedCleanliness,
  onGendersChange,
  onStallsChange,
  onAmenitiesChange,
  onCleanlinessChange,
}: Props) => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>('');
  const appContext = useContext(AppContext);

  // handling dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = anchorEl ? true : false;
  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => setAnchorEl(null);

  useEffect(() => {
    appContext?.getCurrentUserId().then(setUserId);
  }, []);

  /**
   * signs out current user
   */
  async function signOutUser() {
    const {error} = await supabase.auth.signOut();

    if (error) {
      console.error('Error signing out:', error.message);
    } else {
      setUserId(null);
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
      {!bannerOpen && (
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
          {userId ? (
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
              <MenuItem onClick={signOutUser} sx={{paddingY: 0}}>
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
      )}
      {/* row 2, bathroom banner */}
      <AddBathroomBanner bannerOpen={bannerOpen} onCancel={onCancelBanner} />

      {/* row 3, filter buttons */}
      {!bannerOpen && (
        <MapFilters
          selectedGenders={selectedGenders ?? []}
          selectedStalls={selectedStalls ?? []}
          selectedAmenities={selectedAmenities ?? []}
          selectedCleanliness={selectedCleanliness ?? []}
          onGendersChange={onGendersChange ?? (() => {})}
          onStallsChange={onStallsChange ?? (() => {})}
          onAmenitiesChange={onAmenitiesChange ?? (() => {})}
          onCleanlinessChange={onCleanlinessChange ?? (() => {})}
        />
      )}
    </Box>
  );
};

export default MapHeader;
