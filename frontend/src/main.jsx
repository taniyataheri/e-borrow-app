import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from "./context/authContext";
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Nav } from 'react-bootstrap';

createRoot(document.getElementById('root')).render(
  <AuthProvider>
  <StrictMode>
    <App />
  </StrictMode>
  </AuthProvider>,
)
