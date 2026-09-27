import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { loadTags } from './adobe/loader'

// Application entry point. Before React renders, we load the Adobe Tags (Launch)
// library from the configured embed URL so the data layer listeners are ready.
// React StrictMode is deliberately left out here. In development it runs effects
// twice, which would make every tracking event fire twice.
loadTags()

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
)
