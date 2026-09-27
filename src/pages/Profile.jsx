import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, updateProfile } from '../adobe/identity'
import { trackPageView, trackProfileUpdate, trackNewsletter } from '../adobe/track'

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getUser())
  const [form, setForm] = useState(user || {})
  const [saved, setSaved] = useState(false)

  // Data layer: opening the account page pushes a pageView named "profile".
  useEffect(() => { trackPageView('profile') }, [])
  useEffect(() => { if (!getUser()) navigate('/') }, [])

  if (!user) return null
  const up = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const save = (e) => {
    e.preventDefault()
    const next = updateProfile(form)
    setUser(next)
    // Data layer: saving preferences pushes a profileUpdate event carrying the new
    // attribute values (loyalty tier, dietary preference, city and so on). These
    // are the streaming profile attributes that build the AEP profile. If the
    // marketing consent was part of the form we also push a newsletterSignup event.
    trackProfileUpdate(next)
    if ('marketingConsent' in form) trackNewsletter({ email: next.email, consent: next.marketingConsent })
    setSaved(true); setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: 30, marginBottom: 20 }}>My account</h1>
      <div className="profile-grid">
        <div className="panel profile-card">
          <div className="avatar">{(user.firstName || user.email)[0].toUpperCase()}</div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user.firstName || 'Foodie'}</div>
          <div style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 10 }}>{user.email}</div>
          <span className="chip-tier">{user.loyaltyTier} member</span>
          <div className="divider" />
          <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'left' }}>
            <div>Customer ID: <code>{user.customerId}</code></div>
            <div style={{ marginTop: 6 }}>These attributes stream to your <b>AEP profile</b> and stitch to your ECID.</div>
          </div>
        </div>

        <form className="panel" onSubmit={save}>
          <h3>Preferences</h3>
          <div className="form-grid">
            <div className="field"><label>First name</label><input value={form.firstName || ''} onChange={up('firstName')} /></div>
            <div className="field"><label>City</label><input value={form.city || ''} onChange={up('city')} /></div>
            <div className="field"><label>Loyalty tier</label>
              <select value={form.loyaltyTier} onChange={up('loyaltyTier')}>
                <option>Silver</option><option>Gold</option><option>Platinum</option></select></div>
            <div className="field"><label>Dietary preference</label>
              <select value={form.dietaryPreference} onChange={up('dietaryPreference')}>
                <option value="none">No preference</option><option value="veg">Vegetarian</option>
                <option value="vegan">Vegan</option><option value="non-veg">Non-vegetarian</option></select></div>
            <div className="field full"><label>Favorite cuisine</label>
              <select value={form.favoriteCuisine || ''} onChange={up('favoriteCuisine')}>
                <option value="">Any</option><option>Italian</option><option>Indian</option>
                <option>Japanese</option><option>American</option><option>French</option></select></div>
            <div className="field full" style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="mc" checked={!!form.marketingConsent} onChange={up('marketingConsent')} />
              <label htmlFor="mc" style={{ textTransform: 'none', letterSpacing: 0 }}>Email me deals &amp; offers</label></div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 18 }} type="submit">Save preferences</button>
          {saved && <span style={{ color: 'var(--green)', marginLeft: 12, fontWeight: 600 }}>✓ Saved &amp; sent to AEP</span>}
        </form>
      </div>
    </div>
  )
}
