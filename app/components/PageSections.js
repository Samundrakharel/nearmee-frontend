import Link from 'next/link';

/**
 * Renders the ordered sections of an admin-managed Page (see core.models.Page).
 *
 * Layouts map onto the CSS already in globals.css:
 *   prose  → heading plus paragraphs, constrained width
 *   cards  → responsive grid of Section Items
 *   steps  → numbered Section Items
 *   cta    → centred text plus a button
 *
 * An unknown layout falls back to prose rather than rendering nothing, so
 * adding a layout choice in Django cannot blank out a live page.
 */
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

    if (section.layout === 'cards' || section.layout === 'steps') {
      const isSteps = section.layout === 'steps';
      return (
        <section className={className} key={section.id}>
          <div className="container">
            {section.heading && <h2 style={{ textAlign: 'center' }}>{section.heading}</h2>}
            {paragraphs.map((text, i) => (
              <p key={i} style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 16px' }}>
                {text}
              </p>
            ))}
            <div className={isSteps ? 'static-steps' : 'static-grid'}>
              {items.map((item, i) => (
                <div className={isSteps ? 'static-step' : 'static-card'} key={item.id}>
                  {isSteps && <div className="static-step-num">{i + 1}</div>}
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
        <section className={className} key={section.id}>
          <div className="container static-narrow" style={{ textAlign: 'center' }}>
            {section.heading && <h2>{section.heading}</h2>}
            {paragraphs.map((text, i) => <p key={i}>{text}</p>)}
            {section.cta_label && section.cta_url && (
              <Link href={section.cta_url} className="btn-cta">
                {section.cta_label}
              </Link>
            )}
          </div>
        </section>
      );
    }

    // prose, and anything unrecognised
    return (
      <section className={className} key={section.id}>
        <div className="container static-narrow">
          {section.heading && <h2>{section.heading}</h2>}
          {paragraphs.map((text, i) => <p key={i}>{text}</p>)}
        </div>
      </section>
    );
  });
}
