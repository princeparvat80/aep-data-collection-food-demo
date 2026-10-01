import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { loadTags } from './adobe/loader'
import { keepAssuranceSession } from './adobe/assurance'

// Application entry point. Before React renders, we keep the Adobe Assurance
// validation session id (adb_validation_sessionid) attached to the URL across
// client-side navigation. Without this, the first in-app navigation strips the
// parameter and Assurance stops receiving events. Then we load the Adobe Tags
// (Launch) library from the configured embed URL so the data layer listeners
// are ready.
// React StrictMode is deliberately left out here. In development it runs effects
// twice, which would make every tracking event fire twice.
keepAssuranceSession()
loadTags()

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
