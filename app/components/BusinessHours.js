'use client';

export default function BusinessHours({ business }) {
  const hours = business.hours || [];

  return (
    <div className="business-hours-tab">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>Opening Hours</h2>
      <div className="hours-container" style={{
        maxWidth: '400px',
        margin: '0 auto',
        background: '#fff',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden'
      }}>
        {hours.map((item, index) => (
          <div
            key={item.day}
            className={`hours-row ${item.current ? 'current-day' : ''}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: index < hours.length - 1 ? '1px solid var(--color-border)' : 'none',
              background: item.current ? '#f0f9fa' : 'transparent',
              color: item.current ? '#0d7377' : 'inherit'
            }}
          >
            <span style={{ fontWeight: item.current ? '700' : '600' }}>{item.day}</span>
            <span style={{ color: item.current ? '#0d7377' : 'var(--color-text-medium)' }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
