import React from 'react';
import { ShoppingBag, Star, Lock } from 'lucide-react';

const TOY_PRODUCTS = [
  {
    id: 1,
    title: 'RoboQuest Alpha Mech Robot',
    category: 'Action & Tech',
    price: 34.99,
    emoji: '🤖',
    tag: 'Popular'
  },
  {
    id: 2,
    title: 'Galactic Explorer Rocket Set',
    category: 'STEM Building',
    price: 49.99,
    emoji: '🚀',
    tag: 'Best Seller'
  },
  {
    id: 3,
    title: 'Cuddly Teddy Bear Plushie',
    category: 'Soft Toys',
    price: 19.99,
    emoji: '🧸',
    tag: 'New'
  },
  {
    id: 4,
    title: 'Wooden Shape Sorting Castle',
    category: 'Educational',
    price: 24.50,
    emoji: '🏰',
    tag: 'Toddler'
  },
  {
    id: 5,
    title: 'Super Turbo Racecar',
    category: 'Vehicles',
    price: 15.99,
    emoji: '🏎️',
    tag: 'Sale'
  },
  {
    id: 6,
    title: 'Magical Dinosaur Egg Kit',
    category: 'Discovery',
    price: 29.00,
    emoji: '🦖',
    tag: 'STEM'
  }
];

export default function ProductCatalog({ isLoggedIn, onAddToCart, onOpenAuth }) {
  return (
    <section id="catalog" className="products-section">
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Trending Toys & Games</h2>
            <p className="section-subtitle">
              Handpicked favorites loved by kids and parents worldwide
            </p>
          </div>
        </div>

        <div className="products-grid">
          {TOY_PRODUCTS.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <span className="product-tag">{product.tag}</span>
                <span>{product.emoji}</span>
              </div>

              <div className="product-details">
                <span className="product-category">{product.category}</span>
                <h3 className="product-title">{product.title}</h3>
              </div>

              <div className="product-bottom">
                <span className="product-price">${product.price.toFixed(2)}</span>
                <button
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', fontSize: '0.88rem' }}
                  onClick={() => {
                    if (isLoggedIn) {
                      onAddToCart(product);
                    } else {
                      onOpenAuth('login');
                    }
                  }}
                >
                  {isLoggedIn ? (
                    <>
                      <ShoppingBag size={16} />
                      <span>Add</span>
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      <span>Sign in to Buy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
