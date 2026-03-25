import { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { X } from 'lucide-react';
import { useSolanaBalance } from '../hooks/useSolanaBalance';
import PinLogin from './PinLogin';

export default function SendModal({ onClose }) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { balance } = useSolanaBalance();

  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('idle'); // idle | pin | loading | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [txSignature, setTxSignature] = useState('');

  const initiateSend = (e) => {
    e.preventDefault();
    if (!publicKey) return;

    // Validate first before asking for PIN
    try {
      const parsedAmount = parseFloat(amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) throw new Error("Invalid amount");
      if (parsedAmount > balance) throw new Error("Insufficient funds");
      new PublicKey(recipient); // validate address
      
      setStatus('pin'); // Trigger PIN screen instead of direct sending
    } catch (error) {
      setErrorMsg(error?.message || 'Invalid input.');
      setStatus('error');
    }
  };

  const executeSend = async () => {
    setStatus('loading');
    setErrorMsg('');

    try {
      const recipientPubKey = new PublicKey(recipient);
      const parsedAmount = parseFloat(amount);

      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error("Invalid amount");
      }
      if (parsedAmount > balance) {
        throw new Error("Insufficient funds");
      }

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubKey,
          lamports: parsedAmount * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      
      // Optionally wait for confirmation, but for better UX we just show the signature immediately
      // await connection.confirmTransaction(signature, 'processed');

      setTxSignature(signature);
      setStatus('success');
    } catch (error) {
      console.error("Send failed:", error);
      setStatus('error');
      setErrorMsg(error?.message || 'Transaction failed. Check console.');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(10, 10, 15, 0.8)',
      backdropFilter: 'blur(8px)',
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="slide-up" style={{
        background: 'var(--bg-card)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>Send SOL</h3>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          {status === 'success' ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
              <h4 style={{ fontSize: '20px', marginBottom: '8px' }}>Sent Successfully</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                Your transaction has been submitted to Devnet.
              </p>
              <a 
                href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ textDecoration: 'none', marginBottom: '12px', width: '100%' }}
              >
                View on Explorer
              </a>
              <button className="btn-primary" onClick={onClose} style={{ width: '100%' }}>Done</button>
            </div>
          ) : status === 'pin' ? (
            <PinLogin onLogin={executeSend} isModal={true} />
          ) : (
            <form onSubmit={initiateSend}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>Recipient Address (Devnet)</label>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Paste Solana address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Amount (SOL)</label>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Max: {balance.toFixed(4)}</span>
                </div>
                <input 
                  type="number" 
                  step="any"
                  className="input-field" 
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ fontSize: '24px', fontWeight: 'bold' }}
                />
              </div>

              {status === 'error' && (
                <div style={{ color: 'var(--accent-error)', fontSize: '14px', marginBottom: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                  {errorMsg}
                </div>
              )}

              <button 
                type="submit" 
                className="btn-primary" 
                disabled={status === 'loading'}
                style={{ width: '100%' }}
              >
                {status === 'loading' ? 'Sending...' : 'Confirm Send'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
