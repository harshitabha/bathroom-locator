import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {Stack, TextField, Button, Alert} from '@mui/material';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import { useNavigate } from "react-router-dom";
import './Auth.css';

export default function SignUp () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    // use this for registering a new user
    async function signUpNewUser() {
        if (password != confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) {
            setErrorMessage(error.message);
        }
        else {
            setErrorMessage('');
            navigate("/");
        }
    }

    return (
        <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
            <div style={{marginTop: '10px'}}>
               <Button variant="contained" onClick={() => navigate("/")}>
                    Back to Map
                </Button> 
            </div>
            <div className='auth-header'>
                <div className='app-logo'>
                    <LocationPinIcon style={{width: '106px', height: '103px'}}/>
                        <span>
                        Bathroom 
                        <br />
                        Locator
                    </span>
                </div>
                <div className='description'>
                    Create an account to add new bathroom locations to the map or add details to existing bathrooms.
                </div>
            </div>
            <div className='auth-form'>
                <Stack spacing={5}>
                    <Stack spacing={2}>
                        <div style={{ textAlign: 'center', fontSize: '32px'}}>
                            Sign Up
                        </div>
                        <div>
                            {errorMessage ? (
                                <div>
                                    <Alert severity="error">{errorMessage}</Alert>
                                </div>
                            ) : null }
                        </div>
                        <TextField 
                            id="outlined-basic"
                            label="Email"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setEmail(event.target.value);
                            }}
                        />
                        <TextField 
                            id="outlined-basic" 
                            label="Password"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setPassword(event.target.value);
                            }}
                        />
                        <TextField 
                            id="outlined-basic" 
                            label="Confirm Password"
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                setConfirmPassword(event.target.value);
                            }}
                        />
                    </Stack>
                    <Stack spacing={2}>
                        <Button variant="contained" onClick={signUpNewUser}>
                            Sign Up
                        </Button>
                        <Button variant="outlined" onClick={() => navigate("/login")}>
                            Log In
                        </Button>
                    </Stack>
                </Stack>
            </div>
        </div>
    )
} 