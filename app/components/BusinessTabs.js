'use client';

export default function BusinessTabs({ activeTab, setActiveTab }) {
  const tabs = ['Overview', 'Reviews', 'Menu', 'Photos'];

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
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
