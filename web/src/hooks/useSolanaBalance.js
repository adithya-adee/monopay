import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export function useSolanaBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let subscriptionId = null;

    const fetchBalance = async () => {
      if (!publicKey) {
        setBalance(0);
        return;
      }
      
      try {
        setLoading(true);
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (e) {
        console.error("Failed to fetch balance", e);
      } finally {
        setLoading(false);
      }
    };

    if (publicKey) {
      fetchBalance();
      
      // Subscribe to balance changes
      subscriptionId = connection.onAccountChange(
        publicKey,
        (accountInfo) => {
          setBalance(accountInfo.lamports / LAMPORTS_PER_SOL);
        },
        'confirmed'
      );
    }

    return () => {
      if (subscriptionId) {
        connection.removeAccountChangeListener(subscriptionId);
      }
    };
  }, [publicKey, connection]);

  return { balance, loading, publicKey };
}
