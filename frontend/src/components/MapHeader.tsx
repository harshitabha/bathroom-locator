import {Box, Button, Avatar} from '@mui/material';
import { Link } from 'react-router-dom';

export default function MapHeader() {
  const loggedIn = localStorage.length >= 1; // TODO: make this real (maybe pass it down from App)
  
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
        sx={{bgcolor: 'primary.main', color: 'background.default'}}
      />
      :
      <Link to="/login">
        <Button
          variant="contained"
          size="small"
          color="secondary"
          sx={{
            padding: '7px',
            borderRadius: '25px',
          }}>
          Login
        </Button>
      </Link>
      }
    </Box>
  );
}