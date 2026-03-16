# Nearmee - Project Documentation

## 1. Project Overview
**Nearmee** is a modern, high-performance business directory web application designed to connect local customers with businesses in their area. It features a clean, responsive interface inspired by modern design trends like glassmorphism and vibrant color palettes.

## 2. Tech Stack
- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router)
- **Language:** JavaScript (ES6+)
- **Styling:** Vanilla CSS (Global styles with design tokens)
- **Icons:** Inline SVG (Heroicons-inspired)
- **Data Fetching:** Fetch API with centralized service layer
- **Backend (Target):** Python (FastAPI/Django)

## 3. Getting Started

### Prerequisites
- Node.js 18.x or later
- npm or yarn

### Installation
```bash
# Clone or navigate to the project directory
cd nearmee

# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will be available at `http://localhost:3000`.

## 4. Project Architecture

### Directory Structure
```
nearmee/
├── app/
│   ├── category/
│   │   ├── [slug]/
│   │   │   └── page.js      # Category detail page component
│   │   └── category.css     # Styles for category detail pages
│   ├── components/
│   │   ├── Header.js        # Global navigation header
│   │   ├── Hero.js          # Homepage banner with search
│   │   ├── Categories.js    # Homepage category grid
│   │   ├── Businesses.js    # Business cards & listings
│   │   ├── CTA.js           # "List Your Business" section
│   │   └── Footer.js        # Site footer
│   ├── lib/
│   │   └── api.js           # Centralized API service layer
│   ├── globals.css          # Design system, tokens, and global styles
│   ├── layout.js            # Root layout component
│   └── page.js              # Homepage entry point
├── public/                 # Static assets (favicons, etc.)
└── .env.local               # Environment variables (API Base URL)
```

## 5. Design System

### Colors
Used as CSS variables in `app/globals.css`:
- **Primary:** `#0d7377` (Teal) - Logo, primary buttons, links
- **Accent:** `#e8a317` (Amber) - Search buttons, highlighting
- **Background:** `#ffffff` (White) / `#f0f4f5` (Cool Gray)
- **Text:** `#1a1a2e` (Dark Navy) / `#4a4a5a` (Slate Gray)

### Typography
- **Primary Font:** 'Inter', sans-serif (via Google Fonts)
- **Hierarchy:**
  - H1: 2.8rem (Hero)
  - H2: 2rem (Section Titles)
  - H3: 1.15rem (Business Titles)
  - Body: 1rem / 16px

### UI Patterns
- **Cards:** Rounded (`14px`), subtle border, hover lift transition.
- **Buttons:** Fully rounded (`pill`), smooth color transitions, active state scale effect.
- **Inputs:** Rounded, clear focus states with primary color borders.

## 6. API Integration Guide

The frontend is designed to be backend-agnostic but optimized for a Python-based REST API. All requests are routed through `app/lib/api.js`.

### Configuration
Set the backend URL in `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
```

### Core Data Shapes

#### Business Object
```json
{
  "id": 1,
  "name": "Golden Dragon Asian Cuisine",
  "type": "Asian Restaurant",
  "rating": 4.7,
  "reviews": 389,
  "address": "789 Dundas St W, Toronto, ON M5T 1H4",
  "description": "...",
  "image": "https://..."
}
```

#### Endpoints to Implement (Backend)
- `POST /auth/login`
- `POST /auth/signup`
- `GET /businesses/top`
- `GET /categories`
- `GET /search?q=&location=`

## 7. Development Roadmap
- [ ] Connect `api.js` to actual Python backend endpoints.
- [ ] Implement user authentication state management (Context API/Zustand).
- [ ] Add business owner dashboard for managing listings.
- [ ] Implement real-time business search suggestions.
- [ ] Add Google Maps integration for business locations.
