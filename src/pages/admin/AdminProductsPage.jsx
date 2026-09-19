import React, { useState, useEffect } from 'react';
import { getAdminProductsApi, createAdminProductApi, updateAdminProductApi, deleteAdminProductApi, getCategoriesApi } from '../../services/apiService';
import { Plus, Edit, Trash2, X, AlertTriangle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export default function AdminProductsPage({ onShowToast }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
  });

  // Delete Modal State
  const [productToDelete, setProductToDelete] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        getAdminProductsApi(),
        getCategoriesApi()
      ]);
      setProducts(prods || []);
      setCategories(cats || []);
    } catch (err) {
      if (onShowToast) {
        onShowToast('error', 'Error Loading Data', err.message || 'Failed to load products or categories.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '10',
      categoryId: categories.length > 0 ? categories[0].categoryId : '',
      imageUrl: ''
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    let img = '';
    if (product.images && product.images.length > 0) {
      img = product.images[0].imageUrl;
    }
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      stock: product.stock !== undefined ? product.stock : '',
      categoryId: product.category ? product.category.categoryId : (categories[0]?.categoryId || ''),
      imageUrl: img
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.stock || !formData.categoryId) {
      if (onShowToast) onShowToast('error', 'Validation Error', 'Please fill in all required fields.');
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock, 10),
        categoryId: parseInt(formData.categoryId, 10),
        imageUrl: formData.imageUrl
      };

      if (editingProduct) {
        await updateAdminProductApi(editingProduct.productId, payload);
        if (onShowToast) onShowToast('success', 'Product Updated', `Product "${formData.name}" updated successfully!`);
      } else {
        await createAdminProductApi(payload);
        if (onShowToast) onShowToast('success', 'Product Created', `New product "${formData.name}" added successfully!`);
      }

      setShowModal(false);
      await fetchData();
    } catch (err) {
      if (onShowToast) onShowToast('error', 'Save Failed', err.message || 'Failed to save product details.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;

    try {
      await deleteAdminProductApi(productToDelete.productId);
      if (onShowToast) onShowToast('info', 'Product Deleted', `Product "${productToDelete.name}" removed.`);
      setProductToDelete(null);
      await fetchData();
    } catch (err) {
      if (onShowToast) onShowToast('error', 'Delete Failed', err.message || 'Failed to delete product.');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val || 0);
  };

  if (loading) {
    return <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>Loading products catalog...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
            Product Management
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: '0.2rem 0 0', fontSize: '0.95rem' }}>
            Add, update, modify stock, price, and manage store product inventory
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="btn-submit-primary"
          style={{ width: 'auto', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={20} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(36, 59, 107, 0.04)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: 'var(--primary-navy)', fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <th style={{ padding: '1rem 1.25rem' }}>Product</th>
              <th style={{ padding: '1rem 1.25rem' }}>Category</th>
              <th style={{ padding: '1rem 1.25rem' }}>Price</th>
              <th style={{ padding: '1rem 1.25rem' }}>Stock</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No products found. Click "Add New Product" to populate your catalog.
                </td>
              </tr>
            ) : (
              products.map((prod) => {
                let img = 'https://ik.imagekit.io/StringStackSwathi/SoftToys/SoftToys/Teddy%20Bear.jpg';
                if (prod.images && prod.images.length > 0) {
                  img = prod.images[0].imageUrl;
                }

                return (
                  <tr key={prod.productId} style={{ borderBottom: '1px solid #F1F5F9', transition: 'background 0.2s ease' }}>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <img
                          src={img}
                          alt={prod.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E2E8F0', flexShrink: 0 }}
                        />
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--primary-navy)', fontSize: '0.98rem' }}>{prod.name}</div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {prod.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 600, color: 'var(--text-body)', fontSize: '0.9rem' }}>
                      <span style={{ backgroundColor: '#F1F5F9', color: 'var(--primary-navy)', padding: '0.25rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                        {prod.category?.categoryName || 'General'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', fontWeight: 800, color: 'var(--primary-navy)', fontSize: '1rem' }}>
                      {formatCurrency(prod.price)}
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        color: prod.stock > 5 ? '#059669' : '#D97706',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}>
                        {prod.stock} in stock
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => openEditModal(prod)}
                          style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', padding: '0.45rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Edit size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setProductToDelete(prod)}
                          style={{ backgroundColor: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5', padding: '0.45rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        >
                          <Trash2 size={14} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '540px', width: '100%', padding: '2rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '0.8rem', borderBottom: '1px solid #E2E8F0' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary-navy)', margin: 0 }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="pure-form">
              <div className="field-group">
                <label className="field-label">Product Name *</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="e.g. Teddy Bear"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="field-group">
                <label className="field-label">Category *</label>
                <select
                  className="field-input"
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="field-group">
                  <label className="field-label">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="field-input"
                    placeholder="299.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>

                <div className="field-group">
                  <label className="field-label">Stock Quantity *</label>
                  <input
                    type="number"
                    className="field-input"
                    placeholder="10"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Description</label>
                <textarea
                  className="field-input"
                  rows="3"
                  placeholder="Enter toy details, material, and age recommendation..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Image URL</label>
                <input
                  type="url"
                  className="field-input"
                  placeholder="https://ik.imagekit.io/..."
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.7rem 1.4rem', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: 'var(--text-body)', fontWeight: 700, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-submit-primary"
                  style={{ width: 'auto', padding: '0.7rem 1.8rem' }}
                >
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', maxWidth: '440px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '54px', height: '54px', backgroundColor: '#FEE2E2', color: '#991B1B', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <AlertTriangle size={30} />
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '0.5rem' }}>
              Confirm Product Deletion
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
              Are you sure you want to delete this product?
              <br />
              <strong style={{ color: 'var(--primary-navy)' }}>"{productToDelete.name}"</strong>
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => setProductToDelete(null)}
                style={{ padding: '0.7rem 1.4rem', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', color: 'var(--text-body)', fontWeight: 700, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                style={{ padding: '0.7rem 1.4rem', borderRadius: '6px', border: 'none', backgroundColor: '#991B1B', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
