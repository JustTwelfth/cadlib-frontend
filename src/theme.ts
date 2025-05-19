import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#1C2526',
      paper: '#2C3E50',
    },
    text: {
      primary: '#ECF0F1',
      secondary: '#BDC3C7',
    },
    primary: {
      main: '#3498DB',
    },
    secondary: {
      main: '#ECF0F1',
    },
    error: {
      main: '#E74C3C',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
        },
        containedPrimary: {
          backgroundColor: '#3498DB',
          '&:hover': {
            backgroundColor: '#2980B9',
          },
        },
        containedSecondary: {
          backgroundColor: '#ECF0F1',
          color: '#2C3E50',
          '&:hover': {
            backgroundColor: '#BDC3C7',
          },
        },
        outlined: {
          borderColor: '#BDC3C7',
          color: '#ECF0F1',
          '&:hover': {
            borderColor: '#ECF0F1',
            backgroundColor: 'rgba(236, 240, 241, 0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            backgroundColor: '#2C3E50',
            color: '#ECF0F1',
          },
          '& .MuiInputLabel-root': {
            color: '#BDC3C7',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#BDC3C7',
            },
            '&:hover fieldset': {
              borderColor: '#ECF0F1',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3498DB',
            },
          },
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C3E50',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          color: '#ECF0F1',
          borderBottom: '1px solid #BDC3C7',
        },
        head: {
          backgroundColor: '#1C2526',
          color: '#ECF0F1',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#2C3E50',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2C3E50',
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(28, 37, 38, 0.8)',
          },
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#3498DB',
          textDecoration: 'none',
          '&:hover': {
            color: '#2980B9',
            textDecoration: 'underline',
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          backgroundColor: '#BDC3C7',
        },
      },
    },
  },
});

export default theme;