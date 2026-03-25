import { ArrowLeft, ExternalLink, Loader2 } from 'lucide-react';
import TxHistory from './TxHistory';
import { useWallet } from '@solana/wallet-adapter-react';

export default function TransactionsPage() {
  const { publicKey } = useWallet();

  return (
    <div className="fade-in" style={{
      maxWidth: '700px',
      margin: '0 auto',
      padding: '48px 24px 64px',
      width: '100%',
    }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '6px' }}>Transaction History</h1>
        {publicKey && (
          <a
            href={`https://explorer.solana.com/address/${publicKey.toBase58()}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'none',
              transition: 'color 0.15s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.color = 'var(--text-main)'; }}
            onMouseOut={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            View on Solana Explorer <ExternalLink size={13} />
          </a>
        )}
      </div>

      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '20px',
        border: '1px solid var(--border-color)',
        padding: '24px',
      }}>
        <TxHistory />
      </div>
    </div>
  );
}
