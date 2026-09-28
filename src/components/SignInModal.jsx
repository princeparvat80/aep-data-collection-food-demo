import { useState } from 'react'
import { signIn } from '../adobe/identity'
import { dataLayer } from '../dataLayer'

const CUISINES = ['', 'Italian', 'Indian', 'Japanese', 'American', 'French']

// Demo-only sign-in / sign-up. No real auth — it captures identity (email) and a
// few profile attributes so AEP can build a profile and stitch it to the ECID.
export default function SignInModal({ open, onClose, onDone }) {
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({
    email: '', firstName: '', loyaltyTier: 'Silver',
    dietaryPreference: 'none', favoriteCuisine: '', city: '', marketingConsent: true,
  })
  if (!open) return null
  const up = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const submit = (e) => {
    e.preventDefault()
    // signIn stores the user locally so future events carry the email identity.
    // Then we push either a signup or a login event to the data layer. This is the
    // moment the visitor becomes known, so from here on the email is added to the
    // identity map and Adobe can stitch it to the earlier anonymous activity.
    const user = signIn(form)
    if (mode === 'signup') dataLayer.signup(user)
    else dataLayer.login(user)
    onDone?.(user)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h3 style={{ fontSize: 22 }}>{mode === 'signup' ? 'Create your Feastly account' : 'Welcome back 👋'}</h3>
        <p style={{ color: 'var(--muted)', margin: '4px 0 16px' }}>
          {mode === 'signup' ? 'Tell us a bit about your taste.' : 'Sign in to order and earn rewards.'}
        </p>
        <form onSubmit={submit}>
          <div className="form-grid">
            <div className="field full"><label>Email</label>
              <input type="email" required placeholder="you@example.com" value={form.email} onChange={up('email')} /></div>
            {mode === 'signup' && <>
              <div className="field"><label>First name</label><input value={form.firstName} onChange={up('firstName')} /></div>
              <div className="field"><label>City</label><input value={form.city} onChange={up('city')} /></div>
              <div className="field"><label>Dietary preference</label>
                <select value={form.dietaryPreference} onChange={up('dietaryPreference')}>
                  <option value="none">No preference</option><option value="veg">Vegetarian</option>
                  <option value="vegan">Vegan</option><option value="non-veg">Non-vegetarian</option>
                </select></div>
              <div className="field"><label>Favorite cuisine</label>
                <select value={form.favoriteCuisine} onChange={up('favoriteCuisine')}>
                  {CUISINES.map((c) => <option key={c} value={c}>{c || 'Any'}</option>)}
                </select></div>
              <div className="field full" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={form.marketingConsent} onChange={up('marketingConsent')} id="mc" />
                <label htmlFor="mc" style={{ textTransform: 'none', letterSpacing: 0 }}>Email me deals & offers</label></div>
            </>}
          </div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 18 }} type="submit">
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 14, fontSize: 14, color: 'var(--muted)' }}>
          {mode === 'signup' ? 'Already have an account? ' : 'New to Feastly? '}
          <button style={{ background: 'none', color: 'var(--brand)', fontWeight: 700 }}
            onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>
            {mode === 'signup' ? 'Sign in' : 'Create one'}
          </button>
        </p>
      </div>
    </div>
  )
}
