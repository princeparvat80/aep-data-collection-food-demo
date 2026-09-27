import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../CartContext.jsx'
import { trackCartView } from '../adobe/track'

export default function CartDrawer({ open, onClose }) {
  const { items, add, decrement, remove, total } = useCart()
  const navigate = useNavigate()
  // Fire a cartView event whenever the drawer is opened with items in it.
  useEffect(() => { if (open) trackCartView(items) }, [open]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!open) return null

  const goCheckout = () => { onClose(); navigate('/checkout') }

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <aside className="drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-head">
          <h3>Your order 🛒</h3>
          <button className="modal-close" style={{ position: 'static' }} onClick={onClose}>×</button>
        </div>
        <div className="drawer-body">
          {!items.length && <div className="empty">Your cart is empty.<br />Add something tasty!</div>}
          {items.map(({ dish, qty }) => (
            <div className="cart-row" key={dish.id}>
              <img src={dish.image} alt={dish.name} />
              <div className="grow">
                <div style={{ fontWeight: 700 }}>{dish.name}</div>
                <div style={{ color: 'var(--muted)', fontSize: 13 }}>${dish.price.toFixed(2)}</div>
              </div>
              <div className="qty">
                <button onClick={() => decrement(dish)}>−</button>
                {qty}
                <button onClick={() => add(dish, 1)}>+</button>
              </div>
              <button className="modal-close" style={{ position: 'static', fontSize: 20 }} onClick={() => remove(dish)}>×</button>
            </div>
          ))}
        </div>
        <div className="drawer-foot">
          <div className="row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 12 }} disabled={!items.length} onClick={goCheckout}>
            Checkout
          </button>
        </div>
      </aside>
    </div>
  )
}
