import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { loadTags } from './adobe/loader'

// Load the Adobe Tags (Launch) library from the configured embed URL (if any).
// No StrictMode: it double-invokes effects in dev and would double-fire events.
loadTags()

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
