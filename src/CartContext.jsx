import { createContext, useContext, useState, useCallback } from 'react'
import { trackAddToCart, trackRemoveFromCart } from './adobe/track'

const CartContext = createContext(null)
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const [items, setItems] = useState([]) // [{ dish, qty }]

  const add = useCallback((dish, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.dish.id === dish.id)
      if (found) return prev.map((i) => i.dish.id === dish.id ? { ...i, qty: i.qty + qty } : i)
      return [...prev, { dish, qty }]
    })
    trackAddToCart(dish, qty)
  }, [])

  const remove = useCallback((dish) => {
    setItems((prev) => prev.filter((i) => i.dish.id !== dish.id))
    trackRemoveFromCart(dish)
  }, [])

  const setQty = useCallback((dish, qty) => {
    if (qty <= 0) { remove(dish); return }
    setItems((prev) => prev.map((i) => i.dish.id === dish.id ? { ...i, qty } : i))
  }, [remove])

  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = +items.reduce((s, i) => s + i.dish.price * i.qty, 0).toFixed(2)

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, clear, count, total }}>
      {children}
    </CartContext.Provider>
  )
}
