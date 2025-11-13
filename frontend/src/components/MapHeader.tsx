import {Box, Button, Avatar} from '@mui/material';
import { useNavigate } from 'react-router-dom';


export default function MapHeader() {
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
      px: 1
    }}>
      
      {loggedIn ?
      <Avatar 
        sx={{
          bgcolor: 'primary.main',
          color: 'background.default',
        }}
        aria-label='profile-picture'
      />
      :
      <Button
        variant="contained"
        size="small"
        color="secondary"
        sx={{
          padding: '7px',
          borderRadius: '25px',
        }}
        onClick={() => navigate("/login")}
      >
        Login
      </Button>
      }
    </Box>
  );
}