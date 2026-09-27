import { useState } from 'react'
import { getConfig, saveConfig, clearConfig, isConfigured } from '../adobe/config'

// The reusability panel: teammates paste their OWN Tags (Launch) embed URL here
// (and optionally datastream/org for reference). Saved to localStorage; the page
// reloads to load their library. No code edits required.
export default function AdobeConfigPanel({ open, onClose }) {
  const [cfg, setCfg] = useState(getConfig())
  if (!open) return null
  const up = (k) => (e) => setCfg({ ...cfg, [k]: e.target.value })

  const save = () => {
    saveConfig(cfg)
    window.location.reload()
  }
  const reset = () => {
    clearConfig()
    window.location.reload()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3 style={{ fontSize: 22 }}>⚙️ Adobe Config</h3>
        <p style={{ color: 'var(--muted)', margin: '4px 0 14px' }}>
          Point this demo at <b>your own</b> Adobe setup — no code changes needed.
        </p>

        <div className="cfg-note" style={{ marginBottom: 16 }}>
          Status:&nbsp;
          <span className="cfg-status">
            <span className={`dot ${isConfigured() ? 'on' : 'off'}`} />
            {isConfigured() ? 'Tags library configured — sending to AEP' : 'Data-layer-only (no Tags embed set)'}
          </span>
        </div>

        <div className="field full" style={{ marginBottom: 12 }}>
          <label>Tags (Launch) embed URL *</label>
          <input placeholder="https://assets.adobedtm.com/.../launch-XXXX-development.min.js"
            value={cfg.tagsEmbedUrl} onChange={up('tagsEmbedUrl')} />
        </div>
        <div className="form-grid">
          <div className="field"><label>Datastream ID (reference)</label>
            <input placeholder="xxxxxxxx-xxxx-..." value={cfg.datastreamId} onChange={up('datastreamId')} /></div>
          <div className="field"><label>IMS Org ID (reference)</label>
            <input placeholder="XXXX@AdobeOrg" value={cfg.orgId} onChange={up('orgId')} /></div>
          <div className="field full"><label>Sandbox (reference)</label>
            <input placeholder="prod" value={cfg.sandbox} onChange={up('sandbox')} /></div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button className="btn btn-primary btn-block" onClick={save}>Save &amp; reload</button>
          <button className="btn btn-outline" onClick={reset}>Reset</button>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 14 }}>
          Get the embed URL from <b>Data Collection → Tags → your property → Environments</b>.
          Only the embed URL is required; the rest are shown in the UI for your reference.
        </p>
      </div>
    </div>
  )
}
