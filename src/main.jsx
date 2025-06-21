import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { GoogleOAuthProvider } from '@react-oauth/google';
createRoot(document.getElementById('root')).render(
     <GoogleOAuthProvider clientId="729952540689-n4jp9iai0mqlqvv4ose7tfg85s06no8b.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
)
