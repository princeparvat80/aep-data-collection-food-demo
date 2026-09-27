import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../CartContext.jsx'
import { getUser } from '../adobe/identity'
import { trackCheckout, trackPurchase } from '../adobe/track'

function newOrderId() { return 'FST-' + Math.random().toString(36).slice(2, 8).toUpperCase() }

export default function Checkout() {
  const { items, total, clear } = useCart()
  const navigate = useNavigate()
  const user = getUser()
  const [form, setForm] = useState({
    name: user?.firstName || '', email: user?.email || '', phone: '',
    address: '', paymentMethod: 'credit-card',
  })

  // Data layer: opening the checkout page pushes a checkout event, which sets
  // commerce.checkouts and the list of items in the cart.
  useEffect(() => {
    if (items.length) trackCheckout(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!items.length) return (
    <div className="container section"><h2>Your cart is empty</h2>
      <button className="btn btn-primary" onClick={() => navigate('/menu')}>Browse the menu</button></div>
  )

  const up = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const placeOrder = (e) => {
    e.preventDefault()
    const order = {
      id: newOrderId(),
      total,
      paymentMethod: form.paymentMethod,
      itemCount: items.reduce((s, i) => s + i.qty, 0),
      items: items.map((i) => ({ id: i.dish.id, name: i.dish.name, category: i.dish.category,
        cuisine: i.dish.cuisine, price: i.dish.price, quantity: i.qty, priceTotal: +(i.dish.price * i.qty).toFixed(2) })),
    }
    // Data layer: placing the order pushes a purchase event. This is the most
    // important event of the funnel. It sets commerce.purchases, the order id and
    // revenue, and the full list of purchased items, which become the order and
    // revenue metrics in Adobe.
    trackPurchase(order)
    clear()
    navigate('/confirmation', { state: { order, name: form.name } })
  }

  const tax = +(total * 0.08).toFixed(2)
  const delivery = 2.99

  return (
    <div className="container section">
      <h1 style={{ fontSize: 30, marginBottom: 18 }}>Checkout</h1>
      <form className="checkout-grid" onSubmit={placeOrder}>
        <div className="panel">
          <h3>Delivery details</h3>
          <div className="form-grid">
            <div className="field"><label>Name</label><input required value={form.name} onChange={up('name')} /></div>
            <div className="field"><label>Phone</label><input value={form.phone} onChange={up('phone')} /></div>
            <div className="field full"><label>Email</label><input type="email" required value={form.email} onChange={up('email')} /></div>
            <div className="field full"><label>Delivery address</label><input required value={form.address} onChange={up('address')} /></div>
          </div>
          <h3 style={{ marginTop: 22 }}>Payment</h3>
          <div className="field full"><label>Payment method</label>
            <select value={form.paymentMethod} onChange={up('paymentMethod')}>
              <option value="credit-card">Credit card</option><option value="debit-card">Debit card</option>
              <option value="paypal">PayPal</option><option value="upi">UPI</option><option value="cash">Cash on delivery</option>
            </select></div>
        </div>
        <aside className="panel">
          <h3>Order summary</h3>
          {items.map(({ dish, qty }) => (
            <div className="row" key={dish.id}><span>{qty}× {dish.name}</span><span>${(dish.price * qty).toFixed(2)}</span></div>
          ))}
          <div className="divider" />
          <div className="row"><span>Subtotal</span><span>${total.toFixed(2)}</span></div>
          <div className="row"><span>Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="row"><span>Delivery</span><span>${delivery.toFixed(2)}</span></div>
          <div className="divider" />
          <div className="row total"><span>Total</span><span>${(total + tax + delivery).toFixed(2)}</span></div>
          <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} type="submit">Place order</button>
        </aside>
      </form>
    </div>
  )
}
