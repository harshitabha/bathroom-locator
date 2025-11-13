import { Button, useTheme, Box, Typography } from '@mui/material';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import {useNavigate} from 'react-router-dom';
import React from 'react';


interface AuthHeaderProps {
    description: string;
}

const AuthHeader : React.FC<AuthHeaderProps> = ({description}) => {
  const navigate = useNavigate();
  const theme = useTheme();

    return (
        <Box 
            sx={{ p: {xs: 2, sm: 2} }}
        >
            <Button
                variant="text"
                className='back-button'
                sx={{
                    color: theme.palette.text.primary,
                    p: {xs: 0, sm: 1},
                    marginBottom: 1,
                }}
                onClick={() => navigate("/")}
            >
                <ArrowLeftIcon data-testid="back-arrow"/>
                Back to map
            </Button>
            <div className='auth-header'>
                <div className='app-logo'>
                    <LocationPinIcon
                        aria-label="location-icon"
                        className='location-icon'
                        sx={{color: theme.palette.secondary.main}}
                    />
                    <Typography
                        variant="h3"
                    >
                        <strong>Bathroom</strong>
                        <br/>
                        Locator
                    </Typography>
                </div>
                <Typography
                    className='description'
                    variant="body2"
                >
                    {description} to add new bathroom locations to the map or add details to existing bathrooms.
                </Typography>
            </div>
        </Box>
    )
}

export default AuthHeader;
