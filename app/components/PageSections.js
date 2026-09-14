import Link from 'next/link';

/**
 * Context-aware icons for section cards based on heading or keyword
 */
const CARD_ICONS = {
  trust: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  local: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  reviews: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  free: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  useful: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  ),
  honest: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" y1="9" x2="9.01" y2="9" />
      <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
  ),
  sparkle: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
};

function getCardIcon(heading = '', id = '') {
  const text = `${heading} ${id}`.toLowerCase();
  if (text.includes('trust') || text.includes('security') || text.includes('verify')) return CARD_ICONS.trust;
  if (text.includes('local') || text.includes('where') || text.includes('map') || text.includes('reach')) return CARD_ICONS.local;
  if (text.includes('review') || text.includes('star') || text.includes('rating') || text.includes('visit')) return CARD_ICONS.reviews;
  if (text.includes('free') || text.includes('cost') || text.includes('owner') || text.includes('listing')) return CARD_ICONS.free;
  if (text.includes('useful') || text.includes('clever') || text.includes('smart') || text.includes('idea')) return CARD_ICONS.useful;
  if (text.includes('honest') || text.includes('values') || text.includes('integrity') || text.includes('stand')) return CARD_ICONS.honest;
  return CARD_ICONS.sparkle;
}

export default function PageSections({ sections }) {
  if (!sections?.length) return null;

  return sections.map((section) => {
    const className = `static-section${section.tinted ? ' tinted' : ''}`;
    const paragraphs = section.paragraphs?.length
      ? section.paragraphs
      : section.body
        ? [section.body]
        : [];
    const items = section.items || [];

    if (section.layout === 'cards') {
      return (
        <section className={className} key={section.id || section.heading}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 40px' }}>
              <span className="static-section-badge">Features & Values</span>
              {section.heading && <h2>{section.heading}</h2>}
              {paragraphs.map((text, i) => (
                <p key={i} style={{ fontSize: '1.1rem', color: 'var(--color-text-medium)', margin: 0 }}>
                  {text}
                </p>
              ))}
            </div>

            <div className="static-grid">
              {items.map((item) => (
                <div className="static-card" key={item.id || item.heading}>
                  <div className="static-card-icon">
                    {getCardIcon(item.heading, item.id)}
                  </div>
                  <h3>{item.heading}</h3>
                  {item.body && <p>{item.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section.layout === 'steps') {
      return (
        <section className={className} key={section.id || section.heading}>
          <div className="container">
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 36px' }}>
              <span className="static-section-badge">Simple Process</span>
              {section.heading && <h2>{section.heading}</h2>}
              {paragraphs.map((text, i) => (
                <p key={i} style={{ fontSize: '1.1rem', color: 'var(--color-text-medium)', margin: 0 }}>
                  {text}
                </p>
              ))}
            </div>

            <div className="static-steps">
              {items.map((item, i) => (
                <div className="static-step" key={item.id || item.heading}>
                  <div className="static-step-num">{i + 1}</div>
                  <h3>{item.heading}</h3>
                  {item.body && <p>{item.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }

    if (section.layout === 'cta') {
      return (
        <section className={className} key={section.id || section.heading}>
          <div className="container">
            <div className="static-cta-box">
              {section.heading && <h2>{section.heading}</h2>}
              {paragraphs.map((text, i) => <p key={i}>{text}</p>)}
              {section.cta_label && section.cta_url && (
                <Link href={section.cta_url} className="btn-cta-light">
                  {section.cta_label}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </section>
      );
    }

    // prose layout
    return (
      <section className={className} key={section.id || section.heading}>
        <div className="container static-prose-wrap">
          <div className="static-prose-card">
            {section.heading && (
              <div style={{ marginBottom: '24px' }}>
                <span className="static-section-badge">Our Story</span>
                <h2>{section.heading}</h2>
              </div>
            )}
            {paragraphs.map((text, i) => <p key={i}>{text}</p>)}
          </div>
        </div>
      </section>
    );
  });
}

