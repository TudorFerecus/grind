const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Core fetch wrapper with auth & error handling
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const token = localStorage.getItem('adminToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove Content-Type if it's FormData (browser will set it with boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(url, { ...options, headers });
  
  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    localStorage.removeItem('adminToken');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/admin/login';
    }
    throw new Error('session_expired');
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'server_error');
  }

  return data;
}

/**
 * Scalable Frontend API Client
 */
export const api = {
  products: {
    getAll: (filters) => {
      const qs = new URLSearchParams(filters || {}).toString();
      return fetchApi(`/products${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => fetchApi(`/products/${id}`),
    create: (data) => fetchApi('/products', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchApi(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchApi(`/products/${id}`, { method: 'DELETE' }),
  },
  
  categories: {
    getAll: () => fetchApi('/categories'),
    getBySlug: (slug) => fetchApi(`/categories/${slug}`),
  },

  designs: {
    calculatePrice: (engineId, config) => fetchApi(`/designs/calculate`, {
      method: 'POST',
      body: JSON.stringify({ engineId, config })
    }),
    save: (engineId, config) => fetchApi(`/designs`, {
      method: 'POST',
      body: JSON.stringify({ engineId, config })
    }),
    getById: (id) => fetchApi(`/designs/${id}`)
  },

  orders: {
    create: (orderData) => fetchApi('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    }),
    getAll: () => fetchApi('/orders'),
    getById: (id) => fetchApi(`/orders/${id}`),
    updateStatus: (id, status) => fetchApi(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    })
  },

  auth: {
    login: (credentials) => fetchApi('/auth/admin/login', { 
      method: 'POST', 
      body: JSON.stringify(credentials) 
    }),
    verify: () => fetchApi('/auth/admin/verify'),
  },

  uploads: {
    image: async (file) => {
      const formData = new FormData();
      formData.append('image', file);
      // FormData handled automatically by fetchApi wrapper
      return fetchApi('/uploads/image', {
        method: 'POST',
        body: formData
      });
    }
  }
};
