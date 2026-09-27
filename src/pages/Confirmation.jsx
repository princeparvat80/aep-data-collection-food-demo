import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { trackPageView, trackOrderRating } from '../adobe/track'

export default function Confirmation() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [rated, setRated] = useState(0)
  // Data layer: the confirmation page pushes a pageView named "order-confirmation".
  // The purchase event itself was already sent on the checkout page.
  useEffect(() => { trackPageView('order-confirmation') }, [])

  if (!state?.order) return (
    <div className="container section confirm"><h1>No recent order</h1>
      <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => navigate('/')}>Back home</button></div>
  )

  const { order, name } = state
  // Data layer: choosing a star rating pushes an orderRating event with the order
  // id and the number of stars.
  const rate = (stars) => { setRated(stars); trackOrderRating({ orderId: order.id, stars }) }

  return (
    <div className="container confirm">
      <div className="confirm-badge">✓</div>
      <h1>Order placed! 🎉</h1>
      <p style={{ color: 'var(--muted)', marginTop: 8 }}>Thanks {name || 'foodie'} — your food is on the way.</p>
      <div className="order-id">Order ID: {order.id}</div>

      <div className="panel" style={{ maxWidth: 460, margin: '28px auto 0', textAlign: 'left' }}>
        {order.items.map((i) => (
          <div className="row" key={i.id}><span>{i.quantity}× {i.name}</span><span>${i.priceTotal.toFixed(2)}</span></div>
        ))}
        <div className="divider" />
        <div className="row total"><span>Total paid</span><span>${order.total.toFixed(2)}</span></div>
      </div>

      <div style={{ marginTop: 28 }}>
        <p style={{ fontWeight: 700, marginBottom: 8 }}>How was your experience?</p>
        <div style={{ fontSize: 34, letterSpacing: 6 }}>
          {[1, 2, 3, 4, 5].map((s) => (
            <span key={s} style={{ cursor: 'pointer', color: s <= rated ? 'var(--accent)' : '#ddd' }} onClick={() => rate(s)}>★</span>
          ))}
        </div>
        {rated > 0 && <p style={{ color: 'var(--green)', marginTop: 8 }}>Thanks for rating {rated}★!</p>}
      </div>

      <div style={{ marginTop: 28 }}>
        <Link to="/menu" className="btn btn-primary">Order again</Link>
      </div>
    </div>
  )
}
