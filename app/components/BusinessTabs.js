'use client';

export default function BusinessTabs({ activeTab, setActiveTab }) {
  const tabs = ['Overview', 'Reviews', 'Menu', 'Photos'];

  return (
    <div className="business-tabs-container">
      <div className="container">
        <div className="business-tabs" style={{ 
          display: 'flex', 
          gap: '32px', 
          overflowX: 'auto', 
          scrollbarWidth: 'none', 
          msOverflowStyle: 'none',
          padding: '0 4px'
        }}>
          <style>{`
            .business-tabs::-webkit-scrollbar { display: none; }
            .tab-item { transition: var(--transition-smooth); white-space: nowrap; }
            .tab-item:hover { color: var(--color-primary); }
            .tab-item.active { color: var(--color-primary); font-weight: 700; }
            .tab-item.active::after { 
              content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 3px; 
              background: var(--color-primary); border-radius: 3px 3px 0 0;
            }
          `}</style>
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
              style={{ background: 'none', border: 'none', padding: '20px 0', cursor: 'pointer', fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-medium)', position: 'relative' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
