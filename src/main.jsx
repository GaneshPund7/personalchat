import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import { GoogleOAuthProvider } from '@react-oauth/google';
createRoot(document.getElementById('root')).render(
     <GoogleOAuthProvider clientId="729952540689-1m078l5blh5gfqr0l0o9o0q5ffkblmkj.apps.googleusercontent.com">
      <App />
      
    </GoogleOAuthProvider>
)
// 729952540689-1m078l5blh5gfqr0l0o9o0q5ffkblmkj.apps.googleusercontent.com