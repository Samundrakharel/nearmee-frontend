import { LoadingIcon } from './components/LoadingIcon';

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '40px', color: '#64748b' }}>
      <div style={{ color: '#3B82F6' }}><LoadingIcon size={48} /></div>
      <div style={{ marginTop: '16px', fontSize: '1.2rem', fontWeight: '500' }}>Almost there…</div>
    </div>
  );
}
