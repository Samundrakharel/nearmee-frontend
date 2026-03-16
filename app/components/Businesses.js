'use client';

const businesses = [
  {
    id: 1,
    name: '1 Seafood & Chicken',
    type: 'Seafood Restaurant',
    rating: 4.5,
    reviews: 245,
    address: '3456 MacArthur Blvd, Oakland, CA 94602',
    description:
      'A beloved local seafood spot known for our fresh catches and Southern-style fried chicken. Family-owned and operated since 1995, we pride ourselves on quality ingredients and generous portions.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
  },
  {
    id: 2,
    name: 'Golden Dragon Asian Cuisine',
    type: 'Asian Restaurant',
    rating: 4.7,
    reviews: 389,
    address: '789 Dundas St W, Toronto, ON M5T 1H4',
    description:
      'Authentic Asian fusion cuisine featuring the best of Chinese, Thai, and Vietnamese flavors. Our chefs bring decades of experience creating memorable dining experiences with fresh ingredients.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
  },
  {
    id: 3,
    name: 'Bella Italia Trattoria',
    type: 'Italian Restaurant',
    rating: 4.8,
    reviews: 512,
    address: '221 Baker St, London, NW1 6XE',
    description:
      'Traditional Italian cuisine made with imported ingredients from Italy. Our wood-fired pizzas and handmade pastas have been delighting customers for over 20 years.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
  },
];

function StarRating({ rating }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(
        <span key={i} className="star">★</span>
      );
    } else if (i - rating < 1 && i - rating > 0) {
      stars.push(
        <span key={i} className="star half">★</span>
      );
    } else {
      stars.push(
        <span key={i} className="star empty">★</span>
      );
    }
  }
  return <div className="stars">{stars}</div>;
}

export default function Businesses() {
  return (
    <section className="businesses-section" id="businesses">
      <div className="businesses-header">
        <h2>Top Businesses Near You</h2>
        <a href="#" className="view-all-link" id="view-all-link">View All</a>
      </div>
      {businesses.map((biz) => (
        <div key={biz.id} className="business-card" id={`business-${biz.id}`}>
          <div className="business-image">
            <img src={biz.image} alt={biz.name} />
          </div>
          <div className="business-info">
            <h3>{biz.name}</h3>
            <div className="business-type">{biz.type}</div>
            <div className="business-rating">
              <StarRating rating={biz.rating} />
              <span className="rating-number">{biz.rating}</span>
              <span className="review-count">({biz.reviews} reviews)</span>
            </div>
            <div className="business-address">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
              {biz.address}
            </div>
            <p className="business-description">{biz.description}</p>
            <button className="btn-view-business" id={`view-business-${biz.id}`}>View Business</button>
          </div>
        </div>
      ))}
    </section>
  );
}
