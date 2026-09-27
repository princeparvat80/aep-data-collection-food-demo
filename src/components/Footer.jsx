import { useState } from 'react'
import AdobeConfigPanel from './AdobeConfigPanel.jsx'
import { isConfigured } from '../adobe/config'

export default function Footer() {
  const [cfgOpen, setCfgOpen] = useState(false)
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="logo">🍔 Feastly</div>
        <small style={{ color: '#a89b94' }}>
          Demo for learning Adobe Data Collection - AEP. Not a real restaurant 😉
        </small>
        <button onClick={() => setCfgOpen(true)}>
          ⚙️ Adobe Config {isConfigured() ? '🟢' : '🔴'}
        </button>
      </div>
      <AdobeConfigPanel open={cfgOpen} onClose={() => setCfgOpen(false)} />
    </footer>
  )
}
