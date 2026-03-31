'use client';

export default function BusinessMenuPreview({ business, setActiveTab }) {
  const menuItems = business.menuItems || [];
  
  // Group menu items by category
  const groupedItems = menuItems.reduce((acc, item) => {
    const cat = item.category || 'Main Menu';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  // For preview, we want to take up to 10 items from each category
  const categoriesToPreview = Object.keys(groupedItems);
  const hasMultipleCategories = categoriesToPreview.length > 1;

  return (
    <div className="business-menu-preview">
      <section className="overview-section" id="menu-preview">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0f172a', margin: 0 }}>Menu</h2>
        </div>
        
        {menuItems.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {categoriesToPreview.map(categoryName => {
              const previewItems = groupedItems[categoryName].slice(0, 10);
              
              return (
                <div key={categoryName} className="menu-category-group">
                  {hasMultipleCategories && (
                    <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#334155', marginBottom: '16px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
                      {categoryName}
                    </h3>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {previewItems.map((item, idx) => (
                      <div key={idx} style={{ 
                        padding: '16px', 
                        background: '#fff', 
                        borderRadius: '8px', 
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <h4 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0f172a', margin: 0 }}>{item.name}</h4>
                          {item.price && (
                            <span style={{ fontSize: '1.05rem', fontWeight: '600', color: '#0d7377' }}>
                              {String(item.price).startsWith('$') ? item.price : `$${item.price}`}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p style={{ fontSize: '0.95rem', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{item.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: '#64748b', fontSize: '1rem', marginTop: '16px' }}>
            {business.menuAbout || business.about || business.description || 'Menu information available.'}
          </p>
        )}

        {(menuItems.length > 0 || business.menuImages?.length > 0) && (
          <button 
            onClick={() => setActiveTab('FullMenu')} 
            className="btn-see-more"
            style={{ marginTop: '24px' }}
          >
            See full menu
          </button>
        )}
      </section>
    </div>
  );
}
