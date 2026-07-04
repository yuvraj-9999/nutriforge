import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/*
     * BrowserRouter is the outermost application provider.
     * It owns the routing context for the entire app.
     * All Router-dependent providers and components must live inside it.
     */}
    <BrowserRouter>
      {/*
       * AuthProvider lives inside BrowserRouter because it calls useNavigate()
       * internally (inside handleSessionExpired). useNavigate() requires a
       * Router context to exist above it in the tree.
       */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
