import {createTheme} from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom?: {
      searchPaper: string;
    };
  }
  interface PaletteOptions {
    custom?: {
      searchPaper?: string;
    };
  }
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#576421',
      light: '#DAEA98',
    },
    secondary: {main: '#845416'},
    error: {main: '#904A43'},
    background: {default: '#FBFAED', paper: '#FBFAED'},
    text: {primary: '#000000', secondary: '#76786B'},
    custom: {searchPaper: '#FFFFFF'},
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
