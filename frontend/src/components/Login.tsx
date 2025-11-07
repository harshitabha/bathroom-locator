import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {Stack, TextField, Button, Alert} from '@mui/material';
import LocationPinIcon from '@mui/icons-material/LocationPin';
import { useNavigate } from "react-router-dom";
import './Auth.css';

export default function Login () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    async function signInWithEmail() {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
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
                    Log in to add new bathroom locations to the map or add details to existing bathrooms.
                </div>
            </div>
            <div className='auth-form'>
                <Stack spacing={5}>
                    <Stack spacing={2}>
                        <div style={{ textAlign: 'center', fontSize: '32px'}}>
                            Login
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
                    </Stack>
                    <Stack spacing={2}>
                        <Button variant="contained" onClick={signInWithEmail}>
                            Login
                        </Button>
                        <Button variant="outlined" onClick={() => navigate("/SignUp")}>
                            Sign Up
                        </Button>
                    </Stack>
                </Stack>
            </div>
        </div>
    )
} 