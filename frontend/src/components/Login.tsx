import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import {Stack, TextField, Button, Alert, Typography} from '@mui/material';
import { useNavigate } from "react-router-dom";
import AuthHeader from './AuthHeader';
import './Auth.css';

export default function Login () {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    
    async function signInWithEmail() {
        const { error } = await supabase.auth.signInWithPassword({ email: email, password: password })
        if (error) {
            if (error.message === "missing email or phone") {
                error.message = "Missing credentials";
            }
            setErrorMessage(error.message);
        }
        else {
            setErrorMessage('');
            navigate("/");
        }
    }

    const description = "Log in ";
    
    return (
        <div className='auth-screen'>
            <AuthHeader description={description}/>
            <div className='auth-form'>
                <Stack spacing={5}>
                    <Stack spacing={2}>
                        <Typography
                            className='auth-form-name'
                            variant="h4"
                        >
                            Login
                        </Typography>
                        <div>
                            {errorMessage ? (
                                <div>
                                    <Alert severity="error">{errorMessage}</Alert>
                                </div>
                            ) : null }
                        </div>
                        <Stack spacing={4}>
                            <TextField 
                                variant="outlined"
                                label="Email"
                                className='input-box'
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setEmail(event.target.value);
                                }}
                            />
                            <TextField 
                                variant="outlined"
                                label="Password"
                                type="password"
                                className='input-box'
                                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    setPassword(event.target.value);
                                }}
                            />
                        </Stack>
                    </Stack>
                    <Stack spacing={2}>
                        <Button disabled={email === '' || password === ''} variant="contained" className='button' onClick={signInWithEmail}>
                            Login
                        </Button>
                        <Button variant="outlined" className='button' onClick={() => navigate("/signup")}>
                            Sign Up
                        </Button>
                    </Stack>
                </Stack>
            </div>
        </div>
    )
} 
