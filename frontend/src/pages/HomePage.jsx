import React, { useState, useEffect } from 'react';
import CategoryNavBar from '../components/CategoryNavBar';
import ProductCard from '../components/ProductCard';
import { getCategoriesApi, getProductsApi, getProductsByCategoryApi, addToCartApi, getWishlistApi, toggleWishlistApi } from '../services/apiService';
import { useNavigate } from 'react-router-dom';

export default function HomePage({ user, searchQuery, onCartUpdated, onWishlistUpdated, onShowToast }) {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategoriesApi();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch Wishlist IDs if user is logged in
  const fetchWishlistIds = async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const items = await getWishlistApi();
      const ids = new Set((items || []).map(i => i.productId));
      setWishlistIds(ids);
    } catch (err) {
      // Ignore unauthorized or fetch error quietly
    }
  };

  useEffect(() => {
    fetchWishlistIds();
  }, [user]);

  // Fetch Products (All or Filtered by Category)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let data;
        if (selectedCategoryId) {
          data = await getProductsByCategoryApi(selectedCategoryId);
        } else {
          data = await getProductsApi();
        }
        setProducts(data);
      } catch (err) {
        if (onShowToast) {
          onShowToast('error', 'Error', 'Failed to fetch products from backend');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [selectedCategoryId]);

  // Filter products by search query
  const filteredProducts = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
  });

  const handleAddToCart = async (product) => {
    if (!user) {
      if (onShowToast) onShowToast('info', 'Login Required', 'Please log in to add toys to your cart.');
      navigate('/login');
      return;
    }

    try {
      await addToCartApi(product.productId, 1);
      if (onShowToast) {
        onShowToast('success', 'Added to Cart!', `${product.name} has been added to your shopping cart.`);
      }
      if (onCartUpdated) onCartUpdated();
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Cart Error', err.message || 'Failed to add item to cart');
      }
    }
  };

  const handleToggleWishlist = async (product) => {
    if (!user) {
      if (onShowToast) onShowToast('info', 'Login Required', 'Please log in to save items to your wishlist.');
      navigate('/login');
      return;
    }

    try {
      const res = await toggleWishlistApi(product.productId);
      setWishlistIds(prev => {
        const updated = new Set(prev);
        if (res.inWishlist) {
          updated.add(product.productId);
        } else {
          updated.delete(product.productId);
        }
        return updated;
      });

      if (onShowToast) {
        onShowToast(
          res.inWishlist ? 'success' : 'info',
          res.inWishlist ? 'Added to Wishlist' : 'Removed from Wishlist',
          res.message || (res.inWishlist ? `${product.name} added to your wishlist.` : `${product.name} removed from your wishlist.`)
        );
      }

      if (onWishlistUpdated) onWishlistUpdated();
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Wishlist Error', err.message || 'Failed to update wishlist');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {/* Category Navigation Bar */}
      <CategoryNavBar
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(catId) => setSelectedCategoryId(catId)}
      />

      {/* Main Catalog View */}
      <div className="catalog-container">
        <div className="catalog-header-banner">
          <div className="catalog-title-group">
            <div className="title-with-accent">
              <span className="accent-line"></span>
              <h1 className="catalog-title">
                {selectedCategoryId
                  ? categories.find((c) => c.categoryId === selectedCategoryId)?.categoryName || 'Toys'
                  : 'All Toy Collections'}
              </h1>
            </div>
            <p className="catalog-subtitle">
              Discover amazing toys for every little dream!
            </p>
          </div>

          <div className="catalog-count">
            <span>{filteredProducts.length} Products Available</span>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading toy collection...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.productId}
                product={product}
                onAddToCart={handleAddToCart}
                onToggleWishlist={handleToggleWishlist}
                isInWishlist={wishlistIds.has(product.productId)}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h3>No Toy Products Found</h3>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              Try selecting a different category or clearing your search term.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
