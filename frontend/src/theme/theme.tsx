import {createTheme} from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#576421',
      light: '#DAEA98',
    },
    secondary: {main: '#845416'},
    error: {main: '#F44336'},
    background: {default: '#FBFAED', paper: '#FBFAED'},
    text: {primary: '#000000'},
    action: {disabled: 'rgba(0, 0, 0, 0.38)', hover: 'rgba(0, 0, 0, 0.04)'},
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '12px',
          fontWeight: 'bold',
          textTransform: 'none',
        },
      },
    },
    MuiTypography: {
      variants: [
        {
          props: {variant: 'h3'},
          style: {
            lineHeight: 1,
            fontSize: '2.8rem',
          },
        },
        {
          props: {variant: 'h4'},
          style: {
            lineHeight: 1,
            fontSize: '2rem',
          },
        },
      ],
    },
  },
});

export default theme;
