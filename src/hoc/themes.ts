// A custom theme for this app
import {createTheme, Theme} from '@mui/material';
import {red} from '@mui/material/colors';
import Assistant from '../assets/fonts/Assistant-Regular.ttf';
import {SxProps} from '@mui/system';

// @ts-ignore
// @ts-ignore
// @ts-ignore
// @ts-ignore
export const themeMain: Theme = createTheme({
    direction: 'ltr',
    typography: {
        fontFamily: 'Segoe UI, sans-serif',
        h1: {
            fontSize: '3rem',
            marginTop: 0,
            marginBottom: 0
        }
    },


    components: {
        MuiCssBaseline: {
            styleOverrides: `
        @font-face {
          font-family: 'Assistant';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('Assistant'), local('Assistant-Regular'), url(${Assistant}) format('ttf');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }
      `,
            
        },

        MuiSelect: {
            styleOverrides: {icon: {position: 'relative'}},

        }
    },

    palette: {
        primary: {
            main: '#297b00',
        },
        secondary: {
            main: '#1879be',
        },
        error: {
            main: red.A400,
        },
        background: {
            default: '#fff',
        },
    },


});

export const Colors: Record<string, string> = {
    'warningRed': 'rgb(212,4,4)',
    'warningYellow': '#fcd632'
}
export const Styles: Record<string, SxProps> = {
    smallIcons: {
        height: '0.7em',
        width: '0.7em'
    },
    flexRow: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'start',
        alignContent: 'start'
    },
    flexColumn: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'start',
        alignContent: 'start'
    },
    divider: {
        height: '20px',
        width: '20px',
    },
    toolTip: {
        height: '20px',
        width: '20px',
    }

}
