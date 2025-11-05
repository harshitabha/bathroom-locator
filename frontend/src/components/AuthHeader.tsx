import { Button, useTheme} from '@mui/material';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import { useNavigate } from "react-router-dom";
import React from 'react';


interface AuthHeaderProps {
    description: string;
}

const AuthHeader : React.FC<AuthHeaderProps> = ({ description }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <div>
            <Button variant="text" className='back-button' sx={{color: theme.palette.text.primary}} onClick={() => navigate("/")}>
                <ArrowLeftIcon data-testid="back-arrow"/>
                Back to map
            </Button>
            <div className='auth-header'>
                <div className='app-logo'>
                    <LocationPinIcon data-testid="location-pin" className='location-icon' sx={{color: theme.palette.secondary.main}}/>
                    <span>
                        <strong>Bathroom</strong>
                        <br />
                        Locator
                    </span>
                </div>
                <div className='description'>
                    {description}
                </div>
            </div>
        </div>
    )
}

export default AuthHeader;