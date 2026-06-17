/**
 * Centralized API service for nearmee frontend.
 *
 * All backend API calls are routed through this module.
 * Configuration:
 *   Set NEXT_PUBLIC_API_BASE_URL in .env.local
 */
// const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
const getApiBase = () => {
  // If we are on the server (SSR), use the internal Docker network
  if (typeof window === 'undefined') {
    return process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://web:8000/api';
  }

  // If we are in the browser, use the public URL
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';
};

export const API_BASE = getApiBase();

// ─── Subdomain URL Helper ───────────────────────────────────

/**
 * Generate a route URL for a category based on location details.
 * If country, state, and city are present, returns /[country]/[state]/[city]/[category]
 * Otherwise, falls back to the default /category/[category]
 */
export function getCategoryRoute(categorySlug, locationInfo = {}) {
  const country = locationInfo?.country || '';
  const state = locationInfo?.state || '';
  const city = locationInfo?.city || '';

  if (country && state && city) {
    const normCountry = country.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const normState = state.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const normCity = city.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return `/${normCountry}/${normState}/${normCity}/${categorySlug}`;
  }

  return `/category/${categorySlug}`;
}

/**
 * Generate a subdomain URL for a given business slug.
 * e.g. pizza-hut → https://pizza-hut.nearmee.net
 */
export function getBusinessSubdomainUrl(slug) {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'nearmee.net';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const port = process.env.NODE_ENV === 'production' ? '' : ':3000';
  return `${protocol}://${slug}.${baseDomain}${port}`;
}

/**
 * Check if the current hostname is a business subdomain.
 * e.g. pizza-hut.nearmee.net → true
 *      nearmee.net → false
 *      www.nearmee.net → false
 */
export function isBusinessSubdomain() {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'nearmee.net';

  // If it's exactly the base domain or localhost, it's NOT a business subdomain
  if (hostname === baseDomain || hostname === 'localhost' || hostname === '127.0.0.1') {
    return false;
  }

  // Check against reserved subdomains
  const parts = hostname.split('.');
  const subdomain = parts[0];
  const reserved = ["www", "api", "admin", "m", "blog", "shop", "static", "media"];

  if (reserved.includes(subdomain.toLowerCase())) {
    return false;
  }

  // If it ends with the base domain and has a subdomain part, it's a business subdomain
  return hostname.endsWith(`.${baseDomain}`);
}

/**
 * Get the main domain URL (e.g. https://nearmee.net).
 * Useful for links that need to go back to the home page from a subdomain.
 */
export function getMainDomainUrl() {
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'nearmee.net';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const port = process.env.NODE_ENV === 'production' ? '' : ':3000';
  return `${protocol}://${baseDomain}${port}`;
}


let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token));
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

export async function refreshAccessToken() {
  if (typeof window === 'undefined') return null;
  const refreshToken = localStorage.getItem('nearmee_refresh_token');
  if (!refreshToken) {
    logout();
    throw new Error('No refresh token available');
  }

  const url = `${API_BASE}/accounts/login/refresh/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': '69420' },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  if (!res.ok) {
    logout();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Refresh failed');
  }

  const data = await res.json();
  localStorage.setItem('nearmee_token', data.access);
  if (data.refresh) {
    localStorage.setItem('nearmee_refresh_token', data.refresh);
  }
  return data.access;
}

async function request(endpoint, options = {}, isRetry = false) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420',
      ...options.headers,
    },
    ...options,
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nearmee_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, config);

  if (res.status === 401 && !isRetry && typeof window !== 'undefined' && localStorage.getItem('nearmee_refresh_token')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(newToken);
        refreshSubscribers = [];
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        throw err;
      }
    }

    return new Promise((resolve) => {
      addRefreshSubscriber((token) => {
        config.headers['Authorization'] = `Bearer ${token}`;
        resolve(fetch(url, config).then(async (retryRes) => {
          if (!retryRes.ok) {
            const errData = await retryRes.json().catch(() => ({ detail: retryRes.statusText }));
            const err = new Error(errData.detail || `API error: ${retryRes.status}`);
            err.fieldErrors = _extractFieldErrors(errData);
            err.status = retryRes.status;
            throw err;
          }
          if (retryRes.status === 204) return null;
          return retryRes.json();
        }));
      });
    });
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    const err = new Error(
      errData.detail ||
      (errData.non_field_errors ? (Array.isArray(errData.non_field_errors) ? errData.non_field_errors.join(' ') : errData.non_field_errors) : null) ||
      `API error: ${res.status}`
    );
    err.fieldErrors = _extractFieldErrors(errData);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

/**
 * Internal: extract field-level errors from a DRF error response body.
 */
function _extractFieldErrors(data) {
  if (!data || typeof data !== 'object') return {};
  const errors = {};
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'detail') return;
    errors[key] = Array.isArray(value) ? value.join(' ') : String(value);
  });
  return errors;
}

/**
 * Internal helper for multipart/form-data requests (file uploads).
 * Mirrors request() but does NOT set Content-Type (browser sets it with boundary).
 * Handles 401 → token refresh automatically.
 */
async function requestFormData(endpoint, options = {}, isRetry = false) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'ngrok-skip-browser-warning': '69420',
      ...options.headers,
    },
    ...options,
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nearmee_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, config);

  if (res.status === 401 && !isRetry && typeof window !== 'undefined' && localStorage.getItem('nearmee_refresh_token')) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        onRefreshed(newToken);
        refreshSubscribers = [];
      } catch (err) {
        isRefreshing = false;
        refreshSubscribers = [];
        throw err;
      }
    }
    return new Promise((resolve, reject) => {
      addRefreshSubscriber((token) => {
        config.headers['Authorization'] = `Bearer ${token}`;
        fetch(url, config).then(async (retryRes) => {
          if (!retryRes.ok) {
            const errData = await retryRes.json().catch(() => ({ detail: retryRes.statusText }));
            const err = new Error(errData.detail || `Upload error: ${retryRes.status}`);
            err.fieldErrors = _extractFieldErrors(errData);
            err.status = retryRes.status;
            reject(err);
          } else {
            resolve(retryRes.status === 204 ? null : retryRes.json());
          }
        }).catch(reject);
      });
    });
  }

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ detail: res.statusText }));
    const err = new Error(
      errData.detail ||
      (errData.non_field_errors ? (Array.isArray(errData.non_field_errors) ? errData.non_field_errors.join(' ') : errData.non_field_errors) : null) ||
      `Upload error: ${res.status}`
    );
    err.fieldErrors = _extractFieldErrors(errData);
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

// ─── Transform helpers ─────────────────────────────────────

/**
 * Safely parse a field that might be a JSON string or already an object/array.
 */
function safeParse(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value === 'object') return value; // already parsed
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/**
 * Transform a business object from the backend snake_case format
 * into the camelCase shape the frontend components expect.
 */
export function transformBusiness(biz) {
  if (!biz) return null;

  const categories = Array.isArray(biz.categories)
    ? biz.categories.map(cat => (typeof cat === 'string' ? cat : cat.name))
    : [];

  const images = Array.isArray(biz.images)
    ? biz.images.map(img => (typeof img === 'string' ? img : (img.image || img.google_photo_reference))).filter(Boolean)
    : [];

  // Add thumbnail to the photos array if it exists
  const allPhotos = [];
  if (biz.thumbnail) {
    allPhotos.push(biz.thumbnail);
  }
  if (images.length > 0) {
    allPhotos.push(...images);
  }

  const hours = safeParse(biz.hours, []);
  const menuPhotos = safeParse(biz.menu_photos, []);
  const googleReviews = safeParse(biz.google_reviews, []);
  const services = safeParse(biz.services, []);
  const aboutUs = biz.about_us || '';

  // Normalize local_reviews into the shape components expect
  const localReviews = Array.isArray(biz.local_reviews) ? biz.local_reviews : [];
  const localReviewsList = localReviews.map(r => ({
    user: r.author || 'Anonymous',
    initials: (r.author || 'A').substring(0, 2).toUpperCase(),
    avatar: null,
    rating: r.rating || 0,
    comment: r.content || '',
    date: r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
  }));

  const googleReviewsList = Array.isArray(googleReviews) ? googleReviews.map(r => ({
    user: r.author_name || 'Anonymous',
    initials: (r.author_name || 'A').substring(0, 2).toUpperCase(),
    avatar: r.author_profile_image || null,
    rating: r.rating || 0,
    comment: r.content || '',
    date: r.relative_time || (r.published_at ? new Date(r.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''),
  })) : [];

  const reviewsList = [...googleReviewsList, ...localReviewsList];

  // Compute review summary
  const totalReviews = biz.total_reviews || reviewsList.length;
  const avgRating = parseFloat(biz.rating) || 0;
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviewsList.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) counts[Math.floor(r.rating)]++;
  });

  // Normalize menu_items
  const menuItems = Array.isArray(biz.menu_items) ? biz.menu_items.map(item => ({
    ...item,
    image: item.image || item.image_url || null
  })) : [];

  // Parse open_state
  const openState = biz.open_state || '';
  const isOpen = openState.toLowerCase().includes('open');

  return {
    // Core fields
    id: biz.id,
    name: biz.name,
    slug: biz.slug,
    description: biz.description || '',
    about: aboutUs || biz.description || '',
    // aboutUs: aboutUs, 
    address: biz.address || '',
    phone: biz.phone || '',
    website: biz.website || '',
    email: biz.email || '',
    thumbnail: biz.thumbnail || '',
    coverImage: biz.cover_image || '',
    rating: avgRating,
    totalReviews: totalReviews,
    isFeatured: biz.is_featured || false,
    isClaimed: biz.is_claimed || false,
    isActive: biz.is_active !== undefined ? biz.is_active : true,
    lat: biz.lat,
    lng: biz.lng,
    priceRange: biz.price_range || '',
    priceLevel: biz.price_level || '',
    openState: openState,
    isOpen: isOpen,
    todayHours: openState,
    createdAt: biz.created_at,
    updatedAt: biz.updated_at,

    // SEO titles from backend
    seo: biz.seo || {
      title: `${biz.name} | Nearmee`,
      menu_title: `${biz.name} Menu | Nearmee`,
      reviews_title: `${biz.name} Reviews | Nearmee`,
      services_title: `${biz.name} Services | Nearmee`,
    },

    // DEBUG: Log the SEO data
    // Remove this after debugging
    _debug_seo: biz.seo,

    // Nested objects
    city: biz.city || null,
    state: biz.state || null,
    country: biz.country || null,
    businessType: biz.business_type || null,

    // Derived / list fields used by the frontend
    type: biz.business_type_name || biz.business_type?.name || '',
    categories: categories,
    categoryObjects: biz.categories || [],
    photos: allPhotos,
    images: biz.images || [],
    hours: hours,
    services: services,
    menuImages: Array.isArray(menuPhotos) ? menuPhotos : [],
    menuItems: menuItems,
    menu: menuItems.length > 0 ? [{ category: 'Menu', items: menuItems.map(item => ({ name: item.name, price: item.price ? `$${item.price}` : '', description: item.description || '' })) }] : [],
    mustTryDishes: [],
    menuAbout: biz.description || '',

    // Reviews
    reviews: {
      summary: {
        average: avgRating,
        total: totalReviews,
        counts: counts,
      },
      list: reviewsList,
    },
    topReviews: reviewsList.slice(0, 3),
    googleReviews: googleReviews,
    localReviews: localReviews,
    reviewCategories: safeParse(biz.review_categories, []),

    // Legacy compat
    amenities: [],
    faqs: [],
    extensions: safeParse(biz.extensions, {}),

    // Google
    googlePlaceId: biz.google_place_id || '',
    googleDataId: biz.google_data_id || '',

    // For business list cards (shorthand)
    image: biz.cover_image || (images.length > 0 ? images[0] : ''),

    // SEO Schema (JSON-LD)
    schema: biz.schema || null,
  };
}

/**
 * Transform a business list item (lighter version for list endpoints).
 */
export function transformBusinessListItem(biz) {
  return {
    id: biz.id,
    name: biz.name,
    slug: biz.slug,
    type: biz.business_type_name || '',
    rating: parseFloat(biz.rating) || 0,
    reviews: biz.total_reviews || 0,
    address: biz.address || '',
    description: biz.description || '',
    image: biz.thumbnail || biz.cover_image || '',
    thumbnail: biz.thumbnail || '',
    coverImage: biz.cover_image || '',
    isFeatured: biz.is_featured || false,
    cityName: biz.city_name || '',
    priceRange: biz.price_range || '',
  };
}

// ─── Auth ──────────────────────────────────────────────────

/**
 * Helper to parse error responses from the backend.
 * Returns an object with field-level errors.
 */
async function parseErrorResponse(res) {
  try {
    const data = await res.json();
    // Backend might return { detail: "..." }
    if (data.detail) {
      return { _general: data.detail };
    }
    // DRF returns non_field_errors for validation errors not tied to a specific field
    if (data.non_field_errors) {
      return { _general: Array.isArray(data.non_field_errors) ? data.non_field_errors.join(' ') : data.non_field_errors };
    }
    // Convert field arrays to single strings
    const errors = {};
    Object.entries(data).forEach(([key, value]) => {
      errors[key] = Array.isArray(value) ? value.join(' ') : String(value);
    });
    return Object.keys(errors).length > 0 ? errors : { _general: 'Something went wrong.' };
  } catch {
    return { _general: `Request failed (${res.status})` };
  }
}

/**
 * POST /accounts/register/
 * Registers a new user (CUSTOMER or BUSINESS_LISTER).
 */
export async function registerUser(userData) {
  const url = `${API_BASE}/accounts/register/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420',
    },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    const errors = await parseErrorResponse(res);
    const err = new Error(errors._general || 'Registration failed');
    err.fieldErrors = errors;
    throw err;
  }

  return res.json();
}

/**
 * POST /accounts/login/
 * Returns { access, refresh } JWT tokens.
 */
export async function login(username, password) {
  const url = `${API_BASE}/accounts/login/`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errors = await parseErrorResponse(res);
    throw new Error(errors._general || errors.detail || 'Invalid credentials');
  }

  const data = await res.json();

  // Store tokens
  if (typeof window !== 'undefined') {
    localStorage.setItem('nearmee_token', data.access);
    localStorage.setItem('nearmee_refresh_token', data.refresh);
  }

  return data;
}

/**
 * GET /accounts/me/
 * Returns the current user's profile.
 */
export async function getProfile() {
  return request('/accounts/me/');
}

/**
 * PATCH /accounts/me/
 * Updates the current user's profile.
 */
export async function updateProfile(profileData) {
  return request('/accounts/me/', {
    method: 'PATCH',
    body: JSON.stringify(profileData),
  });
}

/**
 * Logout — clear stored tokens.
 */
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('nearmee_token');
    localStorage.removeItem('nearmee_refresh_token');
  }
}

/**
 * Check if user is logged in.
 */
export function isLoggedIn() {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('nearmee_token');
}

/**
 * POST /accounts/change-password/
 */
export async function changePassword(oldPassword, newPassword, confirmNewPassword) {
  return request('/accounts/change-password/', {
    method: 'POST',
    body: JSON.stringify({
      old_password: oldPassword,
      new_password: newPassword,
      confirm_new_password: confirmNewPassword
    }),
  });
}

/**
 * POST /accounts/password-reset/
 */
export async function requestPasswordReset(email) {
  return request('/accounts/password-reset/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// ─── Business Types (Categories) ───────────────────────────

/**
 * GET /business-types/
 * Returns: { count, next, previous, results: [{ id, name, slug, icon, description, is_active }] }
 */
export async function getBusinessTypes() {
  const data = await request(`/business-types/`);
  if (Array.isArray(data)) return { results: data, count: data.length };
  return data;
}

/**
 * GET /business-types/{slug}/
 * Returns: { id, name, slug, icon, description, is_active }
 */
export async function getBusinessTypeBySlug(slug) {
  return request(`/business-types/${slug}/`);
}

/**
 * GET /categories/
 * Fetch restaurant categories
 */
export async function getRestaurantCategories() {
  const data = await request(`/categories/`);
  if (Array.isArray(data)) return { results: data, count: data.length };
  return data;
}

/**
 * GET /categories/{slug}/
 * Fetch a specific category
 */
export async function getCategoryBySlug(slug) {
  return request(`/categories/${slug}/`);
}

/**
 * GET /categories/{slug}/businesses/
 * Fetch businesses for a specific category with optional filters
 */
export async function getBusinessesByCategorySlug(slug, params = {}) {
  const searchParams = new URLSearchParams();
  const page = params.page || 1;
  searchParams.append('page', page);

  Object.entries(params).forEach(([key, value]) => {
    if (key !== 'page' && value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();
  const data = await request(`/categories/${slug}/businesses/?${query}`);
  return {
    ...data,
    // Safely map if results exist, otherwise assume data is an array
    results: (data.results || (Array.isArray(data) ? data : [])).map(transformBusinessListItem),
  };
}

// ─── Businesses ────────────────────────────────────────────

/**
 * GET /categories/?search=query
 */
export async function searchCategories(query) {
  const data = await request(`/categories/?search=${encodeURIComponent(query)}`);
  if (Array.isArray(data)) return { results: data, count: data.length };
  return data;
}

/**
 * GET /businesses/
 * Returns: { count, total_pages, next, previous, current_page, results: Business[] }
 */
export async function getBusinesses(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  const data = await request(`/businesses/${query ? '?' + query : ''}`);
  return {
    ...data,
    results: (data.results || []).map(transformBusinessListItem),
  };
}

/**
 * GET /top-by-category/
 * Returns: Array of { category: { id, name, ... }, businesses: Business[] }
 */
export async function getTopBusinessesByCategory(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  const query = searchParams.toString();
  const data = await request(`/top-by-category/${query ? '?' + query : ''}`);

  // Transform the businesses within each category
  return (Array.isArray(data) ? data : []).map(group => ({
    ...group,
    businesses: (group.businesses || []).map(transformBusinessListItem)
  }));
}

/**
 * GET /businesses/{slug}/
 * Returns: Business (full detail)
 */
export async function getBusinessBySlug(slug, queryParams = {}, skipGenerate = false) {
  const params = new URLSearchParams(queryParams).toString();
  const data = await request(`/businesses/${slug}/${params ? '?' + params : ''}`);
  const business = transformBusiness(data);

  // Auto-generate about_us if not yet generated
  if (!skipGenerate && !business.aboutUs) {
    try {
      const generated = await generateAboutUs(slug);
      business.aboutUs = generated.about_us || '';
      business.about = generated.about_us || business.about;
    } catch (e) {
      console.error('Failed to generate about_us:', e);
    }
  }

  return business;
}

/**
 * GET /businesses/{slug}/menu/
 */
export async function getBusinessMenu(slug) {
  const data = await request(`/businesses/${slug}/menu/`);
  return transformBusiness(data);
}

/**
 * GET /businesses/{slug}/reviews/
 */
export async function getBusinessReviews(slug) {
  const data = await request(`/businesses/${slug}/reviews/`);
  return transformBusiness(data);
}

// ─── Search ────────────────────────────────────────────────

/**
 * GET /businesses/?search=<query>&page=<page>
 */
export async function searchBusinesses(query, location, page = 1) {
  return getBusinesses({ search: query, location, page });
}

// ─── User Submissions ─────────────────────────────────────

/**
 * Normalize a list response from the API.
 * DRF may return { results: [] } (paginated) or a plain array.
 * Always returns an array.
 */
function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}

/**
 * POST /user-menu-photos/
 * Upload a single menu photo for a business.
 * Requires authentication. Uses multipart/form-data.
 */
export async function uploadMenuPhoto(formData) {
  return requestFormData('/user-menu-photos/', {
    method: 'POST',
    body: formData,
  });
}

/**
 * DELETE /user-menu-photos/{id}/
 * Delete own uploaded menu photo.
 * Requires authentication.
 */
export async function deleteMenuPhoto(id) {
  return request(`/user-menu-photos/${id}/`, { method: 'DELETE' });
}

/**
 * POST /user-reviews/
 * Submit a review for a business (JSON, no photos).
 * Requires authentication.
 */
export async function submitReview(reviewData) {
  return request('/user-reviews/', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  });
}

/**
 * POST /user-reviews/
 * Submit a review WITH photos using multipart/form-data.
 * formData must contain business, rating, content, and optional photos[N]photo / photos[N]caption.
 * Requires authentication.
 */
export async function submitReviewWithPhotos(formData) {
  return requestFormData('/user-reviews/', {
    method: 'POST',
    body: formData,
  });
}

/**
 * PATCH /user-reviews/{id}/
 * Update own review.
 * Requires authentication.
 */
export async function updateReview(id, reviewData) {
  return request(`/user-reviews/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(reviewData),
  });
}

/**
 * DELETE /user-reviews/{id}/
 * Delete own review.
 * Requires authentication.
 */
export async function deleteReview(id) {
  return request(`/user-reviews/${id}/`, { method: 'DELETE' });
}

/**
 * GET /my-reviews/
 * Get current user's own reviews.
 * Always returns an array.
 */
export async function getMyReviews() {
  const data = await request('/my-reviews/');
  return normalizeList(data);
}

/**
 * GET /my-menu-photos/
 * Get current user's own uploaded menu photos.
 * Always returns an array.
 */
export async function getMyMenuPhotos() {
  const data = await request('/my-menu-photos/');
  return normalizeList(data);
}

/**
 * GET /my-business-submissions/
 * Get current user's own business submissions.
 * Always returns an array.
 */
export async function getMyBusinessSubmissions() {
  const data = await request('/my-business-submissions/');
  return normalizeList(data);
}

/**
 * GET /user-business-submissions/{id}/
 * Get a single business submission.
 */
export async function getBusinessSubmission(id) {
  return request(`/user-business-submissions/${id}/`);
}

/**
 * POST /user-business-submissions/
 * Submit a new business for listing.
 * Uses multipart/form-data (required for logo/cover_photo uploads).
 * Requires authentication.
 */
export async function submitBusiness(formData) {
  return requestFormData('/user-business-submissions/', {
    method: 'POST',
    body: formData,
  });
}

/**
 * PATCH /user-business-submissions/{id}/
 * Update an existing business submission.
 * Uses multipart/form-data.
 * Requires authentication.
 */
export async function updateBusinessSubmission(id, formData) {
  return requestFormData(`/user-business-submissions/${id}/`, {
    method: 'PATCH',
    body: formData,
  });
}

/**
 * GET /categories/
 * Fetch all categories (for category picker in forms).
 */
export async function getAllCategories() {
  const data = await request('/categories/?page_size=200');
  return normalizeList(data);
}

/**
 * GET /page-scripts/?url_path={path}
 * Fetch dynamic scripts for the current page.
 */
export async function getPageScripts(path) {
  return request(`/page-scripts/?url_path=${encodeURIComponent(path)}`);
}

// ─── Legacy aliases ────────────────────────────────────────

export const getCategories = getBusinessTypes;
export const getTopBusinesses = (location, limit) => getBusinesses({ is_featured: true, page_size: limit, location });
export const getBusinessById = (id) => getBusinessBySlug(id);
export const getBusinessesByCategory = (slug, page) => getBusinesses({ business_type: slug, page });
export async function generateAboutUs(slug, force = false) {
  const endpoint = force
    ? `/businesses/${slug}/generate_about_us/?force=true`
    : `/businesses/${slug}/generate_about_us/`;
  return request(endpoint, { method: 'POST' });
}