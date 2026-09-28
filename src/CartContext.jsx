// Shopping cart state for the whole app, shared through React context.
//
// This is normal React state, but it is also where several data layer events
// originate. Adding an item calls dataLayer.addToCart, and lowering the quantity
// or removing a line calls dataLayer.removeFromCart, which mirrors how a real
// commerce site records cart changes. Keeping the tracking here means every place
// that changes the cart reports the same event, so we never miss one.

import { createContext, useContext, useState, useCallback } from 'react'
import { dataLayer } from './dataLayer'

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
    dataLayer.addToCart(dish, qty)
  }, [])

  const remove = useCallback((dish) => {
    setItems((prev) => prev.filter((i) => i.dish.id !== dish.id))
    dataLayer.removeFromCart(dish)
  }, [])

  // Decrease quantity by 1. Real-world: lowering cart qty = a remove-from-cart.
  const decrement = useCallback((dish) => {
    setItems((prev) => {
      const found = prev.find((i) => i.dish.id === dish.id)
      if (found && found.qty > 1) return prev.map((i) => i.dish.id === dish.id ? { ...i, qty: i.qty - 1 } : i)
      return prev.filter((i) => i.dish.id !== dish.id) // qty hits 0 -> remove line
    })
    dataLayer.removeFromCart(dish, 1)
  }, [])

  const setQty = useCallback((dish, qty) => {
    if (qty <= 0) { remove(dish); return }
    setItems((prev) => prev.map((i) => i.dish.id === dish.id ? { ...i, qty } : i))
  }, [remove])

  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((s, i) => s + i.qty, 0)
  const total = +items.reduce((s, i) => s + i.dish.price * i.qty, 0).toFixed(2)

  return (
    <CartContext.Provider value={{ items, add, remove, setQty, decrement, clear, count, total }}>
      {children}
    </CartContext.Provider>
  )
}
