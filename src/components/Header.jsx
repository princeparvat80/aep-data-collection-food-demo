import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useCart } from '../CartContext.jsx'
import CartDrawer from './CartDrawer.jsx'
import SignInModal from './SignInModal.jsx'
import { getUser, onUserChange, signOut } from '../adobe/identity'
import { dataLayer } from '../dataLayer'

export default function Header() {
  const { count } = useCart()
  const navigate = useNavigate()
  const [cartOpen, setCartOpen] = useState(false)
  const [signOpen, setSignOpen] = useState(false)
  const [user, setUser] = useState(getUser())
  useEffect(() => onUserChange(setUser), [])

  // Data layer: signing out pushes a logout event, then clears the stored user so
  // later events go back to being anonymous.
  const doSignOut = () => { dataLayer.logout(); signOut() }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo"><span className="logo-badge">🍔</span> Feastly</Link>
        <nav className="nav">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          {user && <NavLink to="/profile">Profile</NavLink>}
        </nav>
        <div className="header-cta">
          {user ? (
            <>
              <span className="nav" style={{ color: 'var(--brand)', fontWeight: 700 }}>Hi, {user.firstName || user.email.split('@')[0]}</span>
              <button className="btn btn-outline btn-sm" onClick={doSignOut}>Sign out</button>
            </>
          ) : (
            <button className="btn btn-outline btn-sm" onClick={() => setSignOpen(true)}>Sign in</button>
          )}
          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            🛒 Cart{count > 0 && <span className="cart-badge">{count}</span>}
          </button>
        </div>
      </div>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SignInModal open={signOpen} onClose={() => setSignOpen(false)} onDone={() => navigate('/profile')} />
    </header>
  )
}
