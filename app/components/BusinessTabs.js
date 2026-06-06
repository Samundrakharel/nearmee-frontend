'use client';

import { usePathname } from 'next/navigation';

const TABS = [
  { label: 'Overview', path: '' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Menu', path: '/menu' },
  { label: 'Photos', path: '/photos' },
];

export default function BusinessTabs({ activeTab }) {
  const pathname = usePathname();

  // Derive the base path (e.g. "/business/pizza-hut" or just "" for subdomain routing)
  // If pathname is something like "/menu", "/reviews", "/photos", or "/",
  // the base is everything before the tab segment.
  const basePath = pathname
    .replace(/\/(menu|reviews|photos)\/?$/, '')
    .replace(/\/$/, '') || '';

  return (
    <div className="business-tabs-container" style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
      <div className="container">
        <div style={{ 
          display: 'flex', 
          gap: '32px', 
          overflowX: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          padding: '16px 0',
        }}>
          <style>{`
            .business-tabs-container ::-webkit-scrollbar { display: none; }
            .tab-link {
              background: none;
              border: none;
              padding: 0;
              cursor: pointer;
              font-size: 1rem;
              font-weight: 500;
              color: #64748b;
              text-decoration: underline;
              text-decoration-color: transparent;
              text-underline-offset: 3px;
              white-space: nowrap;
              transition: color 0.15s ease, text-decoration-color 0.15s ease;
            }
            .tab-link:hover {
              color: #3B82F6;
              text-decoration-color: #3B82F6;
            }
            .tab-link.active {
              color: #1e293b;
              font-weight: 600;
              text-decoration-color: #1e293b;
            }
          `}</style>
          {TABS.map((tab) => (
            <a
              key={tab.label}
              href={`${basePath}${tab.path}` || '/'}
              className={`tab-link ${activeTab === tab.label ? 'active' : ''}`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
