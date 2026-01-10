
import './App.css'
import CssBaseline from '@mui/material/CssBaseline';
import Viewer from './pages/viewer'
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1a2a3a',
      light: '#2c3e50',
      dark: '#1a2a3a',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f48fb1', // Pink - you can change this to any color you want
      light: '#fce4ec',
      dark: '#f06292',
      contrastText: '#000000',
    },
  },
  
});


function App() {
  return (
    <ThemeProvider theme={darkTheme}>
    <CssBaseline />
      <Viewer/>
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </ThemeProvider>
  )
}

export default App




