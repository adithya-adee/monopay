import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useSolanaBalance } from '../hooks/useSolanaBalance';
import { useWallet } from '@solana/wallet-adapter-react';

export default function BalanceCard() {
  const [showBalance, setShowBalance] = useState(true);
  const { balance, loading } = useSolanaBalance();
  const { connected, publicKey } = useWallet();

  const short = publicKey
    ? `${publicKey.toBase58().slice(0, 6)}…${publicKey.toBase58().slice(-6)}`
    : null;

  return (
    <div style={{
      background: 'linear-gradient(145deg, #18182c, #0f0f1e)',
      borderRadius: '24px',
      padding: '28px 28px 24px',
      position: 'relative',
      overflow: 'hidden',
      border: '1px solid rgba(255,255,255,0.05)',
      boxShadow: '0 20px 48px rgba(0,0,0,0.4)',
    }}>
      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '-50px', right: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'var(--accent-primary)', opacity: 0.08, filter: 'blur(40px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-30px', left: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: '#6366f1', opacity: 0.08, filter: 'blur(32px)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Row 1: label + eye toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Balance</span>
            {short && (
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontFamily: 'monospace' }}>{short}</div>
            )}
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="btn-icon"
            style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '50%', width: '38px', height: '38px' }}
          >
            {showBalance ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </div>

        {/* Row 2: Amount */}
        <div style={{ marginBottom: '6px' }}>
          <span style={{ fontSize: '42px', fontWeight: '700', letterSpacing: '-2px', lineHeight: 1 }}>
            {!connected
              ? '––'
              : showBalance
                ? (loading ? '···' : balance.toFixed(4))
                : '●●●●●'}
          </span>
          {connected && showBalance && (
            <span style={{ fontSize: '20px', color: 'var(--text-muted)', fontWeight: 500, marginLeft: '8px' }}>SOL</span>
          )}
        </div>

        {/* Row 3: sub-label */}
        <p style={{ fontSize: '13px', color: '#475569', marginBottom: '28px', minHeight: '18px' }}>
          {!connected
            ? 'Connect a wallet to view balance'
            : loading
              ? 'Refreshing wallet balance…'
              : 'Solana Devnet'}
        </p>
      </div>
    </div>
  );
}
