import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DishCard from '../components/DishCard.jsx'
import { dishes, categories } from '../data/menu'
import { trackPageView } from '../adobe/track'

export default function Home() {
  const navigate = useNavigate()
  // Data layer: when the home page loads we push a pageView event with the page
  // name "home". This becomes a page view in Adobe. Adding a dish from a card
  // fires addToCart from inside DishCard.
  useEffect(() => { trackPageView('home') }, [])
  const popular = [...dishes].sort((a, b) => b.rating - a.rating).slice(0, 8)

  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>Delicious food, delivered fast 🍕</h1>
          <p>Order from your favourite kitchens and track it to your door. Fresh, hot and on time.</p>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>Browse the menu</button>
          <div className="hero-badges">
            <span>⚡ 30-min delivery</span>
            <span>⭐ 4.8 avg rating</span>
            <span>🎁 Rewards on every order</span>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div><h2>What are you craving?</h2><p>Pick a category to explore</p></div>
        </div>
        <div className="cats">
          {categories.map((c) => (
            <button key={c} className="cat-chip" onClick={() => navigate(`/menu?category=${encodeURIComponent(c)}`)}>{c}</button>
          ))}
        </div>
      </section>

      <section className="section container" style={{ paddingTop: 0 }}>
        <div className="section-head">
          <div><h2>Most popular 🔥</h2><p>Loved by Feastly foodies</p></div>
          <button className="btn btn-ghost" onClick={() => navigate('/menu')}>See all</button>
        </div>
        <div className="grid">{popular.map((d) => <DishCard key={d.id} dish={d} />)}</div>
      </section>
    </>
  )
}
