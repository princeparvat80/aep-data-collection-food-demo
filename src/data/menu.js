// Static dish catalogue for the demo. In a real site this would come from an API
// or a commerce backend. It has no Adobe or data layer logic. It only provides
// the products (id, name, price, category, cuisine) that the pages display and
// that the tracking functions read when building commerce events.

export const categories = ['Pizza', 'Burgers', 'Indian', 'Sushi', 'Desserts', 'Drinks']

export const dishes = [
  { id: 'DISH-01', name: 'Margherita Pizza', category: 'Pizza', cuisine: 'Italian', price: 11.99, veg: true, spiceLevel: 'mild', rating: 4.7, emoji: '🍕',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80', desc: 'Classic tomato, mozzarella and fresh basil on a wood-fired base.' },
  { id: 'DISH-02', name: 'Pepperoni Pizza', category: 'Pizza', cuisine: 'Italian', price: 13.99, veg: false, spiceLevel: 'medium', rating: 4.8, emoji: '🍕',
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80', desc: 'Loaded with spicy pepperoni and extra cheese.' },
  { id: 'DISH-03', name: 'Classic Cheeseburger', category: 'Burgers', cuisine: 'American', price: 9.99, veg: false, spiceLevel: 'mild', rating: 4.6, emoji: '🍔',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', desc: 'Juicy beef patty, cheddar, lettuce, tomato and house sauce.' },
  { id: 'DISH-04', name: 'Veggie Burger', category: 'Burgers', cuisine: 'American', price: 8.99, veg: true, spiceLevel: 'mild', rating: 4.4, emoji: '🍔',
    image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=800&q=80', desc: 'Grilled plant patty with avocado and chipotle mayo.' },
  { id: 'DISH-05', name: 'Butter Chicken', category: 'Indian', cuisine: 'Indian', price: 12.5, veg: false, spiceLevel: 'medium', rating: 4.9, emoji: '🍛',
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80', desc: 'Creamy tomato curry with tender chicken, served with naan.' },
  { id: 'DISH-06', name: 'Paneer Tikka Masala', category: 'Indian', cuisine: 'Indian', price: 11.5, veg: true, spiceLevel: 'medium', rating: 4.7, emoji: '🍛',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80', desc: 'Char-grilled paneer in a rich spiced gravy.' },
  { id: 'DISH-07', name: 'Salmon Nigiri Set', category: 'Sushi', cuisine: 'Japanese', price: 15.99, veg: false, spiceLevel: 'mild', rating: 4.8, emoji: '🍣',
    image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80', desc: 'Eight pieces of fresh salmon over seasoned rice.' },
  { id: 'DISH-08', name: 'Veggie Roll', category: 'Sushi', cuisine: 'Japanese', price: 10.99, veg: true, spiceLevel: 'mild', rating: 4.3, emoji: '🍣',
    image: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800&q=80', desc: 'Cucumber, avocado and pickled radish maki.' },
  { id: 'DISH-09', name: 'Chocolate Lava Cake', category: 'Desserts', cuisine: 'French', price: 6.5, veg: true, spiceLevel: 'none', rating: 4.9, emoji: '🍫',
    image: 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80', desc: 'Warm molten chocolate cake with a vanilla scoop.' },
  { id: 'DISH-10', name: 'New York Cheesecake', category: 'Desserts', cuisine: 'American', price: 5.99, veg: true, spiceLevel: 'none', rating: 4.6, emoji: '🍰',
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800&q=80', desc: 'Rich, creamy cheesecake with a berry compote.' },
  { id: 'DISH-11', name: 'Fresh Lemonade', category: 'Drinks', cuisine: 'American', price: 3.5, veg: true, spiceLevel: 'none', rating: 4.5, emoji: '🍋',
    image: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=800&q=80', desc: 'Hand-squeezed lemons with mint and a hint of honey.' },
  { id: 'DISH-12', name: 'Mango Lassi', category: 'Drinks', cuisine: 'Indian', price: 4.0, veg: true, spiceLevel: 'none', rating: 4.7, emoji: '🥭',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80', desc: 'Creamy yogurt smoothie with sweet Alphonso mango.' },
]

export function findDish(id) {
  return dishes.find((d) => d.id === id)
}
