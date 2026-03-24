'use client';

export default function BusinessTabs({ activeTab, setActiveTab }) {
  const tabs = ['Overview', 'Reviews', 'Menu', 'Photos'];

  return (
    <div className="business-tabs-container">
      <div className="container">
        <div className="business-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-item ${activeTab === tab ? 'active' : ''}`}
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
