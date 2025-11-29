import './Auth.css';
import {supabase} from '../lib/supabaseClient';
import AuthHeader from './AuthHeader';

import {Stack, TextField, Button, Alert, Typography} from '@mui/material';
import {useContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import AppContext from '../context/AppContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const appContext = useContext(AppContext);

  /**
   * Try to sign in the user with the given email
   */
  async function signInWithEmail() {
    const {error} = await supabase.auth.signInWithPassword(
        {email: email, password: password},
    );
    if (error) {
      setErrorMessage(error.message);
    } else {
      appContext?.getCurrentUserId();
      setErrorMessage('');
      navigate('/');
    }
  }

  const description = 'Log in ';

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
              {
                errorMessage ?
                <div>
                  <Alert severity="error">{errorMessage}</Alert>
                </div> : null
              }
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
            <Button
              disabled={email === '' || password === ''}
              variant='contained'
              className='button'
              onClick={signInWithEmail}
            >
              Login
            </Button>
            <Button
              variant='outlined'
              className='button'
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </Button>
          </Stack>
        </Stack>
      </div>
    </div>
  );
};

export default Login;
