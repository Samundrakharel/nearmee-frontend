/**
 * Centralized API service for nearmee frontend.
 *
 * All backend API calls are routed through this module.
 * Configuration:
 *   Set NEXT_PUBLIC_API_BASE_URL in .env.local
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// ─── Helpers ───────────────────────────────────────────────

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;


  const config = {
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': '69420',
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

    // Nested objects
    city: biz.city || null,
    state: biz.state || null,
    country: biz.country || null,
    businessType: biz.business_type || null,

    // Derived / list fields used by the frontend
    type: biz.business_type_name || biz.business_type?.name || '',
    categories: categories,
    categoryObjects: biz.categories || [],
    photos: images,
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
    reviewCategories: [],

    // Legacy compat
    amenities: [],
    faqs: [],

    // Google
    googlePlaceId: biz.google_place_id || '',
    googleDataId: biz.google_data_id || '',

    // For business list cards (shorthand)
    image: biz.cover_image || (images.length > 0 ? images[0] : ''),
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
    image: biz.cover_image || '',
    isFeatured: biz.is_featured || false,
    cityName: biz.city_name || '',
    priceRange: biz.price_range || '',
  };
}

// ─── Auth ──────────────────────────────────────────────────

/**
 * POST /auth/login
 */
export async function login(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

/**
 * POST /auth/signup
 */
export async function signup(name, email, password) {
  return request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

// ─── Business Types (Categories) ───────────────────────────

/**
 * GET /business-types/
 * Returns: { count, next, previous, results: [{ id, name, slug, icon, description, is_active }] }
 */
export async function getBusinessTypes(page = 1) {
  return request(`/business-types/?page=${page}`);
}

/**
 * GET /business-types/{slug}/
 * Returns: { id, name, slug, icon, description, is_active }
 */
export async function getBusinessTypeBySlug(slug) {
  return request(`/business-types/${slug}/`);
}

// ─── Businesses ────────────────────────────────────────────

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
 * GET /businesses/{slug}/
 * Returns: Business (full detail)
 */
export async function getBusinessBySlug(slug, queryParams = {}) {
  const params = new URLSearchParams(queryParams).toString();
  const data = await request(`/businesses/${slug}/${params ? '?' + params : ''}`);
  const business = transformBusiness(data);

  // Auto-generate about_us if not yet generated
  if (!business.aboutUs) {
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