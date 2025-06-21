import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { GoogleOAuthProvider } from '@react-oauth/google';
createRoot(document.getElementById('root')).render(
     <GoogleOAuthProvider clientId="1058441969384-pubcqga2i5ttafrlff3i6i6ef3q5fjoj.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
)
