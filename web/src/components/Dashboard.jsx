import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { ArrowUpRight, ArrowDownLeft, Clock, Wallet } from 'lucide-react';
import BalanceCard from './BalanceCard';
import SendModal from './SendModal';

export default function Dashboard({ setPage }) {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const [showSendModal, setShowSendModal] = useState(false);

  return (
    <div className="fade-in" style={{
      maxWidth: '520px',
      margin: '0 auto',
      padding: '48px 24px 64px',
      width: '100%',
    }}>

      {/* Balance */}
      <BalanceCard />

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '24px 0' }}>
        {connected ? (
          <>
            <button
              onClick={() => setShowSendModal(true)}
              className="btn-primary"
              style={{ padding: '16px', borderRadius: '16px', fontSize: '15px' }}
            >
              <ArrowUpRight size={18} /> Send
            </button>
            <button
              className="btn-secondary"
              style={{ padding: '16px', borderRadius: '16px', fontSize: '15px' }}
            >
              <ArrowDownLeft size={18} /> Request
            </button>
          </>
        ) : (
          <button
            onClick={() => setVisible(true)}
            className="btn-primary"
            style={{ gridColumn: '1/-1', padding: '18px', borderRadius: '16px', fontSize: '15px' }}
          >
            <Wallet size={18} /> Connect Wallet to Start
          </button>
        )}
      </div>

      {/* Quick link to transactions */}
      {connected && (
        <button
          onClick={() => setPage('transactions')}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            color: 'var(--text-main)',
            cursor: 'pointer',
            transition: 'border-color 0.2s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = '#334155'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', fontWeight: '500' }}>
            <Clock size={18} color="var(--text-muted)" /> Transaction History
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '18px' }}>›</span>
        </button>
      )}

      {showSendModal && <SendModal onClose={() => setShowSendModal(false)} />}
    </div>
  );
}
