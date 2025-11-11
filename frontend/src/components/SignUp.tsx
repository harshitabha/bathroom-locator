import {useState} from 'react';
import {supabase} from '../lib/supabaseClient';
import {Stack, TextField, Button, Alert} from '@mui/material';
import AuthHeader from './AuthHeader';
import {useNavigate} from 'react-router-dom';
import './Auth.css';

const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  // use this for registering a new user
  /**
   *
   */
  async function signUpNewUser() {
    if (password != confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }
    const {error} = await supabase.auth.signUp({email, password});
    if (error) {
      const emailErr = 'Unable to validate email address: invalid format';
      if (error.message === emailErr) {
        error.message = 'Invalid email format';
      }
      setErrorMessage(error.message);
    } else {
      setErrorMessage('');
      navigate('/');
    }
  }

  const description = 'Create an account ';

  return (
    <div className='auth-screen'>
      <AuthHeader description={description}/>
      <div className='auth-form'>
        <Stack spacing={5}>
          <Stack spacing={2}>
            <div className='auth-form-name'>
                            Sign Up
            </div>
            <div>
              {errorMessage ? (
                                <div>
                                  <Alert severity="error">{errorMessage}</Alert>
                                </div>
                            ) : null}
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
              <TextField
                variant="outlined"
                label="Confirm Password"
                type="password"
                className='input-box'
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  setConfirmPassword(event.target.value);
                }}
              />
            </Stack>
          </Stack>
          <Stack spacing={2}>
            <Button
              disabled={
                email === '' || password === '' || confirmPassword === ''
              }
              variant="contained"
              data-testid="signup-button"
              className='button'
              onClick={signUpNewUser}>
              Sign Up
            </Button>
            <Button
              variant="outlined"
              data-testid="login-button"
              className='button'
              onClick={() => navigate('/login')}>
              Login
            </Button>
          </Stack>
        </Stack>
      </div>
    </div>
  );
};

export default SignUp;
