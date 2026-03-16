/**
 * Centralized API service for nearmee frontend.
 *
 * All backend API calls are routed through this module.
 * The Python backend developer only needs to implement REST endpoints
 * matching the paths below. Each function documents the expected
 * request and response shapes.
 *
 * Configuration:
 *   Set NEXT_PUBLIC_API_BASE_URL in .env.local (defaults to http://localhost:8000/api)
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// ─── Helpers ───────────────────────────────────────────────

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Attach auth token if present
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('nearmee_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(url, config);

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail || `API error: ${res.status}`);
  }

  return res.json();
}

// ─── Auth ──────────────────────────────────────────────────

/**
 * POST /auth/login
 * Body: { email: string, password: string }
 * Returns: { token: string, user: { id, name, email } }
 */
export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * POST /auth/signup
 * Body: { name: string, email: string, password: string }
 * Returns: { token: string, user: { id, name, email } }
 */
export async function signup(name, email, password) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// ─── Search ────────────────────────────────────────────────

/**
 * GET /search?q=<query>&location=<location>&page=<page>
 * Returns: { results: Business[], total: number, page: number }
 */
export async function searchBusinesses(query, location, page = 1) {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (location) params.append('location', location);
  params.append('page', page);
  return request(`/search?${params.toString()}`);
}

// ─── Categories ────────────────────────────────────────────

/**
 * GET /categories
 * Returns: { categories: [{ id, name, slug, icon }] }
 */
export async function getCategories() {
  return request('/categories');
}

/**
 * GET /categories/:slug/businesses?page=<page>
 * Returns: { businesses: Business[], total: number, page: number }
 */
export async function getBusinessesByCategory(slug, page = 1) {
  return request(`/categories/${slug}/businesses?page=${page}`);
}

// ─── Businesses ────────────────────────────────────────────

/**
 * GET /businesses/top?location=<location>&limit=<limit>
 * Returns: { businesses: Business[] }
 *
 * Business shape:
 * {
 *   id: number,
 *   name: string,
 *   type: string,
 *   rating: number,
 *   reviews: number,
 *   address: string,
 *   description: string,
 *   image: string (URL)
 * }
 */
export async function getTopBusinesses(location = '', limit = 10) {
  const params = new URLSearchParams();
  if (location) params.append('location', location);
  params.append('limit', limit);
  return request(`/businesses/top?${params.toString()}`);
}

/**
 * GET /businesses/:id
 * Returns: Business (full details)
 */
export async function getBusinessById(id) {
  return request(`/businesses/${id}`);
}

/**
 * GET /businesses/:id/reviews?page=<page>
 * Returns: { reviews: Review[], total: number, page: number }
 */
export async function getBusinessReviews(id, page = 1) {
  return request(`/businesses/${id}/reviews?page=${page}`);
}

// ─── Business Listing (for owners) ────────────────────────

/**
 * POST /businesses
 * Body: { name, type, address, description, phone, website, ... }
 * Returns: Business
 */
export async function createBusiness(data) {
  return request('/businesses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * PUT /businesses/:id
 * Body: partial Business fields
 * Returns: Business
 */
export async function updateBusiness(id, data) {
  return request(`/businesses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}
