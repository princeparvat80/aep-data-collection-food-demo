import { useNavigate } from 'react-router-dom'
import { useCart } from '../CartContext.jsx'

export default function DishCard({ dish }) {
  const navigate = useNavigate()
  // The Add button calls add() from the cart, which pushes an addToCart event to
  // the data layer. Clicking the card just navigates to the dish page.
  const { add } = useCart()
  const open = () => navigate(`/dish/${dish.id}`)

  return (
    <article className="card">
      <div className="card-img" onClick={open}>
        <img src={dish.image} alt={dish.name} loading="lazy" />
        <span className={dish.veg ? 'veg-dot' : 'nonveg-dot'} title={dish.veg ? 'Veg' : 'Non-veg'} />
        <span className="card-rating">★ {dish.rating}</span>
      </div>
      <div className="card-body">
        <span className="card-cat">{dish.category} · {dish.cuisine}</span>
        <div className="card-title" onClick={open}>{dish.emoji} {dish.name}</div>
        <p className="card-desc">{dish.desc}</p>
        <div className="card-foot">
          <span className="price">${dish.price.toFixed(2)}</span>
          <button className="btn btn-primary btn-sm" onClick={() => add(dish, 1)}>Add +</button>
        </div>
      </div>
    </article>
  )
}
