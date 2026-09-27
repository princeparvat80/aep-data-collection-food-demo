import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { findDish } from '../data/menu'
import { useCart } from '../CartContext.jsx'
import { trackDishView } from '../adobe/track'

export default function DishDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dish = findDish(id)
  const { add } = useCart()
  const [qty, setQty] = useState(1)

  useEffect(() => { if (dish) trackDishView(dish) }, [id])

  if (!dish) return (
    <div className="container section"><h2>Dish not found</h2>
      <button className="btn btn-primary" onClick={() => navigate('/menu')}>Back to menu</button></div>
  )

  return (
    <div className="container section">
      <div className="detail">
        <div className="detail-img"><img src={dish.image} alt={dish.name} /></div>
        <div>
          <span className="card-cat">{dish.category} · {dish.cuisine}</span>
          <h1>{dish.emoji} {dish.name}</h1>
          <div className="tags">
            <span className="tag">{dish.veg ? '🟢 Veg' : '🔴 Non-veg'}</span>
            <span className="tag">🌶 {dish.spiceLevel}</span>
            <span className="tag">★ {dish.rating}</span>
          </div>
          <p style={{ color: 'var(--muted)' }}>{dish.desc}</p>
          <div className="price">${dish.price.toFixed(2)}</div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginTop: 8 }}>
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>{qty}
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="btn btn-primary" onClick={() => { add(dish, qty); navigate('/menu') }}>
              Add {qty} to cart · ${(dish.price * qty).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
