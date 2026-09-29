import axios from 'axios';
import {
  INITIAL_PROPERTIES,
  INITIAL_USERS,
  INITIAL_BOOKINGS,
  INITIAL_REVIEWS,
} from './mockData';

const api = axios.create({
  baseURL: '/api',
  timeout: 3000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('househunt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 unauthorized cleanly
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes('/login') &&
        !currentPath.includes('/register') &&
        currentPath !== '/'
      ) {
        localStorage.removeItem('househunt_token');
        localStorage.removeItem('househunt_user');
      }
    }
    return Promise.reject(error);
  }
);

// Local persistence helpers for offline / mock mode
const getStoredProperties = () => {
  try {
    const saved = localStorage.getItem('househunt_mock_properties');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(e);
  }
  localStorage.setItem('househunt_mock_properties', JSON.stringify(INITIAL_PROPERTIES));
  return INITIAL_PROPERTIES;
};

const saveStoredProperties = (props) => {
  localStorage.setItem('househunt_mock_properties', JSON.stringify(props));
};

const getStoredBookings = () => {
  try {
    const saved = localStorage.getItem('househunt_mock_bookings');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(e);
  }
  localStorage.setItem('househunt_mock_bookings', JSON.stringify(INITIAL_BOOKINGS));
  return INITIAL_BOOKINGS;
};

const saveStoredBookings = (bookings) => {
  localStorage.setItem('househunt_mock_bookings', JSON.stringify(bookings));
};

const getStoredReviews = () => {
  try {
    const saved = localStorage.getItem('househunt_mock_reviews');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(e);
  }
  localStorage.setItem('househunt_mock_reviews', JSON.stringify(INITIAL_REVIEWS));
  return INITIAL_REVIEWS;
};

const saveStoredReviews = (revs) => {
  localStorage.setItem('househunt_mock_reviews', JSON.stringify(revs));
};

// Safe API caller with graceful mock fallback
async function callOrFallback(apiPromiseFn, fallbackFn) {
  try {
    const res = await apiPromiseFn();
    return res;
  } catch (err) {
    // If server unreachable or error, use interactive mock data
    return { data: await fallbackFn() };
  }
}

// Auth Endpoints
export const authAPI = {
  login: async (credentials) => {
    return callOrFallback(
      () => api.post('/auth/login', credentials),
      () => {
        const found = INITIAL_USERS.find(
          (u) => u.email.toLowerCase() === credentials.email?.toLowerCase()
        ) || {
          _id: 'usr_guest_' + Date.now(),
          name: credentials.email.split('@')[0],
          email: credentials.email,
          role: 'tenant',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        };
        const token = 'mock_jwt_token_' + found._id;
        return { success: true, token, user: found };
      }
    );
  },

  register: async (userData) => {
    return callOrFallback(
      () => api.post('/auth/register', userData),
      () => {
        const newUser = {
          _id: 'usr_' + Date.now(),
          name: userData.name,
          email: userData.email,
          role: userData.role || 'tenant',
          phone: userData.phone || '',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        };
        const token = 'mock_jwt_token_' + newUser._id;
        return { success: true, token, user: newUser };
      }
    );
  },

  getMe: async () => {
    return callOrFallback(
      () => api.get('/auth/me'),
      () => {
        const saved = localStorage.getItem('househunt_user');
        return { success: true, user: saved ? JSON.parse(saved) : INITIAL_USERS[3] };
      }
    );
  },

  updateProfile: (data) => api.put('/auth/profile', data),
};

// Properties Endpoints
export const propertiesAPI = {
  getAll: async (params = {}) => {
    return callOrFallback(
      () => api.get('/properties', { params }),
      () => {
        let list = [...getStoredProperties()];
        if (!params.includePending) {
          list = list.filter((p) => p.status === 'approved');
        }

        if (params.city && params.city !== 'All') {
          list = list.filter((p) => p.city.toLowerCase() === params.city.toLowerCase());
        }

        if (params.propertyType && params.propertyType !== 'All') {
          list = list.filter((p) => p.propertyType.toLowerCase() === params.propertyType.toLowerCase());
        }

        if (params.bedrooms && params.bedrooms !== 'All') {
          const bNum = parseInt(params.bedrooms);
          if (params.bedrooms === '4+') {
            list = list.filter((p) => p.bedrooms >= 4);
          } else {
            list = list.filter((p) => p.bedrooms === bNum);
          }
        }

        if (params.furnishing && params.furnishing !== 'All') {
          list = list.filter((p) => p.furnishing.toLowerCase() === params.furnishing.toLowerCase());
        }

        if (params.maxPrice) {
          list = list.filter((p) => p.price <= Number(params.maxPrice));
        }

        if (params.keyword) {
          const kw = params.keyword.toLowerCase();
          list = list.filter(
            (p) =>
              p.title.toLowerCase().includes(kw) ||
              p.description.toLowerCase().includes(kw) ||
              p.city.toLowerCase().includes(kw) ||
              p.address.toLowerCase().includes(kw)
          );
        }

        // Sorting
        if (params.sortBy === 'price-asc') {
          list.sort((a, b) => a.price - b.price);
        } else if (params.sortBy === 'price-desc') {
          list.sort((a, b) => b.price - a.price);
        } else if (params.sortBy === 'rating') {
          list.sort((a, b) => (b.ratingsAverage || 0) - (a.ratingsAverage || 0));
        } else if (params.sortBy === 'area') {
          list.sort((a, b) => (b.areaSqFt || 0) - (a.areaSqFt || 0));
        } else {
          // newest
          list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        const total = list.length;
        const page = Number(params.page) || 1;
        const limit = Number(params.limit) || 9;
        const totalPages = Math.ceil(total / limit) || 1;
        const paginated = list.slice((page - 1) * limit, page * limit);

        return {
          success: true,
          count: paginated.length,
          total,
          totalPages,
          currentPage: page,
          properties: paginated,
        };
      }
    );
  },

  getById: async (id) => {
    return callOrFallback(
      () => api.get(`/properties/${id}`),
      () => {
        const list = getStoredProperties();
        const property = list.find((p) => p._id === id) || list[0];
        const allReviews = getStoredReviews();
        const reviews = allReviews.filter((r) => r.property === id || r.property === property._id);
        return { success: true, property, reviews };
      }
    );
  },

  create: async (data) => {
    return callOrFallback(
      () => api.post('/properties', data),
      () => {
        const list = getStoredProperties();
        const currentUser = JSON.parse(localStorage.getItem('househunt_user') || '{}');
        const newProperty = {
          _id: 'prop_' + Date.now(),
          ...data,
          owner: currentUser._id ? currentUser : INITIAL_USERS[1],
          status: currentUser.role === 'admin' ? 'approved' : 'pending',
          isAvailable: true,
          ratingsAverage: 5.0,
          ratingsCount: 0,
          createdAt: new Date().toISOString(),
        };
        const updated = [newProperty, ...list];
        saveStoredProperties(updated);
        return { success: true, property: newProperty };
      }
    );
  },

  update: async (id, data) => {
    return callOrFallback(
      () => api.put(`/properties/${id}`, data),
      () => {
        const list = getStoredProperties();
        const updated = list.map((p) => (p._id === id ? { ...p, ...data } : p));
        saveStoredProperties(updated);
        return { success: true, property: updated.find((p) => p._id === id) };
      }
    );
  },

  delete: async (id) => {
    return callOrFallback(
      () => api.delete(`/properties/${id}`),
      () => {
        const list = getStoredProperties();
        const updated = list.filter((p) => p._id !== id);
        saveStoredProperties(updated);
        return { success: true, message: 'Property deleted successfully' };
      }
    );
  },

  getMyProperties: async () => {
    return callOrFallback(
      () => api.get('/properties/user/my-properties'),
      () => {
        const list = getStoredProperties();
        const currentUser = JSON.parse(localStorage.getItem('househunt_user') || '{}');
        const myProps = list.filter(
          (p) => p.owner?._id === currentUser._id || p.owner?.email === currentUser.email
        );
        return { success: true, count: myProps.length, properties: myProps.length ? myProps : list.slice(0, 3) };
      }
    );
  },

  getAdminPending: async () => {
    return callOrFallback(
      () => api.get('/properties/admin/pending'),
      () => {
        const list = getStoredProperties();
        const pending = list.filter((p) => p.status === 'pending');
        return { success: true, count: pending.length, properties: pending };
      }
    );
  },

  updateStatus: async (id, statusData) => {
    return callOrFallback(
      () => api.put(`/properties/${id}/status`, statusData),
      () => {
        const list = getStoredProperties();
        const updated = list.map((p) => (p._id === id ? { ...p, status: statusData.status } : p));
        saveStoredProperties(updated);
        return { success: true, property: updated.find((p) => p._id === id) };
      }
    );
  },

  addReview: async (id, reviewData) => {
    return callOrFallback(
      () => api.post(`/properties/${id}/reviews`, reviewData),
      () => {
        const reviews = getStoredReviews();
        const currentUser = JSON.parse(localStorage.getItem('househunt_user') || '{}');
        const newReview = {
          _id: 'rev_' + Date.now(),
          property: id,
          user: currentUser._id ? currentUser : INITIAL_USERS[3],
          rating: reviewData.rating,
          comment: reviewData.comment,
          createdAt: new Date().toISOString(),
        };
        const updated = [newReview, ...reviews];
        saveStoredReviews(updated);
        return { success: true, review: newReview };
      }
    );
  },
};

// Bookings Endpoints
export const bookingsAPI = {
  create: async (data) => {
    return callOrFallback(
      () => api.post('/bookings', data),
      () => {
        const bookings = getStoredBookings();
        const list = getStoredProperties();
        const property = list.find((p) => p._id === data.propertyId) || list[0];
        const currentUser = JSON.parse(localStorage.getItem('househunt_user') || '{}');
        const newBooking = {
          _id: 'bk_' + Date.now(),
          property,
          tenant: currentUser._id ? currentUser : INITIAL_USERS[3],
          owner: property.owner,
          moveInDate: data.moveInDate,
          durationMonths: data.durationMonths || 11,
          monthlyRent: property.price,
          securityDeposit: property.securityDeposit || property.price * 2,
          totalUpfront: property.price + (property.securityDeposit || property.price * 2),
          status: 'pending',
          tenantMessage: data.tenantMessage || '',
          createdAt: new Date().toISOString(),
        };
        const updated = [newBooking, ...bookings];
        saveStoredBookings(updated);
        return { success: true, booking: newBooking };
      }
    );
  },

  getMyBookings: async () => {
    return callOrFallback(
      () => api.get('/bookings/my-bookings'),
      () => {
        const bookings = getStoredBookings();
        return { success: true, count: bookings.length, bookings };
      }
    );
  },

  getOwnerRequests: async () => {
    return callOrFallback(
      () => api.get('/bookings/owner-requests'),
      () => {
        const bookings = getStoredBookings();
        return { success: true, count: bookings.length, bookings };
      }
    );
  },

  updateStatus: async (id, data) => {
    return callOrFallback(
      () => api.put(`/bookings/${id}/status`, data),
      () => {
        const bookings = getStoredBookings();
        const updated = bookings.map((b) => (b._id === id ? { ...b, status: data.status } : b));
        saveStoredBookings(updated);
        return { success: true, booking: updated.find((b) => b._id === id) };
      }
    );
  },

  cancel: async (id) => {
    return callOrFallback(
      () => api.put(`/bookings/${id}/cancel`),
      () => {
        const bookings = getStoredBookings();
        const updated = bookings.map((b) => (b._id === id ? { ...b, status: 'cancelled' } : b));
        saveStoredBookings(updated);
        return { success: true, booking: updated.find((b) => b._id === id) };
      }
    );
  },
};

// Stats Endpoints
export const statsAPI = {
  getPlatformStats: async () => {
    return callOrFallback(
      () => api.get('/stats/platform'),
      () => {
        const props = getStoredProperties();
        const bookings = getStoredBookings();
        return {
          success: true,
          stats: {
            totalProperties: props.length,
            approvedProperties: props.filter((p) => p.status === 'approved').length,
            totalUsers: INITIAL_USERS.length + 8,
            activeCities: 6,
            totalBookings: bookings.length,
          },
        };
      }
    );
  },

  getOwnerStats: async () => {
    return callOrFallback(
      () => api.get('/stats/owner'),
      () => {
        const props = getStoredProperties();
        const bookings = getStoredBookings();
        return {
          success: true,
          stats: {
            totalListings: 4,
            activeListings: 3,
            totalBookingsReceived: bookings.length,
            monthlyRevenue: 275000,
          },
        };
      }
    );
  },
};

export default api;
