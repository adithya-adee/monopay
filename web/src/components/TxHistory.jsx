import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { ExternalLink } from 'lucide-react';

export default function TxHistory() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!publicKey) {
      setTransactions([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        // Fetch last 10 transactions
        const sigs = await connection.getSignaturesForAddress(publicKey, { limit: 10 });
        setTransactions(sigs);
      } catch (e) {
        console.error("Failed to fetch history", e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    
    // Periodically refresh (simple polling)
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, [publicKey, connection]);

  if (!publicKey) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>Connect wallet to view transactions</div>;
  }

  if (loading && transactions.length === 0) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>Loading transactions...</div>;
  }

  if (transactions.length === 0) {
    return <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0', fontSize: '14px' }}>No recent transactions found</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {transactions.map((tx) => (
        <a 
          key={tx.signature} 
          href={`https://explorer.solana.com/tx/${tx.signature}?cluster=devnet`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '16px', 
            background: 'var(--bg-input)', 
            borderRadius: '16px',
            textDecoration: 'none',
            color: 'var(--text-main)',
            border: '1px solid transparent',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--text-muted)'; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: '500', marginBottom: '4px' }}>
              {tx.err ? 'Failed Transaction' : 'Transaction'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {new Date(tx.blockTime * 1000).toLocaleString()}
            </div>
          </div>
          <div style={{ color: tx.err ? 'var(--accent-error)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>{tx.signature.slice(0, 4)}...{tx.signature.slice(-4)}</span>
            <ExternalLink size={14} />
          </div>
        </a>
      ))}
    </div>
  );
}
