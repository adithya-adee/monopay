import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Clock, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar({ page, setPage }) {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const short = publicKey
    ? `${publicKey.toBase58().slice(0, 4)}...${publicKey.toBase58().slice(-4)}`
    : null;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      background: 'rgba(10,10,15,0.88)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-color)',
    }}>
      <div style={{
        maxWidth: '1100px', margin: '0 auto',
        padding: '0 32px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* Left: Logo + Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div
            onClick={() => setPage('home')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <img
              src="/monopay-logo.png"
              alt="MonoPay"
              style={{ height: '30px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span style={{
              fontSize: '18px', fontWeight: '700',
              background: 'linear-gradient(135deg, #4ade80, #22c55e)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>MonoPay</span>
            <span style={{
              fontSize: '10px', fontWeight: '600', padding: '2px 7px', borderRadius: '99px',
              background: 'rgba(74,222,128,0.1)', color: '#4ade80',
              border: '1px solid rgba(74,222,128,0.25)',
            }}>DEVNET</span>
          </div>

          {/* Nav links */}
          <div style={{ display: 'flex', gap: '4px' }}>
            {[
              { id: 'home', label: 'Home' },
              { id: 'transactions', label: 'Transactions', icon: <Clock size={14} /> },
            ].map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setPage(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '8px',
                  border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                  fontFamily: 'Inter, sans-serif',
                  background: page === id ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: page === id ? 'var(--text-main)' : 'var(--text-muted)',
                  transition: 'all 0.15s',
                }}
                onMouseOver={(e) => { if (page !== id) e.currentTarget.style.color = 'var(--text-main)'; }}
                onMouseOut={(e) => { if (page !== id) e.currentTarget.style.color = 'var(--text-muted)'; }}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Wallet */}
        {connected ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '7px 14px', borderRadius: '99px',
              background: 'rgba(74,222,128,0.07)',
              border: '1px solid rgba(74,222,128,0.2)',
            }}>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
              <span style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0', fontFamily: 'monospace' }}>{short}</span>
            </div>
            <button
              onClick={disconnect}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 13px', borderRadius: '99px',
                background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444', fontSize: '13px', fontWeight: '500',
                cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'Inter, sans-serif',
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.14)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
            >
              <LogOut size={14} /> Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => setVisible(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 20px', borderRadius: '99px',
              background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
              border: 'none', color: '#fff',
              fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 4px 14px rgba(124,58,237,0.3)',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(124,58,237,0.4)'; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(124,58,237,0.3)'; }}
          >
            Connect Wallet <ChevronDown size={15} />
          </button>
        )}
      </div>
    </nav>
  );
}
