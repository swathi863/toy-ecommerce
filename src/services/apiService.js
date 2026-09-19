/**
 * Toyland API Service
 * Connects React frontend to Spring Boot backend at http://localhost:8080/api
 */

export const API_BASE_URL = 'http://localhost:8080/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('toyland_jwt_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/* Authentication APIs */

export const registerUserApi = async (userData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();
    if (!response.ok) {
      let msg = data.message || 'Registration failed. Please try again.';
      // Filter out raw stack traces or internal backend details
      if (/sql|exception|database|jwt|hibernate|class|java|column/i.test(msg)) {
        msg = 'Registration could not be completed. Please check your information and try again.';
      }
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    if (err.name === 'TypeError' || (err.message && err.message.includes('fetch'))) {
      throw new Error('Unable to connect to registration server. Please try again later.');
    }
    throw err;
  }
};

export const loginUserApi = async (credentials) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    if (!response.ok) {
      let msg = data.message || 'Invalid email or password.';
      // Filter out raw stack traces or internal backend details
      if (/sql|exception|database|jwt|hibernate|class|java|column/i.test(msg)) {
        msg = 'Unable to process login. Please try again later.';
      }
      throw new Error(msg);
    }

    if (data.token) {
      localStorage.setItem('toyland_jwt_token', data.token);
      localStorage.setItem('toyland_user_details', JSON.stringify(data));
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' || (err.message && err.message.includes('fetch'))) {
      throw new Error('Unable to connect to authentication server. Please try again later.');
    }
    throw err;
  }
};

export const getCurrentUserApi = async () => {
  const token = localStorage.getItem('toyland_jwt_token');
  if (!token) return null;

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getAuthHeaders()
  });

  if (!response.ok) {
    localStorage.removeItem('toyland_jwt_token');
    localStorage.removeItem('toyland_user_details');
    return null;
  }

  return await response.json();
};

export const logoutUserApi = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch (err) {
    console.error('Logout API call failed:', err);
  } finally {
    localStorage.removeItem('toyland_jwt_token');
    localStorage.removeItem('toyland_user_details');
  }
};

/* Categories & Products APIs */

export const getCategoriesApi = async () => {
  const response = await fetch(`${API_BASE_URL}/categories`);
  if (!response.ok) throw new Error('Failed to fetch categories');
  return await response.json();
};

export const getProductsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/products`);
  if (!response.ok) throw new Error('Failed to fetch products');
  return await response.json();
};

export const getProductsByCategoryApi = async (categoryId) => {
  const response = await fetch(`${API_BASE_URL}/products/category/${categoryId}`);
  if (!response.ok) throw new Error('Failed to fetch products by category');
  return await response.json();
};

export const getProductByIdApi = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/products/${productId}`);
  if (!response.ok) throw new Error('Failed to fetch product details');
  return await response.json();
};

export const searchProductsApi = async (keyword) => {
  const response = await fetch(`${API_BASE_URL}/products/search?keyword=${encodeURIComponent(keyword)}`);
  if (!response.ok) throw new Error('Failed to search products');
  return await response.json();
};

/* Cart APIs (Protected) */

export const getCartApi = async () => {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error('Failed to fetch cart');
  }
  return await response.json();
};

export const addToCartApi = async (productId, quantity = 1) => {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ productId, quantity })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to add item to cart');
  }
  return data;
};

export const updateCartQuantityApi = async (cartItemId, quantity) => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantity })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update quantity');
  }
  return data;
};

export const removeCartItemApi = async (cartItemId) => {
  const response = await fetch(`${API_BASE_URL}/cart/items/${cartItemId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to remove item');
  }
  return data;
};

/* Order APIs (Protected) */

export const checkoutApi = async () => {
  const response = await fetch(`${API_BASE_URL}/orders/checkout`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Checkout failed');
  }
  return data;
};

export const getUserOrdersApi = async () => {
  const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return await response.json();
};

export const getMyOrdersApi = async () => {
  const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
    headers: getAuthHeaders()
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('UNAUTHORIZED');
    }
    throw new Error('Failed to fetch your orders');
  }
  return await response.json();
};

export const getOrderByIdApi = async (orderId) => {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch order details');
  }
  return data;
};


/* Payment APIs (Protected) */

export const createPaymentOrderApi = async () => {
  const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
    method: 'POST',
    headers: getAuthHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    let msg = data.message || 'Failed to initialize payment.';
    if (/sql|exception|database|jwt|hibernate|class|java|column/i.test(msg)) {
      msg = 'Unable to process checkout right now. Please try again.';
    }
    throw new Error(msg);
  }
  return data;
};

export const verifyPaymentApi = async (paymentPayload) => {
  const response = await fetch(`${API_BASE_URL}/payment/verify`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(paymentPayload)
  });

  const data = await response.json();
  if (!response.ok) {
    let msg = data.message || 'Payment verification failed.';
    if (/sql|exception|database|jwt|hibernate|class|java|column/i.test(msg)) {
      msg = 'Payment verification failed. Please try again.';
    }
    throw new Error(msg);
  }
  return data;
};

/* Admin APIs (Admin Role Protected) */

export const adminLoginApi = async (credentials) => {
  const data = await loginUserApi(credentials);
  if (data.role !== 'ADMIN') {
    localStorage.removeItem('toyland_jwt_token');
    localStorage.removeItem('toyland_user_details');
    throw new Error('You do not have permission to access the admin panel.');
  }
  return data;
};

export const getAdminBusinessSummaryApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/business/summary`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch business summary');
  return data;
};

export const getAdminDailyBusinessApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/business/daily`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch daily business');
  return data;
};

export const getAdminMonthlyBusinessApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/business/monthly`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch monthly business');
  return data;
};

export const getAdminYearlyBusinessApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/business/yearly`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch yearly business');
  return data;
};

export const getAdminOverallBusinessApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/business/overall`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch overall business');
  return data;
};

export const getAdminProductsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch admin products');
  return data;
};

export const createAdminProductApi = async (productData) => {
  const response = await fetch(`${API_BASE_URL}/admin/products`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create product');
  return data;
};

export const updateAdminProductApi = async (productId, productData) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update product');
  return data;
};

export const deleteAdminProductApi = async (productId) => {
  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete product');
  return data;
};

export const getAdminUsersApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch admin users');
  return data;
};

export const updateAdminUserApi = async (userId, userData) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update user');
  return data;
};

export const deleteAdminUserApi = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete user');
  return data;
};

export const getAdminOrdersApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/orders`, {
    headers: getAuthHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch admin orders');
  return data;
};

export const updateAdminOrderStatusApi = async (orderId, status) => {
  const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update order status');
  return data;
};


